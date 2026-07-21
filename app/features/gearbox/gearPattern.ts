import type { Gear } from '../engine-sim/simulation';

export interface NormalizedPosition {
  x: number;
  y: number;
}

const GEAR_POSITIONS: Record<Gear, NormalizedPosition> = {
  [-1]: { x: 0.82, y: 0.8 },
  0: { x: 0.5, y: 0.5 },
  1: { x: 0.18, y: 0.2 },
  2: { x: 0.18, y: 0.8 },
  3: { x: 0.5, y: 0.2 },
  4: { x: 0.5, y: 0.8 },
  5: { x: 0.82, y: 0.2 },
};

const COLUMN_TOLERANCE = 0.14;
const ROW_TOLERANCE = 0.16;
const NEUTRAL_HALF_HEIGHT = 0.11;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const GATE_COLUMNS = [0.18, 0.5, 0.82] as const;

/** Converts local coordinates to a position bounded to the H-pattern surface. */
export function normalizeGearPosition(
  x: number,
  y: number,
  width: number,
  height: number,
): NormalizedPosition {
  if (width <= 0 || height <= 0) {
    return GEAR_POSITIONS[0];
  }

  return { x: clamp(x / width), y: clamp(y / height) };
}

/** Returns the valid gear gate at a normalized position, or null outside every gate. */
export function gearFromPosition(position: NormalizedPosition): Gear | null {
  if (Math.abs(position.y - 0.5) <= NEUTRAL_HALF_HEIGHT) {
    return 0;
  }

  const row = position.y < 0.5 ? 0.2 : 0.8;
  if (Math.abs(position.y - row) > ROW_TOLERANCE) {
    return null;
  }

  let closestColumn = 0;
  let closestDistance = Number.POSITIVE_INFINITY;
  GATE_COLUMNS.forEach((column, index) => {
    const distance = Math.abs(position.x - column);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestColumn = index;
    }
  });

  if (closestDistance > COLUMN_TOLERANCE) {
    return null;
  }

  if (row === 0.2) {
    return [1, 3, 5][closestColumn] as Gear;
  }

  return [2, 4, -1][closestColumn] as Gear;
}

/** Projects a free drag position onto the horizontal neutral rail or nearest vertical rail. */
export function constrainToGearPattern(
  position: NormalizedPosition,
): NormalizedPosition {
  if (Math.abs(position.y - 0.5) <= NEUTRAL_HALF_HEIGHT + 0.02) {
    return { x: Math.min(0.82, Math.max(0.18, position.x)), y: 0.5 };
  }

  const nearestColumn = GATE_COLUMNS.reduce((nearest, column) =>
    Math.abs(position.x - column) < Math.abs(position.x - nearest)
      ? column
      : nearest,
  );
  return { x: nearestColumn, y: Math.min(0.8, Math.max(0.2, position.y)) };
}

/** Returns the resting knob position for a selected gear. */
export function positionForGear(gear: Gear): NormalizedPosition {
  return GEAR_POSITIONS[gear];
}
