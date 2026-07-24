import { ENGINE_CONFIG, GEAR_CONFIG } from '../app/features/engine-sim/config';
import {
  INITIAL_VEHICLE_STATE,
  requestGear,
  restartEngine,
  stopEngine,
  stepSimulation,
  type VehicleState,
} from '../app/features/engine-sim/simulation';

const RUNNING_VEHICLE_STATE = restartEngine(INITIAL_VEHICLE_STATE);

describe('vehicle simulation', () => {
  it('starts in neutral with the engine off', () => {
    expect(INITIAL_VEHICLE_STATE).toMatchObject({
      gear: 0,
      rpm: 0,
      engineRunning: false,
      feedback: 'off',
    });
  });

  it('raises RPM when throttle is held in neutral', () => {
    const next = stepSimulation(
      RUNNING_VEHICLE_STATE,
      { throttle: 1, clutch: 0, brake: 0 },
      0.1,
    );

    expect(next.rpm).toBeGreaterThan(RUNNING_VEHICLE_STATE.rpm);
    expect(next.speed).toBe(0);
  });

  it('rejects a gear change when the clutch is not pressed', () => {
    const next = requestGear(RUNNING_VEHICLE_STATE, 1, 0);

    expect(next.gear).toBe(0);
    expect(next.feedback).toBe('grind');
  });

  it('treats releasing the lever in the current gear as a no-op', () => {
    const current = {
      ...RUNNING_VEHICLE_STATE,
      gear: 2 as const,
      feedback: 'smooth' as const,
    };

    expect(requestGear(current, 2, 0)).toBe(current);
  });

  it('selects first gear with the clutch pressed and accelerates', () => {
    const inFirst = requestGear(RUNNING_VEHICLE_STATE, 1, 1);
    let moving = inFirst;

    for (let index = 0; index < 30; index += 1) {
      moving = stepSimulation(
        moving,
        { throttle: 1, clutch: 0, brake: 0 },
        0.1,
      );
    }

    expect(inFirst.gear).toBe(1);
    expect(moving.speed).toBeGreaterThan(0);
    expect(moving.rpm).toBeGreaterThan(0);
  });

  it('stalls when first gear is engaged at rest without throttle', () => {
    const inFirst = requestGear(RUNNING_VEHICLE_STATE, 1, 1);
    const stalled = stepSimulation(
      inFirst,
      { throttle: 0, clutch: 0, brake: 0 },
      0.1,
    );

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
    expect(restarted.rpm).toBe(ENGINE_CONFIG.idleRpm);
    expect(restarted.feedback).toBe('ready');
  });

  it('requires neutral before restarting a stalled engine', () => {
    const stalledInFirst = {
      ...RUNNING_VEHICLE_STATE,
      gear: 1 as const,
      rpm: 0,
      engineRunning: false,
      feedback: 'stalled' as const,
    };

    expect(restartEngine(stalledInFirst)).toEqual(stalledInFirst);
    expect(requestGear(stalledInFirst, 0, 0)).toMatchObject({
      gear: 0,
      feedback: 'stalled',
    });
  });

  it('turns the engine off without reporting a stall', () => {
    const stopped = stopEngine({
      ...INITIAL_VEHICLE_STATE,
      speed: 12,
      gear: 2,
      rpm: 2800,
    });

    expect(stopped).toMatchObject({
      engineRunning: false,
      rpm: 0,
      speed: 12,
      gear: 2,
      feedback: 'off',
    });
    expect(
      stepSimulation(stopped, { throttle: 0, clutch: 0, brake: 0 }, 0.1),
    ).toMatchObject({ feedback: 'off', engineRunning: false });
  });

  it('keeps manual engine-off feedback while changing gears before restarting', () => {
    const stopped = stopEngine({
      ...RUNNING_VEHICLE_STATE,
      rpm: 2400,
    });
    const inFirst = requestGear(stopped, 1, 1);
    const next = stepSimulation(
      inFirst,
      { throttle: 0, clutch: 0, brake: 0 },
      0.1,
    );

    expect(inFirst).toMatchObject({ gear: 1, feedback: 'off' });
    expect(next).toMatchObject({ engineRunning: false, feedback: 'off' });
  });

  it('always allows returning to neutral', () => {
    const inFirst = requestGear(RUNNING_VEHICLE_STATE, 1, 1);
    const neutral = requestGear(inFirst, 0, 0);

    expect(neutral.gear).toBe(0);
    expect(neutral.feedback).toBe('ready');
  });

  it('rejects a downshift above the target gear speed limit', () => {
    const cruising = {
      ...RUNNING_VEHICLE_STATE,
      rpm: 4200,
      speed: 100,
      gear: 5 as const,
    };
    const rejected = requestGear(cruising, 1, 1);
    const next = stepSimulation(
      rejected,
      { throttle: 0, clutch: 1, brake: 0 },
      0.1,
    );

    expect(rejected.gear).toBe(5);
    expect(rejected.feedback).toBe('unsafe');
    expect(next.speed).toBeGreaterThan(99);
  });

  it('rejects a shift that would exceed redline below the gear speed limit', () => {
    const cruising = {
      ...RUNNING_VEHICLE_STATE,
      rpm: 3500,
      speed: 70,
      gear: 5 as const,
    };
    const rejected = requestGear(cruising, 2, 1);

    expect(rejected.gear).toBe(5);
    expect(rejected.feedback).toBe('unsafe');
  });

  it('caps acceleration at the speed represented by redline RPM', () => {
    let inSecond: VehicleState = {
      ...RUNNING_VEHICLE_STATE,
      rpm: 6500,
      speed: 65,
      gear: 2 as const,
    };

    for (let index = 0; index < 100; index += 1) {
      inSecond = stepSimulation(
        inSecond,
        { throttle: 1, clutch: 0, brake: 0 },
        0.1,
      );
    }

    expect(inSecond.speed).toBeLessThanOrEqual(
      ENGINE_CONFIG.redlineRpm / GEAR_CONFIG[2].rpmPerKph,
    );
  });

  it('flags a large RPM mismatch as a jerk', () => {
    const highRevState = { ...RUNNING_VEHICLE_STATE, rpm: 6000 };
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
    const next = stepSimulation(
      rollingStall,
      { throttle: 1, clutch: 0, brake: 0 },
      0.1,
    );

    expect(next.speed).toBeLessThan(rollingStall.speed);
    expect(next.engineRunning).toBe(false);
  });

  it('moves backwards in reverse gear', () => {
    let reversing = requestGear(RUNNING_VEHICLE_STATE, -1, 1);

    for (let index = 0; index < 20; index += 1) {
      reversing = stepSimulation(
        reversing,
        { throttle: 1, clutch: 0, brake: 0 },
        0.1,
      );
    }

    expect(reversing.speed).toBeLessThan(0);
  });

  it('preserves reverse momentum when the clutch is disengaged', () => {
    const reversing = {
      ...RUNNING_VEHICLE_STATE,
      speed: -8,
      gear: -1 as const,
    };
    const coasting = stepSimulation(
      reversing,
      { throttle: 0, clutch: 1, brake: 0 },
      0.1,
    );

    expect(coasting.speed).toBeLessThan(0);
    expect(coasting.speed).toBeGreaterThan(reversing.speed);
  });

  it('preserves reverse momentum after shifting to neutral', () => {
    const reversing = {
      ...RUNNING_VEHICLE_STATE,
      speed: -8,
      gear: -1 as const,
    };
    const neutral = requestGear(reversing, 0, 1);
    const coasting = stepSimulation(
      neutral,
      { throttle: 0, clutch: 0, brake: 0 },
      0.1,
    );

    expect(coasting.gear).toBe(0);
    expect(coasting.speed).toBeLessThan(0);
    expect(coasting.speed).toBeGreaterThan(reversing.speed);
  });

  it('does not stall when throttle is released while reversing at speed', () => {
    const reversing = {
      ...RUNNING_VEHICLE_STATE,
      rpm: 1400,
      speed: -8,
      gear: -1 as const,
    };
    const coasting = stepSimulation(
      reversing,
      { throttle: 0, clutch: 0, brake: 0 },
      0.1,
    );

    expect(coasting.engineRunning).toBe(true);
    expect(coasting.feedback).not.toBe('stalled');
    expect(coasting.speed).toBeLessThan(0);
  });

  it('requires a full stop before engaging reverse from neutral', () => {
    const reversingInNeutral = {
      ...RUNNING_VEHICLE_STATE,
      rpm: 850,
      speed: -20,
    };
    const shifted = requestGear(reversingInNeutral, -1, 1);

    expect(shifted.gear).toBe(0);
    expect(shifted.feedback).toBe('unsafe');
  });

  it('requires neutral before changing from a forward gear to reverse', () => {
    const stoppedInFirst = { ...RUNNING_VEHICLE_STATE, gear: 1 as const };
    const rejected = requestGear(stoppedInFirst, -1, 1);
    const neutral = requestGear(stoppedInFirst, 0, 1);
    const reversed = requestGear(neutral, -1, 1);

    expect(rejected).toMatchObject({ gear: 1, feedback: 'unsafe' });
    expect(neutral).toMatchObject({ gear: 0, feedback: 'ready' });
    expect(reversed).toMatchObject({ gear: -1 });
  });

  it('rejects reverse while the vehicle is moving forward', () => {
    const movingForward = { ...RUNNING_VEHICLE_STATE, speed: 12 };
    const shifted = requestGear(movingForward, -1, 1);

    expect(shifted.gear).toBe(0);
    expect(shifted.feedback).toBe('unsafe');
  });

  it('rejects a forward gear while the vehicle is reversing', () => {
    const movingBackward = {
      ...RUNNING_VEHICLE_STATE,
      speed: -8,
      gear: -1 as const,
    };
    const shifted = requestGear(movingBackward, 1, 1);

    expect(shifted.gear).toBe(-1);
    expect(shifted.feedback).toBe('unsafe');
  });

  it('requires neutral before changing from reverse to a forward gear', () => {
    const stoppedInReverse = {
      ...RUNNING_VEHICLE_STATE,
      gear: -1 as const,
    };
    const rejected = requestGear(stoppedInReverse, 1, 1);

    expect(rejected).toMatchObject({ gear: -1, feedback: 'unsafe' });
  });

  it('brakes a moving vehicle without reversing its direction', () => {
    const moving = { ...RUNNING_VEHICLE_STATE, speed: 20 };

    const next = stepSimulation(
      moving,
      { throttle: 0, clutch: 1, brake: 1 },
      0.1,
    );

    expect(next.speed).toBeLessThan(moving.speed);
    expect(next.speed).toBeGreaterThanOrEqual(0);
  });

  it('brakes a reversing vehicle toward a stop', () => {
    const reversing = {
      ...RUNNING_VEHICLE_STATE,
      speed: -20,
      gear: -1 as const,
    };

    const next = stepSimulation(
      reversing,
      { throttle: 0, clutch: 1, brake: 1 },
      0.1,
    );

    expect(next.speed).toBeGreaterThan(reversing.speed);
    expect(next.speed).toBeLessThanOrEqual(0);
  });
});
