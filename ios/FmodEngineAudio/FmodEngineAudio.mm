#import "FmodEngineAudio.h"

#import <AVFoundation/AVFoundation.h>
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#include <mutex>
#include "fmod.hpp"
#include "fmod_studio.hpp"

@interface FmodEngineAudio ()
- (void)registerAudioSessionObservers;
- (void)unregisterAudioSessionObservers;
- (void)suspendMixer;
- (void)resumeMixer;
@end

@implementation FmodEngineAudio {
  FMOD::Studio::System *_studioSystem;
  FMOD::Studio::EventInstance *_engineEvent;
  std::mutex _audioMutex;
  NSMutableArray<id> *_audioSessionObservers;
  BOOL _mixerSuspended;
  BOOL _needsMixerReset;
}

RCT_EXPORT_MODULE(FmodEngineAudio)

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (dispatch_queue_t)methodQueue {
  // FMOD requires every mixer suspend/resume pair to run on the same thread.
  return dispatch_get_main_queue();
}

- (void)registerAudioSessionObservers {
  if (_audioSessionObservers.count > 0) {
    return;
  }

  _audioSessionObservers = [NSMutableArray array];
  NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
  __weak FmodEngineAudio *weakSelf = self;

  id interruption = [center
      addObserverForName:AVAudioSessionInterruptionNotification
                  object:nil
                   queue:[NSOperationQueue mainQueue]
              usingBlock:^(NSNotification *notification) {
                FmodEngineAudio *strongSelf = weakSelf;
                if (strongSelf == nil) {
                  return;
                }
                AVAudioSessionInterruptionType type =
                    (AVAudioSessionInterruptionType)[notification.userInfo[
                        AVAudioSessionInterruptionTypeKey] unsignedIntegerValue];
                if (type == AVAudioSessionInterruptionTypeBegan) {
                  [strongSelf suspendMixer];
                  return;
                }

                NSError *error = nil;
                if ([[AVAudioSession sharedInstance] setActive:YES error:&error]) {
                  [strongSelf resumeMixer];
                }
              }];
  [_audioSessionObservers addObject:interruption];

  id becameActive = [center
      addObserverForName:UIApplicationDidBecomeActiveNotification
                  object:nil
                   queue:[NSOperationQueue mainQueue]
              usingBlock:^(__unused NSNotification *notification) {
                FmodEngineAudio *strongSelf = weakSelf;
                if (strongSelf == nil) {
                  return;
                }
                NSError *error = nil;
                if (![[AVAudioSession sharedInstance] setActive:YES error:&error]) {
                  return;
                }
                if (strongSelf->_needsMixerReset) {
                  [strongSelf suspendMixer];
                }
                [strongSelf resumeMixer];
                strongSelf->_needsMixerReset = NO;
              }];
  [_audioSessionObservers addObject:becameActive];

  id mediaReset = [center
      addObserverForName:AVAudioSessionMediaServicesWereResetNotification
                  object:nil
                   queue:[NSOperationQueue mainQueue]
              usingBlock:^(__unused NSNotification *notification) {
                FmodEngineAudio *strongSelf = weakSelf;
                if (strongSelf == nil) {
                  return;
                }
                if ([UIApplication sharedApplication].applicationState ==
                        UIApplicationStateBackground ||
                    strongSelf->_mixerSuspended) {
                  strongSelf->_needsMixerReset = YES;
                  return;
                }
                [strongSelf suspendMixer];
                [strongSelf resumeMixer];
              }];
  [_audioSessionObservers addObject:mediaReset];
}

- (void)unregisterAudioSessionObservers {
  NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
  for (id observer in _audioSessionObservers) {
    [center removeObserver:observer];
  }
  [_audioSessionObservers removeAllObjects];
  _audioSessionObservers = nil;
  _mixerSuspended = NO;
  _needsMixerReset = NO;
}

- (void)suspendMixer {
  std::lock_guard<std::mutex> lock(_audioMutex);
  if (_studioSystem == nullptr || _mixerSuspended) {
    return;
  }

  FMOD::System *coreSystem = nullptr;
  if (_studioSystem->getCoreSystem(&coreSystem) == FMOD_OK &&
      coreSystem->mixerSuspend() == FMOD_OK) {
    _mixerSuspended = YES;
  }
}

- (void)resumeMixer {
  std::lock_guard<std::mutex> lock(_audioMutex);
  if (_studioSystem == nullptr || !_mixerSuspended) {
    return;
  }

  FMOD::System *coreSystem = nullptr;
  if (_studioSystem->getCoreSystem(&coreSystem) == FMOD_OK &&
      coreSystem->mixerResume() == FMOD_OK) {
    _mixerSuspended = NO;
  }
}

RCT_REMAP_METHOD(initialize,
                 initializeWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  std::lock_guard<std::mutex> lock(_audioMutex);
  if (_studioSystem != nullptr) {
    resolve(nil);
    return;
  }

  FMOD_RESULT result = FMOD::Studio::System::create(&_studioSystem);
  if (result == FMOD_OK) {
    result = _studioSystem->initialize(
        64, FMOD_STUDIO_INIT_NORMAL, FMOD_INIT_NORMAL, nullptr);
  }

  NSBundle *classBundle = [NSBundle bundleForClass:[FmodEngineAudio class]];
  NSURL *resourceBundleURL =
      [classBundle URLForResource:@"FmodEngineAudioResources"
                    withExtension:@"bundle"];
  if (resourceBundleURL == nil) {
    resourceBundleURL =
        [[NSBundle mainBundle] URLForResource:@"FmodEngineAudioResources"
                               withExtension:@"bundle"];
  }
  NSBundle *resourceBundle =
      resourceBundleURL == nil ? nil : [NSBundle bundleWithURL:resourceBundleURL];

  NSArray<NSString *> *banks =
      @[@"Master", @"Master.strings", @"Vehicles"];
  for (NSString *bankName in banks) {
    if (result != FMOD_OK) {
      break;
    }
    NSString *path =
        [resourceBundle pathForResource:bankName ofType:@"bank"];
    if (path == nil) {
      result = FMOD_ERR_FILE_NOTFOUND;
      break;
    }
    FMOD::Studio::Bank *bank = nullptr;
    result = _studioSystem->loadBankFile(
        path.UTF8String, FMOD_STUDIO_LOAD_BANK_NORMAL, &bank);
  }

  if (result != FMOD_OK) {
    if (_studioSystem != nullptr) {
      _studioSystem->release();
      _studioSystem = nullptr;
    }
    reject(@"FMOD_INIT_FAILED",
           [NSString stringWithFormat:@"FMOD result %d", result], nil);
    return;
  }
  [self registerAudioSessionObservers];
  resolve(nil);
}

RCT_REMAP_METHOD(startEngineEvent,
                 startEngineEventAtPath:(NSString *)eventPath
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  std::lock_guard<std::mutex> lock(_audioMutex);
  if (_studioSystem == nullptr) {
    reject(@"FMOD_UNINITIALIZED", @"FMOD has not been initialized", nil);
    return;
  }

  if (_engineEvent != nullptr) {
    _engineEvent->stop(FMOD_STUDIO_STOP_IMMEDIATE);
    _engineEvent->release();
    _engineEvent = nullptr;
  }

  FMOD::Studio::EventDescription *description = nullptr;
  FMOD_RESULT result =
      _studioSystem->getEvent(eventPath.UTF8String, &description);
  if (result == FMOD_OK) {
    result = description->createInstance(&_engineEvent);
  }
  if (result == FMOD_OK) {
    result = _engineEvent->start();
  }
  _studioSystem->update();

  if (result == FMOD_OK) {
    resolve(nil);
  } else {
    reject(@"FMOD_EVENT_FAILED",
           [NSString stringWithFormat:@"FMOD result %d", result], nil);
  }
}

RCT_EXPORT_METHOD(setRpm:(double)rpm) {
  std::lock_guard<std::mutex> lock(_audioMutex);
  if (_engineEvent != nullptr && _studioSystem != nullptr) {
    _engineEvent->setParameterByName("RPM", (float)MAX(0, rpm), false);
    _studioSystem->update();
  }
}

RCT_EXPORT_METHOD(triggerCue:(NSString *)cue) {
  // The temporary FMOD example Vehicles bank has no one-shot shift cues.
  // Custom grind/jerk/stall events will be added with the project bank.
  (void)cue;
}

RCT_REMAP_METHOD(stop,
                 stopWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  // Resume first so no FMOD API runs between a suspend/resume pair.
  [self resumeMixer];
  std::lock_guard<std::mutex> lock(_audioMutex);
  if (_engineEvent != nullptr) {
    _engineEvent->stop(FMOD_STUDIO_STOP_ALLOWFADEOUT);
    _engineEvent->release();
    _engineEvent = nullptr;
  }
  if (_studioSystem != nullptr) {
    _studioSystem->update();
    _studioSystem->release();
    _studioSystem = nullptr;
  }
  [self unregisterAudioSessionObservers];
  resolve(nil);
}

@end
