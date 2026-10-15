import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useMobile } from '../context/MobileContext';
import { submitCustomCake, formatCustomCakeWhatsAppMessage } from '../api';

export function CustomCakeScreen() {
  const { selectedBranch } = useMobile();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('2026-10-20');
  const [servingSize, setServingSize] = useState('10-12 Kişilik');
  const [flavor, setFlavor] = useState('Çikolata & Antep Fıstığı');
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen adınızı ve cep telefonu numaranızı giriniz.');
      return;
    }

    setLoading(true);
    try {
      const res = await submitCustomCake({
        branchId: selectedBranch.id,
        customerName: name,
        customerPhone: phone,
        deliveryDate: date,
        servingSize,
        flavorPreference: flavor,
        cakeMessage: message || undefined,
        notes: notes || undefined,
      });

      const code = (res as any).request_number || (res as any).requestNumber;
      setSubmittedCode(code);

      // WhatsApp Ticketing: 0 server cost, instant dispatch to the patisserie
      const branchPhone = (selectedBranch.phone || '+90 544 648 60 40').replace(/[^0-9]/g, '');
      const waMsg = formatCustomCakeWhatsAppMessage({
        requestNumber: code,
        branchName: selectedBranch.name,
        customerName: name,
        customerPhone: phone,
        deliveryDate: date,
        servingSize,
        flavorPreference: flavor,
        cakeMessage: message || undefined,
        notes: notes || undefined,
      });

      const waUrl = `https://wa.me/${branchPhone}?text=${encodeURIComponent(waMsg)}`;
      Linking.canOpenURL(waUrl)
        .then((supported) => {
          if (supported) {
            Linking.openURL(waUrl);
          }
        })
        .catch(() => {});
    } catch (e: any) {
      Alert.alert('Hata', e.message || 'Talep iletilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWhatsAppAgain = () => {
    if (!submittedCode) return;
    const branchPhone = (selectedBranch.phone || '+90 544 648 60 40').replace(/[^0-9]/g, '');
    const waMsg = formatCustomCakeWhatsAppMessage({
      requestNumber: submittedCode,
      branchName: selectedBranch.name,
      customerName: name,
      customerPhone: phone,
      deliveryDate: date,
      servingSize,
      flavorPreference: flavor,
      cakeMessage: message || undefined,
      notes: notes || undefined,
    });
    const waUrl = `https://wa.me/${branchPhone}?text=${encodeURIComponent(waMsg)}`;
    Linking.openURL(waUrl).catch(() => {});
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Özel Gün Pastası</Text>
      <Text style={styles.subtitle}>
        Doğum günü, kutlama ve davetleriniz için butik pasta talebinizi iletin.
      </Text>

      {submittedCode ? (
        <View style={styles.successCard}>
          <Feather name="check-circle" size={28} color="#16A34A" style={{ alignSelf: 'center', marginBottom: 8 }} />
          <Text style={styles.successHeading}>Talebiniz Şubeye İletildi</Text>
          <Text style={styles.successCode}>Talep No: {submittedCode}</Text>
          <Text style={styles.successDesc}>
            Ustalarımız talebinizi inceleyip {phone} numaralı telefonunuz üzerinden fiyat teklifi ve detaylar için sizinle iletişime geçecektir.
          </Text>
          <TouchableOpacity style={[styles.resetBtn, { backgroundColor: '#16A34A', marginBottom: 10 }]} onPress={handleOpenWhatsAppAgain}>
            <Text style={[styles.resetBtnText, { color: '#FFFFFF' }]}>WhatsApp ile Şubeye Yaz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetBtn} onPress={() => setSubmittedCode(null)}>
            <Text style={styles.resetBtnText}>Yeni Talep Oluştur</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.formCard}>
          <Text style={styles.label}>Adınız ve Soyadınız *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ad Soyad"
            placeholderTextColor="#737373"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Telefon Numaranız * (05XXXXXXXXX)</Text>
          <TextInput
            style={styles.input}
            placeholder="05XXXXXXXXX"
            placeholderTextColor="#737373"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.label}>Porsiyon / Kişi Sayısı</Text>
          <View style={styles.pillRow}>
            {['6-8 Kişilik', '10-12 Kişilik', '15-20 Kişilik', '25+ Kişilik'].map((size) => (
              <TouchableOpacity
                key={size}
                style={[styles.pill, servingSize === size && styles.pillActive]}
                onPress={() => setServingSize(size)}
              >
                <Text style={[styles.pillText, servingSize === size && styles.pillTextActive]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Lezzet Tercihi</Text>
          <View style={styles.pillRow}>
            {['Çikolata & Fıstık', 'Meyveli', 'Lotus Karamel', 'Çilekli'].map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.pill, flavor === f && styles.pillActive]}
                onPress={() => setFlavor(f)}
              >
                <Text style={[styles.pillText, flavor === f && styles.pillTextActive]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Teslim Tarihi (YYYY-AA-GG)</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-AA-GG"
            placeholderTextColor="#737373"
          />

          <Text style={styles.label}>Pasta Üzeri Yazı (Opsiyonel)</Text>
          <TextInput
            style={styles.input}
            placeholder="İyi ki Doğdun..."
            placeholderTextColor="#737373"
            value={message}
            onChangeText={setMessage}
          />

          <Text style={styles.label}>Özel İstekler / Notlar</Text>
          <TextInput
            style={[styles.input, { height: 60 }]}
            multiline
            placeholder="Tasarım, renk veya kaplama istekleriniz..."
            placeholderTextColor="#737373"
            value={notes}
            onChangeText={setNotes}
          />

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'İletiliyor...' : 'Talebi Şubeye İlet'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  subtitle: {
    fontSize: 12,
    color: '#737373',
    marginTop: 4,
    marginBottom: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 16,
    padding: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1C1C',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1C1C1C',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
    marginBottom: 6,
  },
  pill: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  pillActive: {
    backgroundColor: '#9E1B22',
    borderColor: '#9E1B22',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#737373',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: '#9E1B22',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  successCard: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#9E1B22',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  successHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1C',
    marginBottom: 8,
  },
  successCode: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9E1B22',
    marginBottom: 10,
  },
  successDesc: {
    fontSize: 12,
    color: '#737373',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  resetBtn: {
    backgroundColor: '#1C1C1C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
