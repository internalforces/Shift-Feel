import { StyleSheet, Text, View } from 'react-native';

import { ENGINE_CONFIG } from '../engine-sim/config';
import type { Feedback, Gear } from '../engine-sim/simulation';

interface DashboardProps {
  rpm: number;
  speed: number;
  gear: Gear;
  feedback: Feedback;
}

const FEEDBACK_LABEL: Record<Feedback, string> = {
  ready: '클러치를 밟고 기어를 선택하세요',
  smooth: '부드럽게 체결되었습니다',
  jerk: '회전수 차이로 차체가 울컥합니다',
  grind: '클러치를 더 깊게 밟으세요',
  unsafe: '현재 속도에서는 해당 기어를 선택할 수 없습니다',
  stalled: '시동이 꺼졌습니다',
};

export function Dashboard({ rpm, speed, gear, feedback }: DashboardProps) {
  const gearLabel = gear === 0 ? 'N' : gear === -1 ? 'R' : String(gear);
  const rpmRatio = Math.min(1, rpm / ENGINE_CONFIG.redlineRpm);

  return (
    <View style={styles.panel}>
      <View style={styles.metrics}>
        <View>
          <Text style={styles.label}>RPM</Text>
          <Text style={styles.metric}>{Math.round(rpm).toLocaleString()}</Text>
        </View>
        <View style={styles.gearBox}>
          <Text style={styles.label}>GEAR</Text>
          <Text style={styles.gear}>{gearLabel}</Text>
        </View>
        <View style={styles.rightMetric}>
          <Text style={styles.label}>KM/H</Text>
          <Text style={styles.metric}>{Math.round(Math.abs(speed))}</Text>
        </View>
      </View>
      <View style={styles.rpmTrack}>
        <View style={[styles.rpmFill, { width: `${rpmRatio * 100}%` }]} />
      </View>
      <Text style={[styles.feedback, feedback === 'stalled' && styles.alert]}>
        {FEEDBACK_LABEL[feedback]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: '#161B22', borderRadius: 24, padding: 20 },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#7D8590',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  metric: { color: '#F0F6FC', fontSize: 28, fontWeight: '700', marginTop: 4 },
  gearBox: { alignItems: 'center' },
  gear: { color: '#58D6C7', fontSize: 52, fontWeight: '800', lineHeight: 58 },
  rightMetric: { alignItems: 'flex-end' },
  rpmTrack: {
    height: 8,
    backgroundColor: '#30363D',
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  rpmFill: { height: '100%', backgroundColor: '#58D6C7', borderRadius: 4 },
  feedback: {
    color: '#A8B3BF',
    fontSize: 13,
    marginTop: 14,
    textAlign: 'center',
  },
  alert: { color: '#FF7B72' },
});
