import {
  INITIAL_VEHICLE_STATE,
  requestGear,
  restartEngine,
  stepSimulation,
} from '../app/features/engine-sim/simulation';

describe('vehicle simulation', () => {
  it('raises RPM when throttle is held in neutral', () => {
    const next = stepSimulation(
      INITIAL_VEHICLE_STATE,
      { throttle: 1, clutch: 0 },
      0.1,
    );

    expect(next.rpm).toBeGreaterThan(INITIAL_VEHICLE_STATE.rpm);
    expect(next.speed).toBe(0);
  });

  it('rejects a gear change when the clutch is not pressed', () => {
    const next = requestGear(INITIAL_VEHICLE_STATE, 1, 0);

    expect(next.gear).toBe(0);
    expect(next.feedback).toBe('grind');
  });

  it('selects first gear with the clutch pressed and accelerates', () => {
    const inFirst = requestGear(INITIAL_VEHICLE_STATE, 1, 1);
    let moving = inFirst;

    for (let index = 0; index < 30; index += 1) {
      moving = stepSimulation(moving, { throttle: 1, clutch: 0 }, 0.1);
    }

    expect(inFirst.gear).toBe(1);
    expect(moving.speed).toBeGreaterThan(0);
    expect(moving.rpm).toBeGreaterThan(0);
  });

  it('stalls when first gear is engaged at rest without throttle', () => {
    const inFirst = requestGear(INITIAL_VEHICLE_STATE, 1, 1);
    const stalled = stepSimulation(inFirst, { throttle: 0, clutch: 0 }, 0.1);

    expect(stalled.engineRunning).toBe(false);
    expect(stalled.feedback).toBe('stalled');
    expect(stalled.rpm).toBe(0);
  });

  it('restarts a stalled engine at idle RPM', () => {
    const restarted = restartEngine({
      ...INITIAL_VEHICLE_STATE,
      rpm: 0,
      engineRunning: false,
      feedback: 'stalled',
    });

    expect(restarted.engineRunning).toBe(true);
    expect(restarted.rpm).toBe(INITIAL_VEHICLE_STATE.rpm);
    expect(restarted.feedback).toBe('ready');
  });

  it('always allows returning to neutral', () => {
    const inFirst = requestGear(INITIAL_VEHICLE_STATE, 1, 1);
    const neutral = requestGear(inFirst, 0, 0);

    expect(neutral.gear).toBe(0);
    expect(neutral.feedback).toBe('ready');
  });

  it('flags a large RPM mismatch as a jerk', () => {
    const highRevState = { ...INITIAL_VEHICLE_STATE, rpm: 6000 };
    const shifted = requestGear(highRevState, 1, 1);

    expect(shifted.gear).toBe(1);
    expect(shifted.feedback).toBe('jerk');
  });

  it('slows a stalled vehicle without restarting it', () => {
    const rollingStall = {
      ...INITIAL_VEHICLE_STATE,
      speed: 20,
      rpm: 0,
      engineRunning: false,
      feedback: 'stalled' as const,
    };
    const next = stepSimulation(rollingStall, { throttle: 1, clutch: 0 }, 0.1);

    expect(next.speed).toBeLessThan(rollingStall.speed);
    expect(next.engineRunning).toBe(false);
  });

  it('moves backwards in reverse gear', () => {
    let reversing = requestGear(INITIAL_VEHICLE_STATE, -1, 1);

    for (let index = 0; index < 20; index += 1) {
      reversing = stepSimulation(reversing, { throttle: 1, clutch: 0 }, 0.1);
    }

    expect(reversing.speed).toBeLessThan(0);
  });
});
