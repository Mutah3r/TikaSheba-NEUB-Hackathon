import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';

export default function Header({ onBack, onLogout }) {
  const insets = useSafeAreaInsets();
  async function handleLogout() {
    try {
      await AsyncStorage.removeItem('ts_token');
      await AsyncStorage.removeItem('ts_user');
    } catch (_) {}
    if (typeof onLogout === 'function') onLogout();
  }
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.iconText} accessibilityRole="button" accessibilityLabel="Back">←</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>TikaSheba Staff</Text>
      <View style={{ flex: 1 }} />
      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.iconText} accessibilityRole="button" accessibilityLabel="Logout">🚪</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.secondary,
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    backgroundColor: theme.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  iconText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  logoutBtn: {
    backgroundColor: theme.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
});