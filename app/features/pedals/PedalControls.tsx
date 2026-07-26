import { StyleSheet, Text, View } from 'react-native';

interface PedalControlsProps {
  clutch: number;
  brake: number;
  throttle: number;
  compact?: boolean;
}

interface PedalMeterProps {
  label: string;
  value: number;
  accent: string;
  showBiteZone?: boolean;
  compact?: boolean;
}

function PedalMeter({
  label,
  value,
  accent,
  showBiteZone,
  compact = false,
}: PedalMeterProps) {
  const percentage = `${Math.round(value * 100)}%`;

  return (
    <View style={[styles.pedal, compact && styles.compactPedal]}>
      <View style={styles.pedalHeader}>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.6}
          numberOfLines={1}
          style={[styles.label, compact && styles.compactLabel]}
        >
          {label}
        </Text>
      </View>
      <View style={styles.track}>
        <Text style={styles.valueInTrack}>{percentage}</Text>
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
      {!compact && <Text style={styles.hint}>위로 밀어 입력</Text>}
    </View>
  );
}

export function PedalControls({
  clutch,
  brake,
  throttle,
  compact = false,
}: PedalControlsProps) {
  return (
    <View
      accessibilityLabel="three pedal controls"
      pointerEvents="none"
      style={[styles.container, compact && styles.compactContainer]}
    >
      <PedalMeter
        label="CLUTCH"
        value={clutch}
        accent="#8B949E"
        showBiteZone
        compact={compact}
      />
      <PedalMeter
        label="BRAKE"
        value={brake}
        accent="#FF7B72"
        compact={compact}
      />
      <PedalMeter
        label="ACCELERATOR"
        value={throttle}
        accent="#F0883E"
        compact={compact}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 12, minHeight: 150 },
  compactContainer: { flex: 1, gap: 8, minHeight: 0 },
  pedal: {
    flex: 1,
    backgroundColor: '#161B22',
    borderRadius: 20,
    padding: 14,
  },
  compactPedal: { borderRadius: 16, padding: 10 },
  pedalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  label: {
    color: '#C9D1D9',
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '700',
  },
  compactLabel: { fontSize: 8, letterSpacing: 0 },
  track: {
    flex: 1,
    minHeight: 82,
    borderRadius: 10,
    backgroundColor: '#30363D',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  fill: { width: '100%' },
  valueInTrack: {
    color: '#F0F6FC',
    fontSize: 12,
    fontWeight: '800',
    left: 0,
    position: 'absolute',
    right: 0,
    textAlign: 'center',
    top: 8,
    zIndex: 2,
  },
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
