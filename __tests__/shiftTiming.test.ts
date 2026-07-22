import { ENGINE_CONFIG } from '../app/features/engine-sim/config';
import {
  INITIAL_VEHICLE_STATE,
  type VehicleState,
} from '../app/features/engine-sim/simulation';
import { assessShift } from '../app/features/engine-sim/shiftTiming';

describe('shift timing assessment', () => {
  it('classifies a rev-matched shift as smooth', () => {
    const state: VehicleState = {
      ...INITIAL_VEHICLE_STATE,
      speed: 40,
      rpm: 2880,
      gear: 2,
    };

    expect(assessShift(state, 3, 1).outcome).toBe('smooth');
  });

  it('classifies a large RPM mismatch as a jerk', () => {
    const state = { ...INITIAL_VEHICLE_STATE, rpm: 6000 };

    expect(assessShift(state, 1, 1).outcome).toBe('jerk');
  });

  it('classifies an unloaded-clutch shift as grind', () => {
    expect(
      assessShift(INITIAL_VEHICLE_STATE, 1, ENGINE_CONFIG.clutchShiftThreshold - 0.01)
        .outcome,
    ).toBe('grind');
  });

  it('classifies an over-rev downshift as unsafe', () => {
    const state: VehicleState = {
      ...INITIAL_VEHICLE_STATE,
      speed: 100,
      rpm: 4200,
      gear: 5,
    };

    expect(assessShift(state, 1, 1).outcome).toBe('unsafe');
  });

  it('reports the target RPM and mismatch for tuning', () => {
    const state: VehicleState = {
      ...INITIAL_VEHICLE_STATE,
      speed: 20,
      rpm: 4000,
      gear: 2,
    };
    const result = assessShift(state, 1, 1);

    expect(result.targetRpm).toBe(3100);
    expect(result.rpmMismatch).toBe(900);
  });
});
