import { useMemo, useRef } from 'react';
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';

import { pedalValuesFromTouches } from './pedalMath';

interface PedalControlsProps {
  clutch: number;
  throttle: number;
  onClutchChange: (value: number) => void;
  onThrottleChange: (value: number) => void;
}

interface ControlSize {
  width: number;
  height: number;
}

interface PedalMeterProps {
  label: string;
  value: number;
  accent: string;
  showBiteZone?: boolean;
}

function PedalMeter({ label, value, accent, showBiteZone }: PedalMeterProps) {
  return (
    <View style={styles.pedal}>
      <View style={styles.pedalHeader}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{Math.round(value * 100)}%</Text>
      </View>
      <View style={styles.track}>
        {showBiteZone && (
          <View style={styles.biteZone}>
            <Text style={styles.biteLabel}>BITE</Text>
          </View>
        )}
        <View
          style={[
            styles.fill,
            { height: `${value * 100}%`, backgroundColor: accent },
          ]}
        />
      </View>
      <Text style={styles.hint}>위로 밀어 입력</Text>
    </View>
  );
}

export function PedalControls({
  clutch,
  throttle,
  onClutchChange,
  onThrottleChange,
}: PedalControlsProps) {
  const sizeRef = useRef<ControlSize>({ width: 0, height: 0 });
  const callbacksRef = useRef({ onClutchChange, onThrottleChange });
  callbacksRef.current = { onClutchChange, onThrottleChange };

  const updateFromTouches = (event: GestureResponderEvent) => {
    const values = pedalValuesFromTouches(
      event.nativeEvent.touches,
      sizeRef.current.width,
      sizeRef.current.height,
    );
    callbacksRef.current.onClutchChange(values.clutch);
    callbacksRef.current.onThrottleChange(values.throttle);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: updateFromTouches,
        onPanResponderStart: updateFromTouches,
        onPanResponderMove: updateFromTouches,
        onPanResponderEnd: updateFromTouches,
        onPanResponderRelease: () => {
          callbacksRef.current.onClutchChange(0);
          callbacksRef.current.onThrottleChange(0);
        },
        onPanResponderTerminate: () => {
          callbacksRef.current.onClutchChange(0);
          callbacksRef.current.onThrottleChange(0);
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [],
  );

  return (
    <View
      accessibilityLabel="dual pedal controls"
      onLayout={event => {
        sizeRef.current = event.nativeEvent.layout;
      }}
      style={styles.container}
      {...panResponder.panHandlers}
    >
      <PedalMeter label="CLUTCH" value={clutch} accent="#8B949E" showBiteZone />
      <PedalMeter label="THROTTLE" value={throttle} accent="#F0883E" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 12, minHeight: 150 },
  pedal: {
    flex: 1,
    backgroundColor: '#161B22',
    borderRadius: 20,
    padding: 14,
  },
  pedalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  label: { color: '#C9D1D9', fontSize: 12, fontWeight: '700' },
  value: { color: '#F0F6FC', fontSize: 13, fontWeight: '800' },
  track: {
    flex: 1,
    minHeight: 82,
    borderRadius: 10,
    backgroundColor: '#30363D',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: { width: '100%' },
  biteZone: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '25%',
    height: '50%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#58D6C7',
    backgroundColor: 'rgba(88, 214, 199, 0.1)',
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biteLabel: {
    color: '#7EE8DB',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  hint: { color: '#6E7681', fontSize: 9, marginTop: 8, textAlign: 'center' },
});
