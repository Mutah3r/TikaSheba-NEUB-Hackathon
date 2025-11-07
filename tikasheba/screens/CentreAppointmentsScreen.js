import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, BASE_URL } from '../theme';

const STATUSES = ['requested', 'scheduled', 'done', 'cancelled', 'missed'];

export default function CentreAppointmentsScreen({ token, user }) {
  const centreId = user?.vc_id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [time, setTime] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState(null);

  async function load() {
    if (!centreId) return;
    try {
      setLoading(true);
      setError(null);
      let url = `${BASE_URL}/api/appointment/centre/${centreId}`;
      if (status && !time) url = `${BASE_URL}/api/appointment/centre/${centreId}/status/${status}`;
      if (status && time) url = `${BASE_URL}/api/appointment/centre/${centreId}/status/${status}/time/${encodeURIComponent(time)}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to fetch appointments');
      setItems(Array.isArray(json) ? json : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-line */ }, [centreId]);
  useEffect(() => { load(); /* eslint-disable-line */ }, [status, time]);

  async function updateStatus(id, next) {
    try {
      setUpdatingId(id);
      setMessage(null);
      const res = await fetch(`${BASE_URL}/api/appointment/${id}/centre/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to update status');
      setMessage(`Updated ${id} -> ${next}`);
      await load();
    } catch (e) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <Text style={styles.title}>Centre Appointments</Text>
        <View style={styles.filters}>
          <View style={styles.statusRow}>
            {STATUSES.map((s) => (
              <TouchableOpacity key={s} style={[styles.chip, status === s ? styles.chipActive : null]} onPress={() => setStatus(status === s ? '' : s)}>
                <Text style={[styles.chipText, status === s ? styles.chipTextActive : null]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Time (exact match)</Text>
          <TextInput value={time} onChangeText={setTime} placeholder="HH:MM (24h)" style={styles.input} />
        </View>

        {loading && (
          <View style={styles.card}><ActivityIndicator color={theme.primary} /><Text style={styles.muted}>Loading...</Text></View>
        )}
        {error && (
          <View style={[styles.card, styles.error]}><Text style={styles.errorText}>{error}</Text></View>
        )}
        {message && (
          <View style={[styles.card, styles.info]}><Text style={styles.infoText}>{message}</Text></View>
        )}
        {!loading && !error && (
          <View style={styles.list}>
            {items.length === 0 ? (
              <View style={styles.card}><Text style={styles.muted}>No appointments found.</Text></View>
            ) : (
              items.map((it) => (
                <View key={it._id} style={styles.item}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{it.vaccine_name}</Text>
                    <Text style={styles.itemSub}>Citizen: {it.citizen_id}</Text>
                    <Text style={styles.itemSub}>Date: {new Date(it.date).toLocaleString()}</Text>
                    <Text style={styles.itemSub}>Time: {it.time}</Text>
                    <Text style={styles.itemSub}>Status: {it.status}</Text>
                  </View>
                  <View style={styles.actionCol}>
                    <TouchableOpacity style={[styles.btnSmall, styles.btnOk, { opacity: updatingId === it._id ? 0.6 : 1 }]} disabled={updatingId === it._id} onPress={() => updateStatus(it._id, 'scheduled')}>
                      <Text style={styles.btnSmallText}>Scheduled</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btnSmall, styles.btnWarn, { opacity: updatingId === it._id ? 0.6 : 1 }]} disabled={updatingId === it._id} onPress={() => updateStatus(it._id, 'missed')}>
                      <Text style={styles.btnSmallText}>Missed</Text>
                    </TouchableOpacity>
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
  label: { color: theme.text, fontWeight: '700', marginTop: 10 },
  filters: { marginTop: 8 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#EFF5FB', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#DCE7F5' },
  chipActive: { backgroundColor: theme.secondary, borderColor: theme.secondary },
  chipText: { color: theme.text, fontWeight: '700' },
  chipTextActive: { color: '#fff' },
  input: { backgroundColor: '#F7FAFD', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 6, borderWidth: 1, borderColor: '#E8EEF5', color: theme.text },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginTop: 12, borderWidth: 1, borderColor: '#E8EEF5', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  list: { marginTop: 8 },
  item: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginTop: 10, borderWidth: 1, borderColor: '#E8EEF5', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 1, flexDirection: 'row', gap: 12 },
  itemTitle: { color: theme.text, fontWeight: '800', fontSize: 16 },
  itemSub: { color: theme.muted, marginTop: 4 },
  actionCol: { gap: 8, justifyContent: 'center' },
  btnSmall: { borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10, alignItems: 'center' },
  btnSmallText: { color: '#fff', fontWeight: '700' },
  btnOk: { backgroundColor: '#2AAA5C' },
  btnWarn: { backgroundColor: '#E53935' },
  info: { backgroundColor: '#E8F6EE', borderLeftWidth: 6, borderLeftColor: '#2AAA5C' },
  error: { backgroundColor: '#FDECEC', borderLeftWidth: 6, borderLeftColor: '#E53935' },
  errorText: { color: '#B00020' },
});