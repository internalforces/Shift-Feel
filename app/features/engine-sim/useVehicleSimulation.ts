import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  startEngineAudio,
  stopEngineAudio,
  syncEngineAudio,
  triggerShiftAudioCue,
} from '../engine-audio/EngineAudio';
import {
  INITIAL_VEHICLE_STATE,
  requestGear,
  restartEngine,
  stopEngine as stopVehicleEngine,
  stepSimulation,
  type DriverInput,
  type Gear,
} from './simulation';

const SIMULATION_INTERVAL_MS = 50;

function runAudioTask(task: Promise<unknown>): void {
  task.catch(error => {
    if (__DEV__) {
      console.warn('Engine audio lifecycle task failed', error);
    }
  });
}

export function useVehicleSimulation() {
  const [vehicle, setVehicle] = useState(INITIAL_VEHICLE_STATE);
  const [input, setInput] = useState<DriverInput>({
    throttle: 0,
    clutch: 0,
    brake: 0,
  });
  const inputRef = useRef(input);
  const vehicleRef = useRef(vehicle);
  vehicleRef.current = vehicle;

  const updateInput = useCallback((next: Partial<DriverInput>) => {
    setInput(current => {
      const updated = { ...current, ...next };
      inputRef.current = updated;
      return updated;
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    const startAndSyncAudio = async () => {
      if (!vehicleRef.current.engineRunning) {
        return;
      }
      const started = await startEngineAudio();
      if (mounted && started) {
        const current = vehicleRef.current;
        syncEngineAudio(current.rpm, current.feedback);
      }
    };

    runAudioTask(startAndSyncAudio());
    const appStateSubscription = AppState.addEventListener(
      'change',
      nextState => {
        if (!mounted) {
          return;
        }
        if (nextState === 'active') {
          runAudioTask(startAndSyncAudio());
        } else {
          runAudioTask(stopEngineAudio());
        }
      },
    );

    return () => {
      mounted = false;
      appStateSubscription.remove();
      runAudioTask(stopEngineAudio());
    };
  }, []);

  useEffect(() => {
    syncEngineAudio(vehicle.rpm, vehicle.feedback);
  }, [vehicle.rpm, vehicle.feedback]);

  useEffect(() => {
    if (!vehicle.engineRunning) {
      runAudioTask(stopEngineAudio());
    }
  }, [vehicle.engineRunning]);

  useEffect(() => {
    const timer = setInterval(() => {
      setVehicle(current => {
        const next = stepSimulation(
          current,
          inputRef.current,
          SIMULATION_INTERVAL_MS / 1000,
        );
        vehicleRef.current = next;
        return next;
      });
    }, SIMULATION_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const selectGear = useCallback((gear: Gear) => {
    const previous = vehicleRef.current;
    const next = requestGear(previous, gear, inputRef.current.clutch);
    vehicleRef.current = next;
    setVehicle(next);
    if (gear !== previous.gear) {
      triggerShiftAudioCue(next.feedback);
    }
    return next.gear === gear;
  }, []);

  const startEngine = useCallback(() => {
    const next = restartEngine(vehicleRef.current);
    vehicleRef.current = next;
    setVehicle(next);
    if (next.engineRunning) {
      runAudioTask(
        startEngineAudio().then(started => {
          if (started) {
            syncEngineAudio(next.rpm, next.feedback);
          }
        }),
      );
    }
  }, []);

  const stopEngine = useCallback(() => {
    const next = stopVehicleEngine(vehicleRef.current);
    vehicleRef.current = next;
    setVehicle(next);
    runAudioTask(stopEngineAudio());
  }, []);

  return { vehicle, input, updateInput, selectGear, startEngine, stopEngine };
}
