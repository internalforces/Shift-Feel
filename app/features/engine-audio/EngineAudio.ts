import { NativeModules, Platform } from 'react-native';

import type { Feedback } from '../engine-sim/simulation';

export type EngineAudioCue = 'grind' | 'jerk' | 'stalled';

interface FmodEngineAudioModule {
  initialize(): Promise<void>;
  startEngineEvent(eventPath: string): Promise<void>;
  setRpm(rpm: number): void;
  triggerCue(cue: EngineAudioCue): void;
  stop(): Promise<void>;
}

const nativeModule = NativeModules.FmodEngineAudio as
  | FmodEngineAudioModule
  | undefined;

const ENGINE_EVENT_PATH = 'event:/Vehicles/Car Engine';

let initialized = false;
let lastFeedback: Feedback | null = null;

/** Starts the default FMOD engine event. Safe to call repeatedly. */
export async function startEngineAudio(): Promise<boolean> {
  if (!nativeModule) {
    if (__DEV__) {
      console.warn(`FmodEngineAudio is unavailable on ${Platform.OS}`);
    }
    return false;
  }

  if (!initialized) {
    try {
      await nativeModule.initialize();
      await nativeModule.startEngineEvent(ENGINE_EVENT_PATH);
      initialized = true;
    } catch (error) {
      if (__DEV__) {
        console.warn('FMOD engine audio failed to start', error);
      }
      return false;
    }
  }
  return true;
}

/** Sends the latest simulation RPM to FMOD's continuous RPM parameter. */
export function syncEngineAudio(rpm: number, feedback: Feedback): void {
  if (!nativeModule || !initialized) {
    return;
  }

  nativeModule.setRpm(Math.max(0, rpm));
  if (feedback !== lastFeedback && isAudioCue(feedback)) {
    nativeModule.triggerCue(feedback);
  }
  lastFeedback = feedback;
}

/** Stops audio and resets facade state for an app/session restart. */
export async function stopEngineAudio(): Promise<void> {
  if (nativeModule && initialized) {
    await nativeModule.stop();
  }
  initialized = false;
  lastFeedback = null;
}

function isAudioCue(feedback: Feedback): feedback is EngineAudioCue {
  return feedback === 'grind' || feedback === 'jerk' || feedback === 'stalled';
}
