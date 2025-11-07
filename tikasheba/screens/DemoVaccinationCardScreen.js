import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, BASE_URL } from '../theme';
import { Camera, useCameraPermissions } from 'expo-camera';

export default function DemoVaccinationCardScreen({ token }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function captureImage() {
    setResult(null);
    try {
      if (!permission || !permission.granted) {
        await requestPermission();
      }
      const cam = cameraRef.current;
      if (!cam) {
        setResult({ type: 'error', message: 'Camera not ready' });
        return;
      }
      const photo = await cam.takePictureAsync({ base64: true, quality: 0.6 });
      setImageUri(photo?.uri || null);
      setImageBase64(photo?.base64 || null);
      if (!photo?.base64) {
        setResult({ type: 'error', message: 'Failed to capture base64. Try again.' });
      }
    } catch (e) {
      setResult({ type: 'error', message: e.message });
    }
  }

  async function submitOcr() {
    setLoading(true);
    setResult(null);
    try {
      if (!imageBase64) {
        setResult({ type: 'error', message: 'No image captured. Please capture a clear image.' });
        return;
      }
      const res = await fetch(`${BASE_URL}/api/global/ocr/vaccine-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ image_base64: imageBase64, mimeType: 'image/jpeg' }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || 'OCR failed');
      }
      if (json?.success === false) {
        setResult({ type: 'error', message: json?.message || 'Need a clear image. reg_no not recognized.' });
      } else {
        setResult({ type: 'success', message: 'Vaccine updated', data: json?.data });
      }
    } catch (e) {
      setResult({ type: 'error', message: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.sectionTitle}>Scan Vaccination Card (Demo)</Text>
        <View style={styles.card}>
          {!permission || !permission.granted ? (
            <View>
              <Text style={styles.mutedText}>No access to camera. Please allow permission.</Text>
              <TouchableOpacity style={[styles.primaryBtn, { marginTop: 12 }]} onPress={requestPermission}>
                <Text style={styles.primaryBtnText}>Grant Camera Permission</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cameraBox}>
              <Camera ref={cameraRef} style={{ flex: 1 }} ratio="4:3" />
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={captureImage}>
              <Text style={styles.secondaryBtnText}>Capture Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setImageUri(null); setImageBase64(null); setResult(null); }}>
              <Text style={styles.secondaryBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
          {imageUri ? (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.mutedText}>Preview</Text>
              <Image source={{ uri: imageUri }} style={{ width: '100%', height: 160, borderRadius: 12 }} resizeMode="cover" />
            </View>
          ) : (
            <Text style={[styles.mutedText, { marginTop: 12 }]}>Capture a clear photo of the vaccination card.</Text>
          )}
          <TouchableOpacity style={[styles.primaryBtn, { marginTop: 16 }]} onPress={submitOcr} disabled={loading || !imageBase64}>
            <Text style={styles.primaryBtnText}>{loading ? 'Updating...' : 'Update via OCR'}</Text>
          </TouchableOpacity>
        </View>
        {result && (
          <View style={[styles.info, result.type === 'success' ? { backgroundColor: '#E8F6EE', borderLeftColor: '#2AAA5C' } : { backgroundColor: '#FDECEC', borderLeftColor: '#E53935' }]}>
            <Text style={styles.infoText}>{result.message}</Text>
            {result?.data ? (
              <View style={{ marginTop: 6 }}>
                <Text style={styles.infoText}>reg_no: {result.data.reg_no}</Text>
                <Text style={styles.infoText}>name: {result.data.name}</Text>
                <Text style={styles.infoText}>vaccine: {result.data.vaccine_name}</Text>
                <Text style={styles.infoText}>time: {result.data.time}</Text>
              </View>
            ) : null}
          </View>
        )}
        <InfoBlock text="Use camera to capture the vaccination card, then run OCR to auto-update records." />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoBlock({ text }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '800',
    marginHorizontal: 16,
    marginTop: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 12,
  },
  cameraBox: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  mutedText: { color: theme.muted },
  secondaryBtn: {
    backgroundColor: theme.secondary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  primaryBtn: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  info: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFF5F2',
    borderLeftWidth: 6,
    borderLeftColor: theme.primary,
    padding: 12,
    borderRadius: 12,
  },
  infoText: { color: theme.text },
});