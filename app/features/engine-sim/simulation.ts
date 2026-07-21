import { ENGINE_CONFIG, GEAR_CONFIG } from './config';

export type Gear = -1 | 0 | 1 | 2 | 3 | 4 | 5;
export type Feedback = 'ready' | 'smooth' | 'jerk' | 'grind' | 'stalled';

export interface VehicleState {
  rpm: number;
  speed: number;
  gear: Gear;
  engineRunning: boolean;
  feedback: Feedback;
}

export interface DriverInput {
  throttle: number;
  clutch: number;
}

export const INITIAL_VEHICLE_STATE: VehicleState = {
  rpm: ENGINE_CONFIG.idleRpm,
  speed: 0,
  gear: 0,
  engineRunning: true,
  feedback: 'ready',
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

const approach = (
  current: number,
  target: number,
  rate: number,
  deltaSeconds: number,
) => current + (target - current) * clamp(rate * deltaSeconds, 0, 1);

/** Returns clutch engagement where 0 is disconnected and 1 is fully connected. */
export function getClutchEngagement(clutchPedal: number): number {
  const releasedAmount = 1 - clamp(clutchPedal, 0, 1);
  return clamp(
    (releasedAmount - ENGINE_CONFIG.clutchBiteStart) /
      (ENGINE_CONFIG.clutchBiteEnd - ENGINE_CONFIG.clutchBiteStart),
    0,
    1,
  );
}

/** Attempts a gear change and reports a grind when the clutch is not pressed far enough. */
export function requestGear(
  state: VehicleState,
  nextGear: Gear,
  clutchPedal: number,
): VehicleState {
  if (nextGear === 0) {
    return { ...state, gear: 0, feedback: 'ready' };
  }

  if (clutchPedal < ENGINE_CONFIG.clutchShiftThreshold) {
    return { ...state, feedback: 'grind' };
  }

  const unsafeDirectionChange =
    (nextGear === -1 && state.speed > ENGINE_CONFIG.directionChangeMaxSpeed) ||
    (nextGear > 0 && state.speed < -ENGINE_CONFIG.directionChangeMaxSpeed);
  if (unsafeDirectionChange) {
    return { ...state, feedback: 'grind' };
  }

  const gearConfig = GEAR_CONFIG[nextGear];
  const coupledRpm = Math.max(
    ENGINE_CONFIG.idleRpm,
    state.speed * gearConfig.rpmPerKph,
  );
  const feedback =
    Math.abs(state.rpm - coupledRpm) > ENGINE_CONFIG.rpmMismatchForJerk
      ? 'jerk'
      : 'smooth';

  return { ...state, gear: nextGear, feedback };
}

/** Advances the deterministic vehicle simulation by a time step in seconds. */
export function stepSimulation(
  state: VehicleState,
  rawInput: DriverInput,
  deltaSeconds: number,
): VehicleState {
  const delta = clamp(deltaSeconds, 0, 0.1);
  const throttle = clamp(rawInput.throttle, 0, 1);
  const clutch = clamp(rawInput.clutch, 0, 1);
  const engagement = getClutchEngagement(clutch);

  if (!state.engineRunning) {
    return {
      ...state,
      rpm: 0,
      speed: Math.max(0, state.speed - ENGINE_CONFIG.dragPerSecond * delta),
      feedback: 'stalled',
    };
  }

  const freeRevTarget =
    ENGINE_CONFIG.idleRpm +
    throttle * (ENGINE_CONFIG.redlineRpm - ENGINE_CONFIG.idleRpm);

  if (state.gear === 0 || engagement === 0) {
    return {
      ...state,
      rpm: approach(
        state.rpm,
        freeRevTarget,
        ENGINE_CONFIG.neutralRpmResponse,
        delta,
      ),
      speed: Math.max(0, state.speed - ENGINE_CONFIG.dragPerSecond * delta),
    };
  }

  const gearConfig = GEAR_CONFIG[state.gear];
  const wheelRpm = Math.max(0, state.speed * gearConfig.rpmPerKph);
  const coupledTarget = Math.max(
    ENGINE_CONFIG.idleRpm * (0.75 + throttle * 0.25),
    wheelRpm + throttle * 900,
  );
  const rpm = approach(
    state.rpm,
    coupledTarget,
    ENGINE_CONFIG.coupledRpmResponse * engagement,
    delta,
  );

  const shouldStall =
    engagement > 0.85 &&
    state.speed < 2 &&
    throttle < 0.12 &&
    rpm < ENGINE_CONFIG.stallRpm + 250;

  if (shouldStall) {
    return { ...state, rpm: 0, engineRunning: false, feedback: 'stalled' };
  }

  const direction = state.gear === -1 ? -1 : 1;
  const acceleration = throttle * gearConfig.acceleration * engagement;
  const drag = ENGINE_CONFIG.dragPerSecond * (state.speed > 0 ? 1 : 0);
  const speed = clamp(
    state.speed + (acceleration * direction - drag) * delta,
    state.gear === -1 ? -gearConfig.maxSpeed : 0,
    state.gear === -1 ? 0 : gearConfig.maxSpeed,
  );

  return {
    ...state,
    rpm: clamp(rpm, ENGINE_CONFIG.stallRpm, ENGINE_CONFIG.redlineRpm),
    speed: Math.abs(speed) < ENGINE_CONFIG.minimumMovingSpeed ? 0 : speed,
  };
}

/** Restarts the engine while preserving the selected gear and vehicle speed. */
export function restartEngine(state: VehicleState): VehicleState {
  return {
    ...state,
    rpm: ENGINE_CONFIG.idleRpm,
    engineRunning: true,
    feedback: 'ready',
  };
}
