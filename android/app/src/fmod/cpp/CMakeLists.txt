cmake_minimum_required(VERSION 3.22.1)
project(shiftfeel_fmod)

set(FMOD_ROOT "${CMAKE_CURRENT_LIST_DIR}/../vendor/api")

add_library(fmod SHARED IMPORTED)
set_target_properties(fmod PROPERTIES
  IMPORTED_LOCATION "${FMOD_ROOT}/core/lib/${ANDROID_ABI}/libfmod.so")

add_library(fmodstudio SHARED IMPORTED)
set_target_properties(fmodstudio PROPERTIES
  IMPORTED_LOCATION "${FMOD_ROOT}/studio/lib/${ANDROID_ABI}/libfmodstudio.so")

add_library(shiftfeel_fmod SHARED fmod_engine_audio.cpp)

target_include_directories(shiftfeel_fmod PRIVATE
  "${FMOD_ROOT}/core/inc"
  "${FMOD_ROOT}/studio/inc")

target_link_libraries(shiftfeel_fmod fmodstudio fmod android log)
