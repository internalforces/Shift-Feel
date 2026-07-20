import { useCallback, useEffect, useRef, useState } from 'react';

import {
  INITIAL_VEHICLE_STATE,
  requestGear,
  restartEngine,
  stepSimulation,
  type DriverInput,
  type Gear,
} from './simulation';

const SIMULATION_INTERVAL_MS = 50;

export function useVehicleSimulation() {
  const [vehicle, setVehicle] = useState(INITIAL_VEHICLE_STATE);
  const [input, setInput] = useState<DriverInput>({ throttle: 0, clutch: 0 });
  const inputRef = useRef(input);

  const updateInput = useCallback((next: Partial<DriverInput>) => {
    setInput(current => {
      const updated = { ...current, ...next };
      inputRef.current = updated;
      return updated;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setVehicle(current =>
        stepSimulation(
          current,
          inputRef.current,
          SIMULATION_INTERVAL_MS / 1000,
        ),
      );
    }, SIMULATION_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const selectGear = useCallback((gear: Gear) => {
    setVehicle(current => requestGear(current, gear, inputRef.current.clutch));
  }, []);

  const startEngine = useCallback(() => {
    setVehicle(current => restartEngine(current));
  }, []);

  return { vehicle, input, updateInput, selectGear, startEngine };
}
