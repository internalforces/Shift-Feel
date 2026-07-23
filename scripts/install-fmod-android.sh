#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: scripts/install-fmod-android.sh /path/to/fmodstudioapi20314android"
  exit 1
fi

SDK_ROOT="$1"
API_ROOT="$SDK_ROOT/api"
DEST_ROOT="android/app/src/fmod"

for required in   "$API_ROOT/core/inc/fmod.hpp"   "$API_ROOT/core/lib/fmod.jar"   "$API_ROOT/studio/inc/fmod_studio.hpp"   "$API_ROOT/studio/examples/media/Master.bank"   "$API_ROOT/studio/examples/media/Master.strings.bank"   "$API_ROOT/studio/examples/media/Vehicles.bank"; do
  if [[ ! -f "$required" ]]; then
    echo "Missing FMOD 2.03.14 file: $required"
    exit 1
  fi
done

mkdir -p "$DEST_ROOT/vendor" "$DEST_ROOT/libs" "$DEST_ROOT/jniLibs" "$DEST_ROOT/assets"
cp -R "$API_ROOT" "$DEST_ROOT/vendor/"
cp "$API_ROOT/core/lib/fmod.jar" "$DEST_ROOT/libs/"
cp "$API_ROOT/studio/examples/media/Master.bank" "$DEST_ROOT/assets/"
cp "$API_ROOT/studio/examples/media/Master.strings.bank" "$DEST_ROOT/assets/"
cp "$API_ROOT/studio/examples/media/Vehicles.bank" "$DEST_ROOT/assets/"

for abi in arm64-v8a armeabi-v7a x86 x86_64; do
  mkdir -p "$DEST_ROOT/jniLibs/$abi"
  cp "$API_ROOT/core/lib/$abi/libfmod.so" "$DEST_ROOT/jniLibs/$abi/"
  cp "$API_ROOT/studio/lib/$abi/libfmodstudio.so" "$DEST_ROOT/jniLibs/$abi/"
done

echo "FMOD Engine 2.03.14 Android files installed locally."
