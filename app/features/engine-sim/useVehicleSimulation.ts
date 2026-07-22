import { useCallback, useEffect, useRef, useState } from 'react';

import {
  startEngineAudio,
  stopEngineAudio,
  syncEngineAudio,
} from '../engine-audio/EngineAudio';
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
    void startEngineAudio();
    return () => {
      void stopEngineAudio();
    };
  }, []);

  useEffect(() => {
    syncEngineAudio(vehicle.rpm, vehicle.feedback);
  }, [vehicle.rpm, vehicle.feedback]);

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
    const next = requestGear(vehicleRef.current, gear, inputRef.current.clutch);
    vehicleRef.current = next;
    setVehicle(next);
    return next.gear === gear;
  }, []);

  const startEngine = useCallback(() => {
    const next = restartEngine(vehicleRef.current);
    vehicleRef.current = next;
    setVehicle(next);
  }, []);

  return { vehicle, input, updateInput, selectGear, startEngine };
}
