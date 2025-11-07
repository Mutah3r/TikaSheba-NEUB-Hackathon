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
import MyVaccinesScreen from './screens/MyVaccinesScreen';
import StaffLogScreen from './screens/StaffLogScreen';
import CentreAppointmentsScreen from './screens/CentreAppointmentsScreen';
import AppointmentDoneScreen from './screens/AppointmentDoneScreen';
import CentreScheduleScreen from './screens/CentreScheduleScreen';
import { theme } from './theme';

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('login'); // 'login' | 'home' | 'scanAppt' | 'citizenVaccines' | 'demoCard' | 'myVaccines' | 'staffLog' | 'centreAppointments' | 'apptDone' | 'centreSchedule'

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

  function handleLogout() {
    setToken(null);
    setUser(null);
    setScreen('login');
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {screen === 'login' && (
        <LoginScreen onSuccess={(t, u) => { setToken(t); setUser(u); }} />
      )}
      {screen !== 'login' && (
        <Header onBack={screen !== 'home' ? () => setScreen('home') : null} onLogout={handleLogout} />
      )}
      {screen === 'home' && (
        <HomeScreen
          user={user}
          onScanAppt={() => setScreen('scanAppt')}
          onCitizenVaccines={() => setScreen('citizenVaccines')}
          onDemoCard={() => setScreen('demoCard')}
          onMyVaccines={() => setScreen('myVaccines')}
          onStaffLog={() => setScreen('staffLog')}
          onCentreAppointments={() => setScreen('centreAppointments')}
          onAppointmentDone={() => setScreen('apptDone')}
          onCentreSchedule={() => setScreen('centreSchedule')}
        />
      )}
      {screen === 'scanAppt' && <ScanAppointmentScreen token={token} />}
      {screen === 'citizenVaccines' && <CitizenVaccinesScreen token={token} />}
      {screen === 'demoCard' && <DemoVaccinationCardScreen token={token} />}
      {screen === 'myVaccines' && <MyVaccinesScreen token={token} />}
      {screen === 'staffLog' && <StaffLogScreen token={token} />}
      {screen === 'centreAppointments' && <CentreAppointmentsScreen token={token} user={user} />}
      {screen === 'apptDone' && <AppointmentDoneScreen token={token} />}
      {screen === 'centreSchedule' && <CentreScheduleScreen token={token} user={user} />}
    </SafeAreaProvider>
  );
}
