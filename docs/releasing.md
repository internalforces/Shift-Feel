# Release Builds

## Android signing

Release builds must use a private release keystore. The repository includes only a debug keystore for local development; it is never used for the `release` variant.

1. Generate or securely obtain a release keystore.
2. Copy `android/keystore.properties.example` to `android/keystore.properties`.
3. Set the keystore path, passwords, and alias. Paths are resolved from the `android` directory.
4. Keep both the private keystore and `keystore.properties` out of version control.
5. Build the release artifact with the normal Gradle release task.

If signing is absent, incomplete, or points to a missing keystore, every release build fails before compilation. This prevents accidental use of the public debug keystore.

## Before distributing

- Confirm the version number for Android and iOS.
- Run lint, type checking, unit tests, and device QA.
- Review third-party notices and FMOD licensing requirements.
- Use original or properly licensed audio assets; do not ship FMOD example banks or media.
- Provide the required privacy information and store disclosures.
