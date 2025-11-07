import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, BASE_URL } from '../theme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

export default function DemoVaccinationCardScreen({ token }) {
  const MAX_BASE64_CHARS = 120000; // ~90KB binary after base64 decoding
  const REQUEST_TIMEOUT_MS = 20000; // 20 seconds
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [imageTooLarge, setImageTooLarge] = useState(false);
  const [imageSizeKB, setImageSizeKB] = useState(0);

  function estimateSizeKB(base64Str) {
    if (!base64Str) return 0;
    // Base64 expands binary by ~4/3; to estimate bytes from base64 length: bytes ≈ len * 3/4
    const bytes = Math.ceil((base64Str.length * 3) / 4);
    return Math.round(bytes / 1024);
  }

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
      const photo = await cam.takePictureAsync({ base64: true, quality: 0.20, skipProcessing: true, shutterSound: false });
      if (!photo?.base64 || !photo?.uri) {
        setResult({ type: 'error', message: 'Failed to capture base64. Try again.' });
        setImageTooLarge(false);
        setImageSizeKB(0);
        return;
      }
      let workingUri = photo.uri;
      let workingBase64 = photo.base64;
      let sizeKB = estimateSizeKB(workingBase64);

      // First pass: resize to width 800px, compress 0.2
      if (workingBase64.length > MAX_BASE64_CHARS) {
        try {
          const pass1 = await ImageManipulator.manipulateAsync(
            workingUri,
            [{ resize: { width: 800 } }],
            { compress: 0.2, format: ImageManipulator.SaveFormat.JPEG, base64: true }
          );
          workingUri = pass1.uri || workingUri;
          workingBase64 = pass1.base64 || workingBase64;
          sizeKB = estimateSizeKB(workingBase64);
        } catch (err) {
          // If manipulation fails, keep original and continue
        }
      }

      // Second pass: if still too large, resize further to 600px, compress 0.15
      if (workingBase64.length > MAX_BASE64_CHARS) {
        try {
          const pass2 = await ImageManipulator.manipulateAsync(
            workingUri,
            [{ resize: { width: 600 } }],
            { compress: 0.15, format: ImageManipulator.SaveFormat.JPEG, base64: true }
          );
          workingUri = pass2.uri || workingUri;
          workingBase64 = pass2.base64 || workingBase64;
          sizeKB = estimateSizeKB(workingBase64);
        } catch (err) {
          // If manipulation fails, keep previous and continue
        }
      }

      setImageUri(workingUri || null);
      setImageBase64(workingBase64 || null);
      setImageSizeKB(sizeKB);
      const tooLarge = workingBase64.length > MAX_BASE64_CHARS;
      setImageTooLarge(tooLarge);
      if (tooLarge) {
        setResult({ type: 'error', message: `Image too large (~${sizeKB} KB). Please recapture more tightly or with lower quality.` });
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
      if (imageTooLarge) {
        setResult({ type: 'error', message: `Image too large (~${imageSizeKB} KB). Please recapture a smaller image before submitting.` });
        return;
      }
      console.log("Submitting OCR request...");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const res = await fetch(`${BASE_URL}/api/global/ocr/vaccine-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ image_base64: imageBase64, mimeType: 'image/jpeg' }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
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
      if (e?.name === 'AbortError') {
        setResult({ type: 'error', message: `Request timed out after ${Math.round(REQUEST_TIMEOUT_MS / 1000)}s. Please try again with a smaller image or better network.` });
      } else {
        setResult({ type: 'error', message: e.message });
      }
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
              <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
            </View>
          )}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.secondaryBtn, styles.flexBtn]} onPress={captureImage}>
              <Text style={styles.secondaryBtnText}>Capture Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryBtn, styles.flexBtn]} onPress={() => { setImageUri(null); setImageBase64(null); setResult(null); }}>
              <Text style={styles.secondaryBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
          {imageUri ? (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.mutedText}>Preview</Text>
              <Image source={{ uri: imageUri }} style={{ width: '100%', height: 160, borderRadius: 12 }} resizeMode="cover" />
              {imageBase64 ? (
                <Text style={[styles.mutedText, { marginTop: 8 }]}>Size: ~{imageSizeKB} KB {imageTooLarge ? '(too large)' : ''}</Text>
              ) : null}
            </View>
          ) : (
            <Text style={[styles.mutedText, { marginTop: 12 }]}>Capture a clear photo of the vaccination card.</Text>
          )}
          <TouchableOpacity style={[styles.primaryBtn, { marginTop: 16, opacity: loading || !imageBase64 || imageTooLarge ? 0.7 : 1 }]} onPress={submitOcr} disabled={loading || !imageBase64 || imageTooLarge}>
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
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
    fontSize: 16,
  },
  primaryBtn: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  flexBtn: { flex: 1 },
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