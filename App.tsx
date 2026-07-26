/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { DrivingControls } from './app/features/controls/DrivingControls';
import { Dashboard } from './app/features/dashboard/Dashboard';
import { ENGINE_CONFIG } from './app/features/engine-sim/config';
import { useVehicleSimulation } from './app/features/engine-sim/useVehicleSimulation';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { vehicle, input, updateInput, selectGear, startEngine, stopEngine } =
    useVehicleSimulation();
  const { width, height } = useWindowDimensions();
  const compact = width > height;
  const shortLandscape = compact && height < 360;
  const canRestart = vehicle.gear === 0;
  const canStopEngine =
    Math.abs(vehicle.speed) < ENGINE_CONFIG.minimumMovingSpeed;
  const actionDisabled = vehicle.engineRunning ? !canStopEngine : !canRestart;

  const drivingSurface = (
    <View
      style={[
        styles.container,
        compact && styles.compactContainer,
        shortLandscape && styles.shortLandscapeContainer,
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>MANUAL DRIVE LAB</Text>
          <Text style={[styles.title, compact && styles.compactTitle]}>
            SHIFT FEEL
          </Text>
        </View>
        <Pressable
          accessibilityLabel={
            vehicle.engineRunning
              ? canStopEngine
                ? '시동 끄기'
                : '주행 중에는 시동을 끌 수 없습니다'
              : canRestart
              ? '시동 걸기'
              : 'N단으로 변속'
          }
          disabled={actionDisabled}
          style={[
            styles.restartButton,
            vehicle.engineRunning && styles.stopButton,
            actionDisabled && styles.restartDisabled,
          ]}
          onPress={vehicle.engineRunning ? stopEngine : startEngine}
        >
          <Text style={styles.restartText}>
            {vehicle.engineRunning
              ? '시동 끄기'
              : canRestart
              ? '시동 걸기'
              : 'N단으로 변속'}
          </Text>
        </Pressable>
      </View>

      <Dashboard
        rpm={vehicle.rpm}
        speed={vehicle.speed}
        gear={vehicle.gear}
        feedback={vehicle.feedback}
        compact={compact}
      />

      <DrivingControls
        selectedGear={vehicle.gear}
        clutch={input.clutch}
        brake={input.brake}
        throttle={input.throttle}
        onSelectGear={selectGear}
        onClutchChange={clutch => updateInput({ clutch })}
        onBrakeChange={brake => updateInput({ brake })}
        onThrottleChange={throttle => updateInput({ throttle })}
        compact={compact}
      />

      {!compact && (
        <Text style={styles.guide}>
          클러치를 누른 채 기어 선택 → 스로틀을 누르며 클러치를 천천히
          놓아보세요
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {shortLandscape ? (
        <ScrollView
          style={styles.shortLandscapeScroll}
          contentContainerStyle={styles.shortLandscapeScrollContent}
        >
          {drivingSurface}
        </ScrollView>
      ) : (
        drivingSurface
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  compactContainer: { paddingHorizontal: 14, paddingVertical: 6 },
  shortLandscapeContainer: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
  },
  shortLandscapeScroll: { flex: 1 },
  shortLandscapeScrollContent: { paddingBottom: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  eyebrow: {
    color: '#58D6C7',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    color: '#F0F6FC',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  compactTitle: { fontSize: 21 },
  restartButton: {
    backgroundColor: '#F0883E',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  stopButton: { backgroundColor: '#FF7B72' },
  restartDisabled: { backgroundColor: '#30363D' },
  restartText: { color: '#0D1117', fontSize: 12, fontWeight: '800' },
  guide: {
    color: '#7D8590',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default App;
