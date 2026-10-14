import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useMobile } from '../context/MobileContext';
import { trackOrder } from '../api';

export function OrdersScreen() {
  const { ordersHistory } = useMobile();
  const [orderQuery, setOrderQuery] = useState('');
  const [queriedOrder, setQueriedOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleTrack = async (refToTrack?: string) => {
    const target = refToTrack || orderQuery;
    if (!target.trim()) return;
    setLoading(true);
    setErr(null);
    try {
      const data = await trackOrder(target.trim());
      setQueriedOrder(data);
    } catch (e: any) {
      setErr('Sipariş bulunamadı. Lütfen sipariş numaranızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string, orderType: string) => {
    const steps = [
      { key: 'received', title: 'Sipariş Alındı', desc: 'Şubeye ulaştı' },
      { key: 'confirmed', title: 'Onaylandı', desc: 'Şube tarafından teyit edildi' },
      { key: 'preparing', title: 'Hazırlanıyor', desc: 'Usta eller tarafından taze hazırlanıyor' },
      {
        key: orderType === 'pickup' ? 'ready_for_pickup' : 'out_for_delivery',
        title: orderType === 'pickup' ? 'Teslimata Hazır' : 'Yola Çıktı',
        desc: orderType === 'pickup' ? 'Şubeden teslim alabilirsiniz' : 'Kuryemiz adresinize teslim ediyor',
      },
      { key: 'completed', title: 'Teslim Edildi', desc: 'Afiyet olsun!' },
    ];
    return steps;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Sipariş Takibi</Text>
      <Text style={styles.subtitle}>
        Verdiğiniz siparişin durumunu anlık olarak canlı takip edin.
      </Text>

      {/* Track by Order Number Card */}
      <View style={styles.trackCard}>
        <Text style={styles.trackCardTitle}>Sipariş Numarası ile Sorgula</Text>
        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <Feather name="search" size={14} color="#737373" style={{ marginRight: 6 }} />
            <TextInput
              style={styles.input}
              placeholder="Örn: YLC-20261014-1234"
              placeholderTextColor="#8C8C8C"
              value={orderQuery}
              onChangeText={setOrderQuery}
              autoCapitalize="characters"
            />
          </View>
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() => handleTrack()}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.trackBtnText}>Sorgula</Text>
            )}
          </TouchableOpacity>
        </View>

        {err && (
          <View style={styles.errBox}>
            <Feather name="alert-circle" size={13} color="#DC2626" />
            <Text style={styles.errText}>{err}</Text>
          </View>
        )}
      </View>

      {/* Query Result Card with Stepper */}
      {queriedOrder && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View>
              <Text style={styles.resultBranch}>{queriedOrder.branchName || 'Yalçın Pastaneleri'}</Text>
              <Text style={styles.resultNumber}>#{queriedOrder.order_number}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.resultPrice}>
                {((queriedOrder.total_cents || queriedOrder.totalCents || 0) / 100).toFixed(2)} ₺
              </Text>
              <Text style={styles.resultPayment}>
                {queriedOrder.payment_method === 'online_card' ? 'Online Ödeme' : 'Kapıda Ödeme'}
              </Text>
            </View>
          </View>

          {/* Stepper Status Progress */}
          <View style={styles.stepperContainer}>
            {getStatusInfo(queriedOrder.status, queriedOrder.order_type).map((step, idx) => {
              const statusSequence = [
                'received',
                'confirmed',
                'preparing',
                queriedOrder.order_type === 'pickup' ? 'ready_for_pickup' : 'out_for_delivery',
                'completed',
              ];
              const currentIndex = statusSequence.indexOf(queriedOrder.status);
              const isPastOrCurrent = currentIndex >= idx;
              const isCurrent = currentIndex === idx;

              return (
                <View key={step.key} style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepCircle,
                      isPastOrCurrent && styles.stepCircleActive,
                      isCurrent && styles.stepCircleCurrent,
                    ]}
                  >
                    {isPastOrCurrent ? (
                      <Feather name="check" size={10} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.stepNum}>{idx + 1}</Text>
                    )}
                  </View>
                  <View style={styles.stepContent}>
                    <Text
                      style={[
                        styles.stepTitle,
                        isCurrent && styles.stepTitleCurrent,
                        !isPastOrCurrent && styles.stepTitlePending,
                      ]}
                    >
                      {step.title}
                    </Text>
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Feather name="map-pin" size={12} color="#737373" />
              <Text style={styles.detailText}>
                {queriedOrder.delivery_address || 'Gel-Al Şubeden Teslim'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Order History */}
      <Text style={styles.historyTitle}>Bu Cihazdaki Son Siparişler</Text>
      {ordersHistory.length === 0 ? (
        <View style={styles.emptyHistory}>
          <Feather name="package" size={24} color="#D4D4D4" />
          <Text style={styles.emptyHistoryText}>
            Henüz bu cihazda tamamlanan veya kayıtlı bir siparişiniz bulunmuyor.
          </Text>
        </View>
      ) : (
        ordersHistory.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.historyCard}
            onPress={() => handleTrack(item.orderNumber)}
            activeOpacity={0.8}
          >
            <View style={styles.historyHeader}>
              <View>
                <Text style={styles.historyNumber}>#{item.orderNumber}</Text>
                <Text style={styles.historyStatus}>{item.status}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.historyPrice}>{(item.totalCents / 100).toFixed(2)} ₺</Text>
                <Feather name="chevron-right" size={14} color="#737373" />
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  subtitle: {
    fontSize: 12,
    color: '#737373',
    marginTop: 2,
    marginBottom: 16,
  },
  trackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 16,
    marginBottom: 16,
  },
  trackCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 13,
    color: '#1C1C1C',
  },
  trackBtn: {
    backgroundColor: '#9E1B22',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 74,
  },
  trackBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  errBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  errText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '500',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 16,
    marginBottom: 20,
    gap: 14,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: 12,
  },
  resultBranch: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9E1B22',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  resultNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1C',
    marginTop: 2,
  },
  resultPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  resultPayment: {
    fontSize: 10,
    color: '#737373',
    fontWeight: '500',
    marginTop: 1,
  },
  stepperContainer: {
    gap: 12,
    paddingVertical: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#16A34A',
  },
  stepCircleCurrent: {
    backgroundColor: '#9E1B22',
  },
  stepNum: {
    fontSize: 10,
    fontWeight: '700',
    color: '#737373',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  stepTitleCurrent: {
    color: '#9E1B22',
  },
  stepTitlePending: {
    color: '#A3A3A3',
  },
  stepDesc: {
    fontSize: 10,
    color: '#737373',
    marginTop: 1,
  },
  detailsRow: {
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 11,
    color: '#525252',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1C1C',
    marginBottom: 8,
  },
  emptyHistory: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyHistoryText: {
    fontSize: 12,
    color: '#737373',
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 14,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  historyStatus: {
    fontSize: 11,
    color: '#737373',
    marginTop: 2,
  },
  historyPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1C1C',
  },
});
