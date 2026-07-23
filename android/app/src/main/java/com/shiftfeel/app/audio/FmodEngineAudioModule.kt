package com.shiftfeel.app.audio

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class FmodEngineAudioModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  private val nativeAvailable: Boolean =
    try {
      System.loadLibrary("fmod")
      System.loadLibrary("fmodstudio")
      System.loadLibrary("shiftfeel_fmod")
      true
    } catch (_: UnsatisfiedLinkError) {
      false
    }

  override fun getName(): String = "FmodEngineAudio"

  @ReactMethod
  fun initialize(promise: Promise) {
    if (!nativeAvailable) {
      promise.reject("FMOD_SDK_MISSING", "Run scripts/install-fmod-android.sh before building Android")
      return
    }

    try {
      val fmodClass = Class.forName("org.fmod.FMOD")
      fmodClass.getMethod("init", android.content.Context::class.java)
        .invoke(null, reactContext)
      checkNativeResult(nativeInitialize(), "initialize")
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("FMOD_INIT_FAILED", error)
    }
  }

  @ReactMethod
  fun startEngineEvent(eventPath: String, promise: Promise) {
    try {
      checkNativeResult(nativeStartEngineEvent(eventPath), "startEngineEvent")
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("FMOD_EVENT_FAILED", error)
    }
  }

  @ReactMethod
  fun setRpm(rpm: Double) {
    if (nativeAvailable) {
      nativeSetRpm(rpm.toFloat())
    }
  }

  @ReactMethod
  fun triggerCue(cue: String) {
    if (nativeAvailable) {
      nativeTriggerCue(cue)
    }
  }

  @ReactMethod
  fun stop(promise: Promise) {
    if (!nativeAvailable) {
      promise.resolve(null)
      return
    }

    try {
      checkNativeResult(nativeStop(), "stop")
      Class.forName("org.fmod.FMOD").getMethod("close").invoke(null)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("FMOD_STOP_FAILED", error)
    }
  }

  private fun checkNativeResult(code: Int, operation: String) {
    if (code != 0) {
      throw IllegalStateException("FMOD $operation failed with result $code")
    }
  }

  private external fun nativeInitialize(): Int
  private external fun nativeStartEngineEvent(eventPath: String): Int
  private external fun nativeSetRpm(rpm: Float): Int
  private external fun nativeTriggerCue(cue: String): Int
  private external fun nativeStop(): Int
}
