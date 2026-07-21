import { useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';

import type { Gear } from '../engine-sim/simulation';
import {
  constrainToGearPattern,
  gearFromPosition,
  normalizeGearPosition,
  positionForGear,
  type NormalizedPosition,
} from './gearPattern';

interface GearSelectorProps {
  selectedGear: Gear;
  onSelect: (gear: Gear) => boolean;
}

interface PatternSize {
  width: number;
  height: number;
}

const GEAR_LABELS: Array<{ gear: Gear; label: string }> = [
  { gear: 1, label: '1' },
  { gear: 2, label: '2' },
  { gear: 3, label: '3' },
  { gear: 4, label: '4' },
  { gear: 5, label: '5' },
  { gear: -1, label: 'R' },
];

export function GearSelector({ selectedGear, onSelect }: GearSelectorProps) {
  const [position, setPosition] = useState<NormalizedPosition>(
    positionForGear(selectedGear),
  );
  const [invalidRelease, setInvalidRelease] = useState(false);
  const sizeRef = useRef<PatternSize>({ width: 0, height: 0 });
  const positionRef = useRef(position);
  const selectedGearRef = useRef(selectedGear);
  const onSelectRef = useRef(onSelect);
  selectedGearRef.current = selectedGear;
  onSelectRef.current = onSelect;

  useEffect(() => {
    const next = positionForGear(selectedGear);
    positionRef.current = next;
    setPosition(next);
  }, [selectedGear]);

  const moveLever = (event: GestureResponderEvent) => {
    const next = constrainToGearPattern(
      normalizeGearPosition(
        event.nativeEvent.locationX,
        event.nativeEvent.locationY,
        sizeRef.current.width,
        sizeRef.current.height,
      ),
    );
    positionRef.current = next;
    setPosition(next);
    setInvalidRelease(false);
  };

  const releaseLever = () => {
    const nextGear = gearFromPosition(positionRef.current);
    if (nextGear === null) {
      const resting = positionForGear(selectedGearRef.current);
      positionRef.current = resting;
      setPosition(resting);
      setInvalidRelease(true);
      return;
    }

    if (!onSelectRef.current(nextGear)) {
      const resting = positionForGear(selectedGearRef.current);
      positionRef.current = resting;
      setPosition(resting);
      setInvalidRelease(true);
      return;
    }

    setInvalidRelease(false);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: moveLever,
        onPanResponderMove: moveLever,
        onPanResponderRelease: releaseLever,
        onPanResponderTerminate: releaseLever,
        onPanResponderTerminationRequest: () => false,
      }),
    [],
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    sizeRef.current = event.nativeEvent.layout;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>H-PATTERN</Text>
        <Text style={[styles.status, invalidRelease && styles.statusInvalid]}>
          {invalidRelease ? '게이트 밖' : '드래그하여 변속'}
        </Text>
      </View>
      <View
        accessibilityLabel="H-pattern gear lever"
        onLayout={handleLayout}
        style={styles.pattern}
        {...panResponder.panHandlers}
      >
        <View style={[styles.verticalGate, styles.leftGate]} />
        <View style={[styles.verticalGate, styles.centerGate]} />
        <View style={[styles.verticalGate, styles.rightGate]} />
        <View style={styles.neutralGate} />

        {GEAR_LABELS.map(({ gear, label }) => {
          const gearPosition = positionForGear(gear);
          return (
            <Text
              key={gear}
              style={[
                styles.gearLabel,
                {
                  left: `${gearPosition.x * 100}%`,
                  top: `${gearPosition.y * 100}%`,
                },
              ]}
            >
              {label}
            </Text>
          );
        })}

        <View
          style={[
            styles.knob,
            {
              left: `${position.x * 100}%`,
              top: `${position.y * 100}%`,
            },
          ]}
        >
          <Text style={styles.knobText}>
            {selectedGear === 0
              ? 'N'
              : selectedGear === -1
              ? 'R'
              : selectedGear}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#161B22', borderRadius: 20, padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    color: '#7D8590',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  status: { color: '#6E7681', fontSize: 10 },
  statusInvalid: { color: '#FF7B72' },
  pattern: { height: 190, position: 'relative' },
  verticalGate: {
    position: 'absolute',
    top: '20%',
    bottom: '20%',
    width: 5,
    marginLeft: -2.5,
    borderRadius: 3,
    backgroundColor: '#30363D',
  },
  leftGate: { left: '18%' },
  centerGate: { left: '50%' },
  rightGate: { left: '82%' },
  neutralGate: {
    position: 'absolute',
    left: '18%',
    right: '18%',
    top: '50%',
    height: 5,
    marginTop: -2.5,
    borderRadius: 3,
    backgroundColor: '#30363D',
  },
  gearLabel: {
    position: 'absolute',
    color: '#7D8590',
    fontSize: 12,
    fontWeight: '800',
    transform: [{ translateX: -4 }, { translateY: -30 }],
  },
  knob: {
    position: 'absolute',
    width: 46,
    height: 46,
    marginLeft: -23,
    marginTop: -23,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#7EE8DB',
    backgroundColor: '#164E4A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#58D6C7',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  knobText: { color: '#F0F6FC', fontSize: 15, fontWeight: '800' },
});
