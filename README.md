# Shift Feel

Shift Feel is an experimental React Native app for practising the feel of driving a manual-transmission car. It focuses on the interaction between an H-pattern gear selector, clutch, brake, throttle, engine speed, and shift feedback—not lap times or racing.

> The canonical project documentation is in English. A Korean introduction is available in [docs/ko/README.md](docs/ko/README.md).

## Current capabilities

- Interactive H-pattern selector for reverse and gears 1–5
- Independent clutch, brake, and throttle touch controls
- Deterministic vehicle simulation for RPM, speed, engine state, and shift outcomes
- Shift feedback for smooth shifts, jerks, rejected shifts, and engine stalls
- Optional native FMOD bridge that maps engine RPM to an FMOD event
- Unit tests for simulation logic, input math, gear selection, and UI integration

This is a prototype under active development. It is not a substitute for driving instruction, and it does not model a real vehicle with engineering accuracy.

## Quick start

### Prerequisites

- Node.js 22.11 or later
- npm
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and an Android SDK

### Install and run

```sh
nvm use
npm ci
npm start
```

For a first iOS setup, install the Ruby dependencies and CocoaPods:

```sh
bundle install
bundle exec pod install --project-directory=ios
```

In a second terminal, run one platform:

```sh
npm run ios
# or
npm run android
```

The simulation runs without a local FMOD installation. Native engine audio is optional and unavailable until the proprietary FMOD SDK is installed locally; see [docs/fmod-setup.md](docs/fmod-setup.md).

### Verify changes

```sh
npm run typecheck
npm run lint
npm test -- --runInBand
```

## Project layout

```text
app/features/
  controls/       Driving controls composition
  dashboard/      RPM, speed, gear, and feedback display
  engine-audio/   Optional native audio boundary
  engine-sim/     Deterministic vehicle simulation
  gearbox/        H-pattern hit testing and selection
  pedals/         Multi-touch pedal input math and UI
docs/             Public project documentation
scripts/          Local FMOD setup helpers
```

## Documentation

- [Architecture](docs/architecture.md)
- [Design decisions](docs/decisions.md)
- [Roadmap](docs/roadmap.md)
- [Release builds](docs/releasing.md)
- [Device QA](docs/device-qa.md)
- [FMOD setup and distribution rules](docs/fmod-setup.md)
- [Third-party notices](THIRD_PARTY_NOTICES.md)
- [Privacy policy](PRIVACY.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## Contributing

Bug reports, device-testing results, simulation improvements, accessibility feedback, and documentation fixes are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request.

## License

The source code in this repository is licensed under the [MIT License](LICENSE), except for third-party software and assets. FMOD SDK files and FMOD example media are not included in this repository and are governed by their own terms. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
