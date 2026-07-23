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
let lifecycleVersion = 0;
let startPromise: Promise<boolean> | null = null;
let pendingRpm = 0;
let pendingFeedback: Feedback | null = null;
let lastFeedback: Feedback | null = null;

/** Starts the default FMOD engine event. Concurrent callers share one startup. */
export async function startEngineAudio(): Promise<boolean> {
  if (!nativeModule) {
    if (__DEV__) {
      console.warn(`FmodEngineAudio is unavailable on ${Platform.OS}`);
    }
    return false;
  }

  if (initialized) {
    return true;
  }
  if (startPromise) {
    return startPromise;
  }

  const requestedVersion = lifecycleVersion;
  const pendingStart = (async () => {
    try {
      await nativeModule.initialize();
      await nativeModule.startEngineEvent(ENGINE_EVENT_PATH);

      if (requestedVersion !== lifecycleVersion) {
        await nativeModule.stop();
        return false;
      }

      initialized = true;
      flushPendingState();
      return true;
    } catch (error) {
      initialized = false;
      if (__DEV__) {
        console.warn('FMOD engine audio failed to start', error);
      }
      return false;
    } finally {
      if (startPromise === pendingStart) {
        startPromise = null;
      }
    }
  })();

  startPromise = pendingStart;
  return pendingStart;
}

/** Stores and sends the latest continuous simulation state. */
export function syncEngineAudio(rpm: number, feedback: Feedback): void {
  pendingRpm = Math.max(0, rpm);
  pendingFeedback = feedback;

  if (!nativeModule || !initialized) {
    return;
  }

  nativeModule.setRpm(pendingRpm);
  if (feedback === 'stalled' && lastFeedback !== 'stalled') {
    nativeModule.triggerCue('stalled');
  }
  lastFeedback = feedback;
}

/** Emits every discrete shift attempt, including repeated equal outcomes. */
export function triggerShiftAudioCue(feedback: Feedback): void {
  if (
    nativeModule &&
    initialized &&
    (feedback === 'grind' || feedback === 'jerk')
  ) {
    nativeModule.triggerCue(feedback);
  }
}

/** Cancels in-flight startup, stops native audio, and resets facade state. */
export async function stopEngineAudio(): Promise<void> {
  lifecycleVersion += 1;
  initialized = false;
  lastFeedback = null;
  pendingFeedback = null;
  pendingRpm = 0;

  const pendingStart = startPromise;
  if (pendingStart) {
    await pendingStart;
  }

  if (nativeModule) {
    try {
      await nativeModule.stop();
    } catch (error) {
      if (__DEV__) {
        console.warn('FMOD engine audio failed to stop', error);
      }
    }
  }
}

function flushPendingState(): void {
  if (!nativeModule || !initialized) {
    return;
  }

  nativeModule.setRpm(pendingRpm);
  if (pendingFeedback === 'stalled') {
    nativeModule.triggerCue('stalled');
  }
  lastFeedback = pendingFeedback;
}
