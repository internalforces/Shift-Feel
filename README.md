# Shift Feel

**A cross-platform manual-transmission feel simulator built with React Native and TypeScript.**

[한국어 README](docs/ko/README.md) · [Architecture](docs/architecture.md) · [Design decisions](docs/decisions.md) · [Roadmap](docs/roadmap.md)

Shift Feel is an interaction-focused prototype for practising the relationship between an H-pattern shifter, clutch, brake, throttle, engine speed, and shift timing. Unlike a racing game, it prioritizes understandable driving feedback over lap times or high-fidelity vehicle physics.

> [!NOTE]
> This prototype is not a substitute for driving instruction and does not model a real vehicle with engineering accuracy.

## Contents

- [Project overview](#project-overview)
- [What this project demonstrates](#what-this-project-demonstrates)
- [Engineering highlights](#engineering-highlights)
- [Architecture](#architecture)
- [Testing and quality](#testing-and-quality)
- [Getting started](#getting-started)
- [Trade-offs and next steps](#trade-offs-and-next-steps)

## Demo

![Shift Feel running in the iPhone simulator](docs/assets/shift-feel-demo.gif)

_iOS build running in the iPhone 16 Pro simulator._

## Project overview

| | |
| --- | --- |
| **Project type** | Cross-platform interaction and simulation prototype |
| **Platforms** | iOS and Android |
| **Core stack** | React Native 0.86, React 19, TypeScript |
| **Native integration** | Optional FMOD bridge for iOS and Android |
| **Quality controls** | Jest, React Test Renderer, TypeScript, ESLint |
| **Current status** | Functional prototype under active development |

## What this project demonstrates

- Product thinking focused on a specific learning experience rather than racing mechanics
- Deterministic simulation rules that can be tested independently from the UI and native SDKs
- Simultaneous touch handling for independent clutch, brake, and throttle input
- H-pattern drag interaction with constrained movement and forgiving gear-gate detection
- A resilient cross-platform boundary for an optional proprietary audio dependency
- Automated testing across simulation, input math, gear selection, audio lifecycle, and UI integration

## Core experience

| Area | Implementation |
| --- | --- |
| **Gear selection** | Interactive H-pattern selector supporting reverse and gears 1–5 |
| **Pedal input** | Independent, simultaneous clutch, brake, and throttle controls |
| **Vehicle state** | Deterministic RPM, speed, selected gear, and engine state updates |
| **Driver feedback** | Smooth shift, jerk, grind, unsafe shift, and stall outcomes |
| **Engine audio** | RPM synchronization and discrete feedback cues through an optional FMOD bridge |

## Engineering highlights

### 1. Testable vehicle behaviour

**Challenge:** Vehicle state, shift timing, and driver feedback need to evolve continuously without becoming tightly coupled to rendering or device behaviour.

**Approach:** The simulation is implemented as deterministic TypeScript state transitions. Tunable values are centralized in configuration, while shift assessment is separated from the time-step update.

**Result:** The same input and elapsed time produce repeatable outcomes, allowing edge cases such as stalls, unsafe shifts, reverse movement, and RPM limits to be verified without launching the app.

[Simulation core](app/features/engine-sim/simulation.ts) · [Configuration](app/features/engine-sim/config.ts) · [Simulation tests](__tests__/simulation.test.ts)

### 2. Multi-touch controls and H-pattern input

**Challenge:** A manual-transmission interaction requires simultaneous pedal input and a shifter that feels constrained to visible gear rails.

**Approach:** Touch coordinates are converted into normalized pedal values independently for each third of the control surface. Shifter coordinates are normalized, projected onto the H-pattern, and resolved using slightly overlapping gear targets.

**Result:** Pedal calculations and gear selection remain independent from their React Native components and can be tested as pure input-mapping functions.

[Pedal input math](app/features/pedals/pedalMath.ts) · [Gear-pattern math](app/features/gearbox/gearPattern.ts) · [Input tests](__tests__/pedalMath.test.ts)

### 3. Optional native audio integration

**Challenge:** FMOD provides RPM-driven engine audio, but its proprietary SDK and media cannot be included in the repository. The core app must remain usable without it.

**Approach:** A TypeScript facade treats the native module as optional, manages concurrent start and stop requests, queues the latest simulation state, and recovers from initialization failures. Platform bridges are isolated behind the same boundary.

**Result:** Contributors can run and test the complete simulation without FMOD, while a locally configured SDK adds native engine audio without changing the simulation layer.

[Audio boundary](app/features/engine-audio/EngineAudio.ts) · [FMOD setup](docs/fmod-setup.md) · [Audio lifecycle tests](__tests__/EngineAudio.test.ts)

## Architecture

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

The deterministic TypeScript simulation is the source of vehicle state. UI controls provide normalized input, the dashboard renders the resulting state, and audio observes RPM and discrete feedback through an optional native boundary. This keeps the product functional and testable even when the FMOD SDK is unavailable.

[Read the full architecture guide](docs/architecture.md)

## Testing and quality

| Test area | What is verified |
| --- | --- |
| **Simulation** | Engine lifecycle, RPM, acceleration, braking, stalls, gear changes, and feedback |
| **Shift timing** | Smooth, jerky, grinding, and unsafe shift conditions |
| **Input math** | Pedal pressure, simultaneous touches, gear gates, and constrained movement |
| **Audio lifecycle** | Missing native module, startup, synchronization, cues, failure recovery, and shutdown |
| **UI integration** | Controls, dashboard output, and app-level interaction |

Run all static checks and tests:

```sh
npm run typecheck
npm run lint
npm test -- --runInBand
```

## Technology choices

| Technology | Why it is used |
| --- | --- |
| **React Native + TypeScript** | Shares interaction and simulation code across iOS and Android while retaining native integration points |
| **Deterministic state model** | Makes behaviour reproducible, reviewable, and testable without a device |
| **Jest** | Verifies pure simulation logic, native-boundary behaviour, hooks, and components |
| **FMOD** | Supports parameter-driven engine audio while remaining an optional local dependency |
| **CocoaPods / CMake** | Integrates the iOS and Android native audio bridges when FMOD is configured |

More context is recorded in the [design decisions](docs/decisions.md).

## Getting started

### Prerequisites

| Requirement | Platform |
| --- | --- |
| Node.js 22.11 or later and npm | All |
| Xcode and CocoaPods | iOS |
| Android Studio and an Android SDK | Android |

### Install and run

```sh
nvm use
npm ci
```

For the first iOS setup:

```sh
bundle install
bundle exec pod install --project-directory=ios
```

Start Metro:

```sh
npm start
```

In a second terminal, run one platform:

```sh
npm run ios
# or
npm run android
```

> [!TIP]
> FMOD is not required to run the simulation. Follow the [FMOD setup guide](docs/fmod-setup.md) only if you want to enable native engine audio locally.

## Trade-offs and next steps

The simulation deliberately favours clear and tunable feedback over engineering-grade vehicle physics. The current prototype also keeps proprietary sound assets outside the repository so that the source remains redistributable.

Next priorities include broader device validation, improved landscape and simultaneous-touch reliability, clearer learning guidance, haptic feedback, and original redistributable audio. See the [roadmap](docs/roadmap.md) for the full direction.

## Project documentation

| Topic | Document |
| --- | --- |
| System design | [Architecture](docs/architecture.md) |
| Technical rationale | [Design decisions](docs/decisions.md) |
| Planned improvements | [Roadmap](docs/roadmap.md) |
| Device coverage | [Device QA](docs/device-qa.md) |
| Distribution | [Release builds](docs/releasing.md) |
| Native audio | [FMOD setup and distribution rules](docs/fmod-setup.md) |
| Contribution and policies | [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md) · [Privacy](PRIVACY.md) |

English is the canonical language for project documentation. The [Korean README](docs/ko/README.md) is provided as a translated overview.

## License

The source code is available under the [MIT License](LICENSE), except for third-party software and assets. FMOD SDK files and FMOD example media are not included and remain governed by their own terms. See the [third-party notices](THIRD_PARTY_NOTICES.md) for details.
