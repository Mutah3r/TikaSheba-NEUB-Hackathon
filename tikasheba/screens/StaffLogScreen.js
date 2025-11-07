import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, BASE_URL } from '../theme';

export default function StaffLogScreen({ token }) {
  const [loading, setLoading] = useState(true);
  const [vaccines, setVaccines] = useState([]);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [doseUsed, setDoseUsed] = useState('');
  const [doseWasted, setDoseWasted] = useState('');
  const [dateISO, setDateISO] = useState(new Date().toISOString());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

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
        const list = Array.isArray(json?.vaccine_list) ? json.vaccine_list : [];
        setVaccines(list);
        setSelectedId(list[0]?.centre_vaccine_id || null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  async function submit() {
    try {
      setSubmitting(true);
      setResult(null);
      if (!selectedId) {
        setResult({ type: 'error', message: 'Please select a vaccine' });
        return;
      }
      const du = Number(doseUsed) || 0;
      const dw = Number(doseWasted) || 0;
      const res = await fetch(`${BASE_URL}/api/staff/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ centre_vaccine_id: selectedId, date: dateISO, dose_used: du, dose_wasted: dw }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to submit');
      setResult({ type: 'success', message: 'Log submitted', data: json?.data });
      setDoseUsed('');
      setDoseWasted('');
    } catch (e) {
      setResult({ type: 'error', message: e.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <Text style={styles.title}>Log Vaccine Usage</Text>
        {loading && (
          <View style={styles.card}><ActivityIndicator color={theme.primary} /><Text style={styles.muted}>Loading...</Text></View>
        )}
        {error && (
          <View style={[styles.card, styles.error]}><Text style={styles.errorText}>{error}</Text></View>
        )}
        {!loading && !error && (
          <View style={styles.card}>
            <Text style={styles.label}>Select Vaccine</Text>
            <View style={styles.selectRow}>
              {vaccines.map((v) => (
                <TouchableOpacity
                  key={v.centre_vaccine_id}
                  style={[
                    styles.selectItem,
                    selectedId === v.centre_vaccine_id ? styles.selectItemActive : null,
                  ]}
                  onPress={() => setSelectedId(v.centre_vaccine_id)}
                >
                  <Text
                    style={[
                      styles.selectText,
                      selectedId === v.centre_vaccine_id ? styles.selectTextActive : null,
                    ]}
                  >
                    {v.vaccine_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Dose Used</Text>
            <TextInput value={doseUsed} onChangeText={setDoseUsed} keyboardType="numeric" placeholder="e.g., 12" style={styles.input} />

            <Text style={styles.label}>Dose Wasted</Text>
            <TextInput value={doseWasted} onChangeText={setDoseWasted} keyboardType="numeric" placeholder="e.g., 1" style={styles.input} />

            <Text style={styles.label}>Date/Time (ISO)</Text>
            <TextInput value={dateISO} onChangeText={setDateISO} placeholder="YYYY-MM-DDTHH:mm:ssZ" style={styles.input} />

            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 12, opacity: submitting ? 0.7 : 1 }]} onPress={submit} disabled={submitting}>
              <Text style={styles.primaryBtnText}>{submitting ? 'Submitting...' : 'Submit Log'}</Text>
            </TouchableOpacity>
            {result && (
              <View style={[styles.info, result.type === 'success' ? styles.infoOk : styles.infoErr]}>
                <Text style={styles.infoText}>{result.message}</Text>
              </View>
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
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginTop: 12,
    borderWidth: 1, borderColor: '#E8EEF5', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  input: {
    backgroundColor: '#F7FAFD', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 6,
    borderWidth: 1, borderColor: '#E8EEF5', color: theme.text,
  },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  selectItem: {
    backgroundColor: '#F2F7FF', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: '#DCE7F5',
  },
  selectItemActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  selectText: { color: theme.text, fontWeight: '700' },
  selectTextActive: { color: '#fff' },
  primaryBtn: {
    backgroundColor: theme.primary,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', letterSpacing: 0.5, fontSize: 16 },
  info: { marginTop: 12, padding: 12, borderRadius: 12 },
  infoOk: { backgroundColor: '#E8F6EE', borderLeftWidth: 6, borderLeftColor: '#2AAA5C' },
  infoErr: { backgroundColor: '#FDECEC', borderLeftWidth: 6, borderLeftColor: '#E53935' },
  infoText: { color: theme.text },
  error: { backgroundColor: '#FDECEC', borderLeftWidth: 6, borderLeftColor: '#E53935' },
  errorText: { color: '#B00020' },
});