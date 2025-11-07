import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, BASE_URL } from '../theme';

export default function AppointmentDoneScreen({ token }) {
  const [appointmentId, setAppointmentId] = useState('');
  const [qrText, setQrText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function submit() {
    try {
      setLoading(true);
      setMessage(null);
      setError(null);
      const body = {};
      if (appointmentId) body.appointment_id = appointmentId;
      if (qrText) body.qr_text = qrText;
      const res = await fetch(`${BASE_URL}/api/appointment/done`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to mark appointment done');
      setMessage('Appointment marked as done successfully.');
      setAppointmentId('');
      setQrText('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <Text style={styles.title}>Mark Appointment Done</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Appointment ID</Text>
          <TextInput value={appointmentId} onChangeText={setAppointmentId} placeholder="Enter appointment ID" style={styles.input} />

          <Text style={styles.label}>QR Text</Text>
          <TextInput value={qrText} onChangeText={setQrText} placeholder="Scan or paste QR text" style={styles.input} multiline />

          <TouchableOpacity style={[styles.btn, loading ? { opacity: 0.6 } : null]} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit</Text>}
          </TouchableOpacity>
        </View>

        {message && <View style={[styles.card, styles.info]}><Text style={styles.infoText}>{message}</Text></View>}
        {error && <View style={[styles.card, styles.error]}><Text style={styles.errorText}>{error}</Text></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.text, fontSize: 18, fontWeight: '800', marginTop: 16 },
  label: { color: theme.text, fontWeight: '700', marginTop: 10 },
  input: { backgroundColor: '#F7FAFD', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 6, borderWidth: 1, borderColor: '#E8EEF5', color: theme.text },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginTop: 12, borderWidth: 1, borderColor: '#E8EEF5', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  btn: { backgroundColor: theme.primary, borderRadius: 14, paddingVertical: 12, marginTop: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800' },
  info: { backgroundColor: '#E8F6EE', borderLeftWidth: 6, borderLeftColor: '#2AAA5C' },
  infoText: { color: '#2AAA5C' },
  error: { backgroundColor: '#FDECEC', borderLeftWidth: 6, borderLeftColor: '#E53935' },
  errorText: { color: '#B00020' },
});