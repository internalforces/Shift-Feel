#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: scripts/install-fmod-ios.sh /path/to/fmodstudioapi20314ios /path/to/fmodstudioapi20314android"
  exit 1
fi

IOS_SDK_ROOT="$1"
ANDROID_SDK_ROOT="$2"
DEST_ROOT="ios/FmodEngineAudio"

for required in   "$IOS_SDK_ROOT/api/core/lib/ios/fmod.xcframework"   "$IOS_SDK_ROOT/api/studio/lib/ios/fmodstudio.xcframework"   "$ANDROID_SDK_ROOT/api/studio/examples/media/Master.bank"   "$ANDROID_SDK_ROOT/api/studio/examples/media/Master.strings.bank"   "$ANDROID_SDK_ROOT/api/studio/examples/media/Vehicles.bank"; do
  if [[ ! -e "$required" ]]; then
    echo "Missing FMOD 2.03.14 file: $required"
    exit 1
  fi
done

mkdir -p "$DEST_ROOT/vendor" "$DEST_ROOT/banks"
cp -R "$IOS_SDK_ROOT/api" "$DEST_ROOT/vendor/"
cp "$ANDROID_SDK_ROOT/api/studio/examples/media/Master.bank" "$DEST_ROOT/banks/"
cp "$ANDROID_SDK_ROOT/api/studio/examples/media/Master.strings.bank" "$DEST_ROOT/banks/"
cp "$ANDROID_SDK_ROOT/api/studio/examples/media/Vehicles.bank" "$DEST_ROOT/banks/"

echo "FMOD Engine 2.03.14 iOS files installed locally. Run bundle exec pod install."
