# Local FMOD Setup

FMOD is optional. Without it, Shift Feel still runs its UI and vehicle simulation, but native engine audio is unavailable.

## Distribution rules

FMOD is proprietary software. Do not commit its SDK, headers, runtime libraries, sample banks, or sample media to this repository. Obtain the SDK directly from FMOD and review the current [FMOD legal terms](https://www.fmod.com/legal) before using or distributing a build.

The setup scripts copy the required files only to paths excluded by `.gitignore`.

## Supported SDK version

The integration scripts expect FMOD Engine 2.03.14.

## Android

1. Download and extract the FMOD Android SDK yourself.
2. From the repository root, run:

   ```sh
   bash scripts/install-fmod-android.sh /absolute/path/fmodstudioapi20314android
   ```

3. Build normally with `npm run android`.

## iOS

1. Download or install the FMOD iOS SDK yourself.
2. Keep the matching Android SDK available because the current development-only example banks are sourced from it.
3. From the repository root, run:

   ```sh
   bash scripts/install-fmod-ios.sh \
     /absolute/path/fmodstudioapi20314ios \
     /absolute/path/fmodstudioapi20314android
   bundle exec pod install --project-directory=ios
   ```

4. Build normally with `npm run ios`.

## Audio scope and release checklist

The local setup currently uses an FMOD example engine event for development. It is not suitable for a public redistribution. Before distributing an FMOD-enabled build:

- replace example media and banks with original or properly licensed content;
- verify the applicable FMOD licensing terms for the distribution model;
- add the required FMOD attribution in the product credits; and
- test audio startup, RPM response, latency, and cleanup on real iOS and Android devices.
