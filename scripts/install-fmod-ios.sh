#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: scripts/install-fmod-ios.sh /path/to/fmodstudioapi20314ios /path/to/fmodstudioapi20314android"
  exit 1
fi

IOS_SDK_ROOT="$1"
ANDROID_SDK_ROOT="$2"
DEST_ROOT="ios/FmodEngineAudio"

for required in \
  "$IOS_SDK_ROOT/api/core/inc" \
  "$IOS_SDK_ROOT/api/core/lib/libfmod_iphoneos.a" \
  "$IOS_SDK_ROOT/api/core/lib/libfmod_iphonesimulator.a" \
  "$IOS_SDK_ROOT/api/studio/inc" \
  "$IOS_SDK_ROOT/api/studio/lib/libfmodstudio_iphoneos.a" \
  "$IOS_SDK_ROOT/api/studio/lib/libfmodstudio_iphonesimulator.a" \
  "$ANDROID_SDK_ROOT/api/studio/examples/media/Master.bank" \
  "$ANDROID_SDK_ROOT/api/studio/examples/media/Master.strings.bank" \
  "$ANDROID_SDK_ROOT/api/studio/examples/media/Vehicles.bank"; do
  if [[ ! -e "$required" ]]; then
    echo "Missing FMOD 2.03.14 file: $required"
    exit 1
  fi
done

if ! command -v xcodebuild >/dev/null 2>&1; then
  echo "xcodebuild is required to package the FMOD iOS libraries."
  exit 1
fi

mkdir -p "$DEST_ROOT/vendor" "$DEST_ROOT/banks"
cp -R "$IOS_SDK_ROOT/api" "$DEST_ROOT/vendor/"

CORE_XCFRAMEWORK="$DEST_ROOT/vendor/api/core/lib/ios/fmod.xcframework"
STUDIO_XCFRAMEWORK="$DEST_ROOT/vendor/api/studio/lib/ios/fmodstudio.xcframework"
XCFRAMEWORK_INPUT_ROOT="$DEST_ROOT/vendor/.xcframework-inputs"
rm -rf "$CORE_XCFRAMEWORK" "$STUDIO_XCFRAMEWORK"
mkdir -p \
  "$(dirname "$CORE_XCFRAMEWORK")" \
  "$(dirname "$STUDIO_XCFRAMEWORK")" \
  "$XCFRAMEWORK_INPUT_ROOT/core/iphoneos" \
  "$XCFRAMEWORK_INPUT_ROOT/core/iphonesimulator" \
  "$XCFRAMEWORK_INPUT_ROOT/studio/iphoneos" \
  "$XCFRAMEWORK_INPUT_ROOT/studio/iphonesimulator"

# CocoaPods requires every architecture slice in an XCFramework to expose the
# same binary name. The FMOD SDK names its device and simulator archives with
# platform suffixes, so stage matching names before packaging them.
cp "$IOS_SDK_ROOT/api/core/lib/libfmod_iphoneos.a" \
  "$XCFRAMEWORK_INPUT_ROOT/core/iphoneos/libfmod.a"
cp "$IOS_SDK_ROOT/api/core/lib/libfmod_iphonesimulator.a" \
  "$XCFRAMEWORK_INPUT_ROOT/core/iphonesimulator/libfmod.a"
cp "$IOS_SDK_ROOT/api/studio/lib/libfmodstudio_iphoneos.a" \
  "$XCFRAMEWORK_INPUT_ROOT/studio/iphoneos/libfmodstudio.a"
cp "$IOS_SDK_ROOT/api/studio/lib/libfmodstudio_iphonesimulator.a" \
  "$XCFRAMEWORK_INPUT_ROOT/studio/iphonesimulator/libfmodstudio.a"

xcodebuild -create-xcframework \
  -library "$XCFRAMEWORK_INPUT_ROOT/core/iphoneos/libfmod.a" \
  -headers "$IOS_SDK_ROOT/api/core/inc" \
  -library "$XCFRAMEWORK_INPUT_ROOT/core/iphonesimulator/libfmod.a" \
  -headers "$IOS_SDK_ROOT/api/core/inc" \
  -output "$CORE_XCFRAMEWORK"

xcodebuild -create-xcframework \
  -library "$XCFRAMEWORK_INPUT_ROOT/studio/iphoneos/libfmodstudio.a" \
  -headers "$IOS_SDK_ROOT/api/studio/inc" \
  -library "$XCFRAMEWORK_INPUT_ROOT/studio/iphonesimulator/libfmodstudio.a" \
  -headers "$IOS_SDK_ROOT/api/studio/inc" \
  -output "$STUDIO_XCFRAMEWORK"

cp "$ANDROID_SDK_ROOT/api/studio/examples/media/Master.bank" "$DEST_ROOT/banks/"
cp "$ANDROID_SDK_ROOT/api/studio/examples/media/Master.strings.bank" "$DEST_ROOT/banks/"
cp "$ANDROID_SDK_ROOT/api/studio/examples/media/Vehicles.bank" "$DEST_ROOT/banks/"

echo "FMOD Engine 2.03.14 iOS files installed locally. Run bundle exec pod install."
