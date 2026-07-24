export const ENGINE_CONFIG = {
  idleRpm: 850,
  redlineRpm: 7000,
  stallRpm: 550,
  clutchShiftThreshold: 0.55,
  clutchBiteStart: 0.25,
  clutchBiteEnd: 0.75,
  dragPerSecond: 1.4,
  brakeDecelerationPerSecond: 24,
  neutralRpmResponse: 3.2,
  coupledRpmResponse: 4.5,
  rpmMismatchForJerk: 1700,
  directionChangeMaxSpeed: 0.05,
  minimumMovingSpeed: 0.05,
} as const;

export const GEAR_CONFIG = {
  [-1]: { label: 'R', rpmPerKph: 170, acceleration: 8, maxSpeed: 15 },
  1: { label: '1', rpmPerKph: 155, acceleration: 18, maxSpeed: 45 },
  2: { label: '2', rpmPerKph: 105, acceleration: 13, maxSpeed: 75 },
  3: { label: '3', rpmPerKph: 72, acceleration: 9, maxSpeed: 110 },
  4: { label: '4', rpmPerKph: 54, acceleration: 6.5, maxSpeed: 145 },
  5: { label: '5', rpmPerKph: 42, acceleration: 5, maxSpeed: 180 },
} as const;
