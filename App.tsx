/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Dashboard } from './app/features/dashboard/Dashboard';
import { useVehicleSimulation } from './app/features/engine-sim/useVehicleSimulation';
import { GearSelector } from './app/features/gearbox/GearSelector';
import { Pedal } from './app/features/pedals/Pedal';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { vehicle, input, updateInput, selectGear, startEngine } =
    useVehicleSimulation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>MANUAL DRIVE LAB</Text>
          <Text style={styles.title}>SHIFT FEEL</Text>
        </View>
        {!vehicle.engineRunning && (
          <Pressable style={styles.restartButton} onPress={startEngine}>
            <Text style={styles.restartText}>시동 걸기</Text>
          </Pressable>
        )}
      </View>

      <Dashboard
        rpm={vehicle.rpm}
        speed={vehicle.speed}
        gear={vehicle.gear}
        feedback={vehicle.feedback}
      />

      <View style={styles.controls}>
        <Pedal
          label="CLUTCH"
          value={input.clutch}
          accent="#8B949E"
          onChange={clutch => updateInput({ clutch })}
        />
        <GearSelector selectedGear={vehicle.gear} onSelect={selectGear} />
        <Pedal
          label="THROTTLE"
          value={input.throttle}
          accent="#F0883E"
          onChange={throttle => updateInput({ throttle })}
        />
      </View>

      <Text style={styles.guide}>
        클러치를 누른 채 기어 선택 → 스로틀을 누르며 클러치를 천천히 놓아보세요
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
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
  restartButton: {
    backgroundColor: '#F0883E',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  restartText: { color: '#0D1117', fontSize: 12, fontWeight: '800' },
  controls: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    alignItems: 'stretch',
  },
  guide: {
    color: '#7D8590',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default App;
