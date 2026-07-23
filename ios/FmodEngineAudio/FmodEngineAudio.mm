#import "FmodEngineAudio.h"

#import <Foundation/Foundation.h>
#include <mutex>
#include "fmod.hpp"
#include "fmod_studio.hpp"

@implementation FmodEngineAudio {
  FMOD::Studio::System *_studioSystem;
  FMOD::Studio::EventInstance *_engineEvent;
  std::mutex _audioMutex;
}

RCT_EXPORT_MODULE(FmodEngineAudio)

+ (BOOL)requiresMainQueueSetup {
  return NO;
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

  NSArray<NSString *> *banks =
      @[@"Master", @"Master.strings", @"Vehicles"];
  for (NSString *bankName in banks) {
    if (result != FMOD_OK) {
      break;
    }
    NSString *path =
        [[NSBundle mainBundle] pathForResource:bankName ofType:@"bank"];
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
  resolve(nil);
}

@end
