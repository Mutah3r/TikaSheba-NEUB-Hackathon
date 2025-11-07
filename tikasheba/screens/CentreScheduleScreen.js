import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, BASE_URL } from '../theme';

export default function CentreScheduleScreen({ token, user }) {
  const centreId = user?.vc_id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState([]);

  async function load() {
    if (!centreId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/api/capacity/schedule/centre/${centreId}/next30`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to fetch schedule');
      setDays(Array.isArray(json) ? json : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-line */ }, [centreId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <Text style={styles.title}>Centre Schedule (Next 30 Days)</Text>
        {loading && (
          <View style={styles.card}><ActivityIndicator color={theme.primary} /><Text style={styles.muted}>Loading...</Text></View>
        )}
        {error && (
          <View style={[styles.card, styles.error]}><Text style={styles.errorText}>{error}</Text></View>
        )}
        {!loading && !error && (
          <View style={{ marginTop: 8 }}>
            {days.length === 0 ? (
              <View style={styles.card}><Text style={styles.muted}>No schedule entries.</Text></View>
            ) : (
              days.map((d) => (
                <View key={d.date || Math.random()} style={styles.dayCard}>
                  <Text style={styles.dayTitle}>{d.date ? new Date(d.date).toDateString() : 'Date'}</Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                    <View style={styles.badge}><Text style={styles.badgeText}>Capacity: {d.capacity ?? '-'}</Text></View>
                    <View style={[styles.badge, { backgroundColor: '#EAF6FF' }]}><Text style={[styles.badgeText, { color: '#0077CC' }]}>Booked: {d.booked ?? '-'}</Text></View>
                    <View style={[styles.badge, { backgroundColor: '#E8F6EE' }]}><Text style={[styles.badgeText, { color: '#2AAA5C' }]}>Available: {d.available ?? '-'}</Text></View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.text, fontSize: 18, fontWeight: '800', marginTop: 16 },
  muted: { color: theme.muted, marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginTop: 12, borderWidth: 1, borderColor: '#E8EEF5', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  dayCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginTop: 10, borderWidth: 1, borderColor: '#E8EEF5', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  dayTitle: { color: theme.text, fontWeight: '800', fontSize: 16 },
  badge: { backgroundColor: '#F1F5F9', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 },
  badgeText: { color: theme.text, fontWeight: '700' },
  error: { backgroundColor: '#FDECEC', borderLeftWidth: 6, borderLeftColor: '#E53935' },
  errorText: { color: '#B00020' },
});