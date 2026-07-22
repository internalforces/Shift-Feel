import {
  StyleSheet,
  Text,
  View,
  type LayoutRectangle,
} from 'react-native';

import type { Gear } from '../engine-sim/simulation';
import {
  positionForGear,
  type NormalizedPosition,
} from './gearPattern';

interface GearSelectorProps {
  selectedGear: Gear;
  position: NormalizedPosition;
  invalidRelease: boolean;
  onPatternLayout: (layout: LayoutRectangle) => void;
}

const GEAR_LABELS: Array<{ gear: Gear; label: string }> = [
  { gear: 1, label: '1' },
  { gear: 2, label: '2' },
  { gear: 3, label: '3' },
  { gear: 4, label: '4' },
  { gear: 5, label: '5' },
  { gear: -1, label: 'R' },
];

export function GearSelector({
  selectedGear,
  position,
  invalidRelease,
  onPatternLayout,
}: GearSelectorProps) {
  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>H-PATTERN</Text>
        <Text style={[styles.status, invalidRelease && styles.statusInvalid]}>
          {invalidRelease ? '게이트 밖' : '드래그하여 변속'}
        </Text>
      </View>
      <View
        accessibilityLabel="H-pattern gear lever"
        onLayout={event => {
          onPatternLayout(event.nativeEvent.layout);
        }}
        style={styles.pattern}
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
