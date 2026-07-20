import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Gear } from '../engine-sim/simulation';

interface GearSelectorProps {
  selectedGear: Gear;
  onSelect: (gear: Gear) => void;
}

const ROWS: Gear[][] = [
  [1, 3, 5],
  [2, 4, -1],
];

export function GearSelector({ selectedGear, onSelect }: GearSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>H-PATTERN</Text>
        <Pressable style={styles.neutral} onPress={() => onSelect(0)}>
          <Text style={styles.neutralText}>N</Text>
        </Pressable>
      </View>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map(gear => {
            const active = selectedGear === gear;
            return (
              <Pressable
                key={gear}
                accessibilityRole="button"
                accessibilityLabel={`${gear === -1 ? 'reverse' : gear} gear`}
                onPress={() => onSelect(gear)}
                style={({ pressed }) => [
                  styles.gearButton,
                  active && styles.gearButtonActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[styles.gearText, active && styles.gearTextActive]}
                >
                  {gear === -1 ? 'R' : gear}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161B22',
    borderRadius: 20,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#7D8590',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  neutral: {
    backgroundColor: '#30363D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  neutralText: { color: '#C9D1D9', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  gearButton: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#30363D',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearButtonActive: { backgroundColor: '#164E4A', borderColor: '#58D6C7' },
  gearText: { color: '#C9D1D9', fontSize: 20, fontWeight: '700' },
  gearTextActive: { color: '#7EE8DB' },
  pressed: { opacity: 0.7 },
});
