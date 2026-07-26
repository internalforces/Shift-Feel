# Contributing to Shift Feel

Thank you for considering a contribution. The project welcomes improvements to the simulation, touch interactions, accessibility, tests, documentation, and device QA.

## Before you begin

1. Search existing issues before opening a new one.
2. For a substantial feature or a physics-model change, open an issue first so the intended driving feel can be discussed.
3. Do not add vehicle manufacturer names, logos, proprietary SDK files, sound banks, recordings, or other assets that cannot be redistributed.

## Development workflow

1. Fork the repository and create a focused branch.
2. Install dependencies with `npm ci`.
3. Make the smallest change that solves the problem.
4. Add or update tests when simulation behaviour, input handling, or native boundaries change.
5. Run the checks below before opening a pull request.

```sh
npm run typecheck
npm run lint
npm test -- --runInBand
```

## Code and documentation expectations

- Use TypeScript and two-space indentation.
- Keep simulation tuning values in configuration modules rather than scattering magic numbers.
- Keep public documentation in English. Korean documents under `docs/ko/` are supplemental and must not contradict the English source.
- Explain non-obvious state transitions, especially gear, clutch, RPM, and audio behaviour.
- Keep pull requests focused and include a short description of user-visible behaviour.

## Contribution license

By submitting a contribution, you agree to license it under this repository's [MIT License](LICENSE).

## Testing on devices

Automated tests cannot fully validate multi-touch input, screen layout, or audio latency. If you test on a device, include the device model, OS version, orientation, and observed result in the pull request or issue.

## Audio and third-party material

FMOD is optional and proprietary. Do not commit its SDK, runtime libraries, example banks, or example media. Follow [docs/fmod-setup.md](docs/fmod-setup.md) for local development and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for distribution requirements.
