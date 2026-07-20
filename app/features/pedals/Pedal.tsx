import { Pressable, StyleSheet, Text, View } from 'react-native';

interface PedalProps {
  label: string;
  value: number;
  accent: string;
  onChange: (value: number) => void;
}

export function Pedal({ label, value, accent, onChange }: PedalProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} pedal`}
      onPressIn={() => onChange(1)}
      onPressOut={() => onChange(0)}
      style={({ pressed }) => [styles.pedal, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { height: `${value * 100}%`, backgroundColor: accent },
          ]}
        />
      </View>
      <Text style={styles.hint}>길게 누르기</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pedal: {
    width: 82,
    backgroundColor: '#161B22',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
  },
  pressed: { transform: [{ scale: 0.98 }] },
  label: {
    color: '#C9D1D9',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  track: {
    width: 34,
    height: 82,
    borderRadius: 8,
    backgroundColor: '#30363D',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: { width: '100%' },
  hint: { color: '#6E7681', fontSize: 9, marginTop: 9 },
});
