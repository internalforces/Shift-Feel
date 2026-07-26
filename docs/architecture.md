# Architecture

## Overview

Shift Feel is a React Native bare-workflow application. Its core vehicle simulation is deterministic TypeScript so that gear, clutch, throttle, brake, RPM, speed, and feedback rules can be tested without a device or a native audio SDK.

```text
Touch controls
     │
     ▼
Input state ──► Vehicle simulation ──► Vehicle state ──► Dashboard
                     │                       │
                     │                       └──────────► Shift feedback
                     ▼
              Optional audio boundary
                     │
                     ▼
                Native FMOD bridge
```

## Feature boundaries

| Area | Responsibility |
| --- | --- |
| `app/features/controls` | Arranges the selector and pedal controls. |
| `app/features/dashboard` | Renders RPM, speed, selected gear, and feedback. |
| `app/features/engine-sim` | Owns vehicle rules, configuration, timing, and the simulation hook. |
| `app/features/gearbox` | Converts an H-pattern drag position into a gear-selection request. |
| `app/features/pedals` | Converts independent touches into normalized pedal values. |
| `app/features/engine-audio` | Presents a resilient TypeScript boundary for optional native audio. |
| `android/.../audio`, `ios/FmodEngineAudio` | Provide the platform FMOD bridge when the SDK is installed locally. |

## Simulation model

The simulation receives normalized clutch, brake, and throttle input plus a requested gear. It updates a vehicle state containing engine status, RPM, speed, gear, and feedback. Configuration in `app/features/engine-sim/config.ts` centralizes tunable values such as idle RPM, redline, clutch bite range, gear ratios, acceleration, braking, and shift thresholds.

The model deliberately favours understandable interaction feedback over a high-fidelity automotive physics model. Contributions should preserve deterministic behaviour and add tests for altered rules.

## Optional audio path

The app must remain usable when FMOD is not installed. The JavaScript audio boundary therefore treats a missing native module or a failed event start as a recoverable condition. When locally configured, the native bridge starts an FMOD engine event and receives RPM updates from the simulation.

FMOD assets are external to this source repository. See [FMOD setup](fmod-setup.md) and [third-party notices](../THIRD_PARTY_NOTICES.md).
