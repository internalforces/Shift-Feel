#include <jni.h>
#include <mutex>
#include <string>

#include "fmod.hpp"
#include "fmod_errors.h"
#include "fmod_studio.hpp"

namespace {
std::mutex audioMutex;
FMOD::Studio::System *studioSystem = nullptr;
FMOD::Studio::EventInstance *engineEvent = nullptr;

jint loadBank(const char *path) {
  FMOD::Studio::Bank *bank = nullptr;
  return studioSystem->loadBankFile(
      path, FMOD_STUDIO_LOAD_BANK_NORMAL, &bank);
}

std::string toString(JNIEnv *env, jstring value) {
  const char *chars = env->GetStringUTFChars(value, nullptr);
  std::string result(chars);
  env->ReleaseStringUTFChars(value, chars);
  return result;
}
} // namespace

extern "C" JNIEXPORT jint JNICALL
Java_com_shiftfeel_app_audio_FmodEngineAudioModule_nativeInitialize(
    JNIEnv *, jobject) {
  std::lock_guard<std::mutex> lock(audioMutex);
  if (studioSystem != nullptr) {
    return FMOD_OK;
  }

  FMOD_RESULT result = FMOD::Studio::System::create(&studioSystem);
  if (result != FMOD_OK) {
    studioSystem = nullptr;
    return result;
  }

  result = studioSystem->initialize(
      64, FMOD_STUDIO_INIT_NORMAL, FMOD_INIT_NORMAL, nullptr);
  if (result != FMOD_OK) {
    studioSystem->release();
    studioSystem = nullptr;
    return result;
  }

  const char *prefix = "file:///android_asset/";
  result = static_cast<FMOD_RESULT>(
      loadBank((std::string(prefix) + "Master.bank").c_str()));
  if (result == FMOD_OK) {
    result = static_cast<FMOD_RESULT>(
        loadBank((std::string(prefix) + "Master.strings.bank").c_str()));
  }
  if (result == FMOD_OK) {
    result = static_cast<FMOD_RESULT>(
        loadBank((std::string(prefix) + "Vehicles.bank").c_str()));
  }
  return result;
}

extern "C" JNIEXPORT jint JNICALL
Java_com_shiftfeel_app_audio_FmodEngineAudioModule_nativeStartEngineEvent(
    JNIEnv *env, jobject, jstring eventPath) {
  std::lock_guard<std::mutex> lock(audioMutex);
  if (studioSystem == nullptr) {
    return FMOD_ERR_UNINITIALIZED;
  }

  if (engineEvent != nullptr) {
    engineEvent->stop(FMOD_STUDIO_STOP_IMMEDIATE);
    engineEvent->release();
    engineEvent = nullptr;
  }

  FMOD::Studio::EventDescription *description = nullptr;
  const std::string path = toString(env, eventPath);
  FMOD_RESULT result = studioSystem->getEvent(path.c_str(), &description);
  if (result == FMOD_OK) {
    result = description->createInstance(&engineEvent);
  }
  if (result == FMOD_OK) {
    result = engineEvent->start();
  }
  studioSystem->update();
  return result;
}

extern "C" JNIEXPORT jint JNICALL
Java_com_shiftfeel_app_audio_FmodEngineAudioModule_nativeSetRpm(
    JNIEnv *, jobject, jfloat rpm) {
  std::lock_guard<std::mutex> lock(audioMutex);
  if (engineEvent == nullptr || studioSystem == nullptr) {
    return FMOD_ERR_UNINITIALIZED;
  }

  FMOD_RESULT result =
      engineEvent->setParameterByName("RPM", rpm, false);
  if (result == FMOD_OK) {
    result = studioSystem->update();
  }
  return result;
}

extern "C" JNIEXPORT jint JNICALL
Java_com_shiftfeel_app_audio_FmodEngineAudioModule_nativeTriggerCue(
    JNIEnv *, jobject, jstring) {
  // TASK-008's example Vehicles bank exposes only the continuous engine event.
  // One-shot grind/jerk/stall events will be authored in the project bank.
  return FMOD_OK;
}

extern "C" JNIEXPORT jint JNICALL
Java_com_shiftfeel_app_audio_FmodEngineAudioModule_nativeStop(
    JNIEnv *, jobject) {
  std::lock_guard<std::mutex> lock(audioMutex);
  if (engineEvent != nullptr) {
    engineEvent->stop(FMOD_STUDIO_STOP_ALLOWFADEOUT);
    engineEvent->release();
    engineEvent = nullptr;
  }
  if (studioSystem != nullptr) {
    studioSystem->update();
    studioSystem->release();
    studioSystem = nullptr;
  }
  return FMOD_OK;
}
