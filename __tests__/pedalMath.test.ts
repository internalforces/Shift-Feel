import {
  pedalValueFromY,
  pedalValuesFromTouches,
} from '../app/features/pedals/pedalMath';

describe('continuous pedal coordinate mapping', () => {
  it('maps vertical position to a clamped pressure value', () => {
    expect(pedalValueFromY(0, 100)).toBe(1);
    expect(pedalValueFromY(50, 100)).toBe(0.5);
    expect(pedalValueFromY(100, 100)).toBe(0);
    expect(pedalValueFromY(-20, 100)).toBe(1);
    expect(pedalValueFromY(120, 100)).toBe(0);
    expect(pedalValueFromY(10, 0)).toBe(0);
  });

  it('tracks clutch, brake, and throttle from simultaneous touches', () => {
    const values = pedalValuesFromTouches(
      [
        { locationX: 40, locationY: 25 },
        { locationX: 100, locationY: 50 },
        { locationX: 180, locationY: 60 },
      ],
      240,
      100,
    );

    expect(values.clutch).toBe(0.75);
    expect(values.brake).toBe(0.5);
    expect(values.throttle).toBe(0.4);
  });

  it('uses the strongest touch on each pedal and resets missing sides', () => {
    expect(
      pedalValuesFromTouches(
        [
          { locationX: 10, locationY: 70 },
          { locationX: 20, locationY: 20 },
        ],
        240,
        100,
      ),
    ).toEqual({ clutch: 0.8, brake: 0, throttle: 0 });
    expect(pedalValuesFromTouches([], 200, 100)).toEqual({
      clutch: 0,
      brake: 0,
      throttle: 0,
    });
    expect(pedalValuesFromTouches([], 0, 0)).toEqual({
      clutch: 0,
      brake: 0,
      throttle: 0,
    });
  });
});
