import { useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type LayoutRectangle,
} from 'react-native';

import type { Gear } from '../engine-sim/simulation';
import { GearSelector } from '../gearbox/GearSelector';
import {
  constrainToGearPattern,
  gearFromPosition,
  normalizeGearPosition,
  positionForGear,
  type NormalizedPosition,
} from '../gearbox/gearPattern';
import { PedalControls } from '../pedals/PedalControls';
import { pedalValuesFromTouches } from '../pedals/pedalMath';

interface DrivingControlsProps {
  selectedGear: Gear;
  clutch: number;
  throttle: number;
  onSelectGear: (gear: Gear) => boolean;
  onClutchChange: (value: number) => void;
  onThrottleChange: (value: number) => void;
}

interface Region extends LayoutRectangle {}

const contains = (region: Region, x: number, y: number) =>
  x >= region.x &&
  x <= region.x + region.width &&
  y >= region.y &&
  y <= region.y + region.height;

export function DrivingControls({
  selectedGear,
  clutch,
  throttle,
  onSelectGear,
  onClutchChange,
  onThrottleChange,
}: DrivingControlsProps) {
  const [position, setPosition] = useState<NormalizedPosition>(
    positionForGear(selectedGear),
  );
  const [invalidRelease, setInvalidRelease] = useState(false);
  const gearContainerRef = useRef<Region | null>(null);
  const gearPatternRef = useRef<Region | null>(null);
  const pedalRegionRef = useRef<Region | null>(null);
  const gearTouchIdRef = useRef<number | null>(null);
  const positionRef = useRef(position);
  const selectedGearRef = useRef(selectedGear);
  const callbacksRef = useRef({
    onSelectGear,
    onClutchChange,
    onThrottleChange,
  });
  selectedGearRef.current = selectedGear;
  callbacksRef.current = {
    onSelectGear,
    onClutchChange,
    onThrottleChange,
  };

  useEffect(() => {
    const next = positionForGear(selectedGear);
    positionRef.current = next;
    setPosition(next);
  }, [selectedGear]);

  const getGearRegion = (): Region | null => {
    const container = gearContainerRef.current;
    const pattern = gearPatternRef.current;
    if (!container || !pattern) {
      return null;
    }
    return {
      x: container.x + pattern.x,
      y: container.y + pattern.y,
      width: pattern.width,
      height: pattern.height,
    };
  };

  const moveGear = (x: number, y: number, region: Region) => {
    const next = constrainToGearPattern(
      normalizeGearPosition(
        x - region.x,
        y - region.y,
        region.width,
        region.height,
      ),
    );
    positionRef.current = next;
    setPosition(next);
    setInvalidRelease(false);
  };

  const releaseGear = () => {
    gearTouchIdRef.current = null;
    const nextGear = gearFromPosition(positionRef.current);
    if (
      nextGear === null ||
      !callbacksRef.current.onSelectGear(nextGear)
    ) {
      const resting = positionForGear(selectedGearRef.current);
      positionRef.current = resting;
      setPosition(resting);
      setInvalidRelease(true);
      return;
    }
    setInvalidRelease(false);
  };

  const cancelGear = () => {
    gearTouchIdRef.current = null;
    const resting = positionForGear(selectedGearRef.current);
    positionRef.current = resting;
    setPosition(resting);
    setInvalidRelease(false);
  };

  const syncTouches = (
    event: GestureResponderEvent,
    allowNewGearTouch: boolean,
  ) => {
    const touches = event.nativeEvent.touches;
    const gearRegion = getGearRegion();
    let gearTouch = touches.find(
      touch => touch.identifier === gearTouchIdRef.current,
    );

    if (
      !gearTouch &&
      allowNewGearTouch &&
      gearTouchIdRef.current === null &&
      gearRegion
    ) {
      gearTouch = touches.find(touch =>
        contains(gearRegion, touch.locationX, touch.locationY),
      );
      if (gearTouch) {
        gearTouchIdRef.current = gearTouch.identifier;
      }
    }

    if (gearTouch && gearRegion) {
      moveGear(gearTouch.locationX, gearTouch.locationY, gearRegion);
    }

    const pedalRegion = pedalRegionRef.current;
    if (pedalRegion) {
      const pedalTouches = touches
        .filter(touch =>
          contains(pedalRegion, touch.locationX, touch.locationY),
        )
        .map(touch => ({
          locationX: touch.locationX - pedalRegion.x,
          locationY: touch.locationY - pedalRegion.y,
        }));
      const values = pedalValuesFromTouches(
        pedalTouches,
        pedalRegion.width,
        pedalRegion.height,
      );
      callbacksRef.current.onClutchChange(values.clutch);
      callbacksRef.current.onThrottleChange(values.throttle);
    }
  };

  const handleEnd = (event: GestureResponderEvent) => {
    const activeGearTouch = gearTouchIdRef.current;
    syncTouches(event, false);
    if (
      activeGearTouch !== null &&
      !event.nativeEvent.touches.some(
        touch => touch.identifier === activeGearTouch,
      )
    ) {
      releaseGear();
    }
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: event => syncTouches(event, true),
        onPanResponderStart: event => syncTouches(event, true),
        onPanResponderMove: event => syncTouches(event, true),
        onPanResponderEnd: handleEnd,
        onPanResponderRelease: () => {
          if (gearTouchIdRef.current !== null) {
            releaseGear();
          }
          callbacksRef.current.onClutchChange(0);
          callbacksRef.current.onThrottleChange(0);
        },
        onPanResponderTerminate: () => {
          cancelGear();
          callbacksRef.current.onClutchChange(0);
          callbacksRef.current.onThrottleChange(0);
        },
        onPanResponderTerminationRequest: () => true,
      }),
    [],
  );

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View
        onLayout={event => {
          gearContainerRef.current = event.nativeEvent.layout;
        }}
      >
        <GearSelector
          selectedGear={selectedGear}
          position={position}
          invalidRelease={invalidRelease}
          onPatternLayout={layout => {
            gearPatternRef.current = layout;
          }}
        />
      </View>
      <View
        onLayout={event => {
          pedalRegionRef.current = event.nativeEvent.layout;
        }}
      >
        <PedalControls clutch={clutch} throttle={throttle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    marginTop: 16,
  },
});
