# Device QA Checklist

Automated tests cover simulation rules and component behaviour. Physical devices are still required to validate touch reliability, layout, audio latency, and platform-specific system gestures.

## Record for every test run

- App commit or release candidate
- Device model and OS version
- Platform, orientation, and screen size class
- Whether FMOD was installed and the audio output route used
- Result, reproduction steps, and screenshots or screen recording when relevant

## Interaction checks

- Verify that clutch, brake, and throttle can be held independently while moving the gear selector.
- Verify that releasing a gear drag outside a gate does not select a gear.
- Verify reverse is rejected while the vehicle is moving forward.
- Verify system back, home, and interruption gestures do not leave a pedal engaged.
- Test small landscape screens specifically. The compact layout must not block simultaneous pedal and selector touches.

## Audio checks

- Start and stop the engine repeatedly.
- Verify RPM updates follow acceleration and gear changes without audible gaps or stuck playback.
- Interrupt and resume the app with another audio source active.
- Verify that missing FMOD files degrade to a usable silent simulation.

## Release gate

Do not claim device readiness until the supported iOS and Android screen classes have a recorded passing run or an accepted, documented exception.
