import {
  constrainToGearPattern,
  gearFromPosition,
  normalizeGearPosition,
  positionForGear,
} from '../app/features/gearbox/gearPattern';

describe('H-pattern coordinate mapping', () => {
  it.each([
    [{ x: 0.18, y: 0.2 }, 1],
    [{ x: 0.18, y: 0.8 }, 2],
    [{ x: 0.5, y: 0.2 }, 3],
    [{ x: 0.5, y: 0.8 }, 4],
    [{ x: 0.82, y: 0.2 }, 5],
    [{ x: 0.82, y: 0.8 }, -1],
  ])('maps %o to gear %s', (position, gear) => {
    expect(gearFromPosition(position)).toBe(gear);
  });

  it('maps the horizontal corridor to neutral', () => {
    expect(gearFromPosition({ x: 0.33, y: 0.5 })).toBe(0);
    expect(gearFromPosition({ x: 0.67, y: 0.55 })).toBe(0);
  });

  it('rejects release positions outside a gate', () => {
    expect(gearFromPosition({ x: 0.34, y: 0.2 })).toBeNull();
    expect(gearFromPosition({ x: 0.5, y: 0.63 })).toBeNull();
  });

  it('rejects neutral releases outside the visible horizontal rail', () => {
    expect(gearFromPosition({ x: 0.1, y: 0.5 })).toBeNull();
    expect(gearFromPosition({ x: 0.9, y: 0.5 })).toBeNull();
    expect(gearFromPosition({ x: 0.18, y: 0.5 })).toBe(0);
    expect(gearFromPosition({ x: 0.82, y: 0.5 })).toBe(0);
  });

  it('normalizes and clamps local coordinates', () => {
    expect(normalizeGearPosition(150, 100, 300, 200)).toEqual({
      x: 0.5,
      y: 0.5,
    });
    expect(normalizeGearPosition(-10, 240, 300, 200)).toEqual({ x: 0, y: 1 });
    expect(normalizeGearPosition(10, 10, 0, 0)).toEqual(positionForGear(0));
  });

  it('constrains lever movement to the H rails', () => {
    expect(constrainToGearPattern({ x: 0.4, y: 0.52 })).toEqual({
      x: 0.4,
      y: 0.5,
    });
    expect(constrainToGearPattern({ x: 0.74, y: 0.35 })).toEqual({
      x: 0.82,
      y: 0.35,
    });
    expect(constrainToGearPattern({ x: 0, y: 1 })).toEqual({ x: 0.18, y: 0.8 });
  });
});
