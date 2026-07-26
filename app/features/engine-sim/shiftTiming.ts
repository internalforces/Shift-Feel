import { ENGINE_CONFIG, GEAR_CONFIG } from './config';
import type { Gear, VehicleState } from './simulation';

export type ShiftOutcome = 'smooth' | 'jerk' | 'grind' | 'unsafe';

export interface ShiftAssessment {
  outcome: ShiftOutcome;
  targetRpm: number | null;
  rpmMismatch: number | null;
}

/**
 * Classifies a requested shift without mutating simulation state.
 * Thresholds remain centralized in engine-sim/config.ts for later vehicle tuning.
 */
export function assessShift(
  state: VehicleState,
  nextGear: Gear,
  clutchPedal: number,
): ShiftAssessment {
  if (nextGear === 0 || nextGear === state.gear) {
    return { outcome: 'smooth', targetRpm: null, rpmMismatch: null };
  }

  if (clutchPedal < ENGINE_CONFIG.clutchShiftThreshold) {
    return { outcome: 'grind', targetRpm: null, rpmMismatch: null };
  }

  const changingDirectionWithoutNeutral =
    (nextGear === -1 && state.gear > 0) || (nextGear > 0 && state.gear === -1);
  const reverseWhileMoving =
    nextGear === -1 &&
    Math.abs(state.speed) > ENGINE_CONFIG.directionChangeMaxSpeed;
  const forwardWhileReversing =
    nextGear > 0 && state.speed < -ENGINE_CONFIG.directionChangeMaxSpeed;
  const gearConfig = GEAR_CONFIG[nextGear];
  const speedRpm = Math.abs(state.speed) * gearConfig.rpmPerKph;
  const targetRpm = Math.max(ENGINE_CONFIG.idleRpm, speedRpm);

  if (
    changingDirectionWithoutNeutral ||
    reverseWhileMoving ||
    forwardWhileReversing ||
    Math.abs(state.speed) > gearConfig.maxSpeed ||
    speedRpm > ENGINE_CONFIG.redlineRpm
  ) {
    return {
      outcome: 'unsafe',
      targetRpm,
      rpmMismatch: Math.abs(state.rpm - targetRpm),
    };
  }

  const rpmMismatch = Math.abs(state.rpm - targetRpm);
  return {
    outcome: rpmMismatch > ENGINE_CONFIG.rpmMismatchForJerk ? 'jerk' : 'smooth',
    targetRpm,
    rpmMismatch,
  };
}
