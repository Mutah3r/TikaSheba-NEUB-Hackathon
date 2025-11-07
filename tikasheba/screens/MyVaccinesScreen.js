import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, BASE_URL } from '../theme';

export default function MyVaccinesScreen({ token }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/staff/me/vaccines`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Failed to fetch');
        setItems(json?.vaccine_list || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <Text style={styles.title}>My Assigned Vaccines</Text>
        {loading && (
          <View style={styles.card}><ActivityIndicator color={theme.primary} /><Text style={styles.muted}>Loading...</Text></View>
        )}
        {error && (
          <View style={[styles.card, styles.error]}><Text style={styles.errorText}>{error}</Text></View>
        )}
        {!loading && !error && (
          <View style={styles.list}>
            {items.length === 0 ? (
              <View style={styles.card}><Text style={styles.muted}>No vaccines assigned yet.</Text></View>
            ) : (
              items.map((it, idx) => (
                <View key={`${it.centre_vaccine_id}-${idx}`} style={styles.item}>
                  <Text style={styles.itemTitle}>{it.vaccine_name}</Text>
                  <Text style={styles.itemSub}>ID: {it.centre_vaccine_id}</Text>
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
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginTop: 12,
    borderWidth: 1, borderColor: '#E8EEF5', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  error: { backgroundColor: '#FDECEC', borderLeftWidth: 6, borderLeftColor: '#E53935' },
  errorText: { color: '#B00020' },
  list: { marginTop: 8 },
  item: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginTop: 10,
    borderWidth: 1, borderColor: '#E8EEF5', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 1,
  },
  itemTitle: { color: theme.text, fontWeight: '800', fontSize: 16 },
  itemSub: { color: theme.muted, marginTop: 4 },
});