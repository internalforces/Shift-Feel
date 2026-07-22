export interface PedalTouch {
  locationX: number;
  locationY: number;
}

export interface PedalValues {
  clutch: number;
  throttle: number;
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

/** Maps a vertical touch to pedal pressure: top is fully pressed, bottom is released. */
export function pedalValueFromY(locationY: number, height: number): number {
  if (height <= 0) {
    return 0;
  }

  return clamp(1 - locationY / height, 0, 1);
}

/** Resolves all active touches into independent left-clutch and right-throttle values. */
export function pedalValuesFromTouches(
  touches: readonly PedalTouch[],
  width: number,
  height: number,
): PedalValues {
  if (width <= 0 || height <= 0) {
    return { clutch: 0, throttle: 0 };
  }

  let clutch = 0;
  let throttle = 0;
  const midpoint = width / 2;

  for (const touch of touches) {
    const value = pedalValueFromY(touch.locationY, height);
    if (touch.locationX < midpoint) {
      clutch = Math.max(clutch, value);
    } else {
      throttle = Math.max(throttle, value);
    }
  }

  return { clutch, throttle };
}
