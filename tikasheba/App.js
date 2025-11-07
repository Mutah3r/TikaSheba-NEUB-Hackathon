import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Header from './screens/Header';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ScanAppointmentScreen from './screens/ScanAppointmentScreen';
import CitizenVaccinesScreen from './screens/CitizenVaccinesScreen';
import DemoVaccinationCardScreen from './screens/DemoVaccinationCardScreen';
import { theme } from './theme';

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('login'); // 'login' | 'home' | 'scanAppt' | 'citizenVaccines' | 'demoCard'

  // Try to restore session
  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem('ts_token');
        const u = await AsyncStorage.getItem('ts_user');
        if (t && u) {
          setToken(t);
          setUser(JSON.parse(u));
          setScreen('home');
        }
      } catch (_) {}
    })();
  }, []);

  useEffect(() => {
    if (token && user) setScreen('home');
  }, [token, user]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {screen === 'login' && (
        <LoginScreen onSuccess={(t, u) => { setToken(t); setUser(u); }} />
      )}
      {screen !== 'login' && (
        <Header onBack={screen !== 'home' ? () => setScreen('home') : null} />
      )}
      {screen === 'home' && (
        <HomeScreen
          user={user}
          onScanAppt={() => setScreen('scanAppt')}
          onCitizenVaccines={() => setScreen('citizenVaccines')}
          onDemoCard={() => setScreen('demoCard')}
        />
      )}
      {screen === 'scanAppt' && <ScanAppointmentScreen token={token} />}
      {screen === 'citizenVaccines' && <CitizenVaccinesScreen token={token} />}
      {screen === 'demoCard' && <DemoVaccinationCardScreen token={token} />}
    </SafeAreaProvider>
  );
}
