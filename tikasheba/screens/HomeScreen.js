import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';

export default function HomeScreen({
  user,
  onScanAppt,
  onCitizenVaccines,
  onDemoCard,
  onMyVaccines,
  onStaffLog,
  onCentreAppointments,
  onAppointmentDone,
  onCentreSchedule,
}) {
  const initials = (user?.name || '-')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top', 'bottom']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <View style={styles.banner}>
          <View style={styles.bannerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.greet}>Hi, {user?.name || 'Staff'}</Text>
              <Text style={styles.subGreet}>Welcome back to TikaSheba</Text>
            </View>
          </View>
          {user?.centre_name || user?.vc_id ? (
            <View style={styles.bannerMeta}>
              {user?.centre_name ? (
                <Text style={styles.metaText}>Centre: <Text style={styles.metaValue}>{user.centre_name}</Text></Text>
              ) : null}
              {user?.vc_id ? (
                <Text style={styles.metaText}>ID: <Text style={styles.metaValue}>{user.vc_id}</Text></Text>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.grid}>
            <TouchableOpacity style={styles.tile} onPress={onScanAppt}>
              <Text style={styles.tileIcon}>📷</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.tileTitle}>Scan Appointment QR</Text>
                <Text style={styles.tileDesc}>Scan and mark as done</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tile} onPress={onCitizenVaccines}>
              <Text style={styles.tileIcon}>📇</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.tileTitle}>Citizen Vaccine List</Text>
                <Text style={styles.tileDesc}>View all taken vaccines</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tile} onPress={onDemoCard}>
              <Text style={styles.tileIcon}>🪪</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.tileTitle}>Scan Vaccination Card</Text>
                <Text style={styles.tileDesc}>Scan card and add vaccine data</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Core Staff Actions</Text>
          <View style={styles.grid}>
            <TouchableOpacity style={styles.tile} onPress={onMyVaccines}>
              <Text style={styles.tileIcon}>🧪</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.tileTitle}>My Assigned Vaccines</Text>
                <Text style={styles.tileDesc}>See vaccines you handle</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tile} onPress={onStaffLog}>
              <Text style={styles.tileIcon}>🧾</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.tileTitle}>Log Vaccine Usage</Text>
                <Text style={styles.tileDesc}>Record used and wasted doses</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Handling</Text>
          <View style={styles.grid}>

            <TouchableOpacity style={styles.tile} onPress={onCentreAppointments}>
              <Text style={styles.tileIcon}>📅</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.tileTitle}>Centre Appointments</Text>
                <Text style={styles.tileDesc}>List and update status</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tile} onPress={onCentreSchedule}>
              <Text style={styles.tileIcon}>🗓️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.tileTitle}>Centre Schedule (30d)</Text>
                <Text style={styles.tileDesc}>Capacity and slots overview</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Role</Text>
          <View style={styles.infoCard}>
            <View style={styles.badgeRow}>
              <View style={styles.roleBadge}><Text style={styles.roleBadgeText}>{user?.role || 'staff'}</Text></View>
            </View>
            <View style={{ height: 8 }} />
            <View style={styles.kvRow}><Text style={styles.k}>Name</Text><Text style={styles.v}>{user?.name || '-'}</Text></View>
            {user?.centre_name ? (
              <View style={styles.kvRow}><Text style={styles.k}>Centre</Text><Text style={styles.v}>{user.centre_name}</Text></View>
            ) : null}
            {user?.vc_id ? (
              <View style={styles.kvRow}><Text style={styles.k}>Centre ID</Text><Text style={styles.v}>{user.vc_id}</Text></View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: theme.secondary,
    borderRadius: 18,
    padding: 18,
    marginTop: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  greet: { color: '#fff', fontSize: 20, fontWeight: '800' },
  subGreet: { color: '#CBE3F8', marginTop: 2 },
  bannerMeta: { flexDirection: 'row', gap: 18, marginTop: 12 },
  metaText: { color: '#EAF5FF' },
  metaValue: { color: '#fff', fontWeight: '700' },

  section: { marginTop: 16 },
  sectionTitle: { color: theme.text, fontWeight: '800', fontSize: 16, marginBottom: 8, paddingHorizontal: 2 },

  grid: {
    gap: 12,
  },
  tile: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E8EEF5',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  tileIcon: { fontSize: 22 },
  tileTitle: { color: theme.text, fontWeight: '800', fontSize: 16 },
  tileDesc: { color: theme.muted, marginTop: 2 },

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8EEF5',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  badgeRow: { flexDirection: 'row' },
  roleBadge: {
    backgroundColor: theme.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  roleBadgeText: { color: '#fff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  k: { color: theme.muted },
  v: { color: theme.text, fontWeight: '700' },
});