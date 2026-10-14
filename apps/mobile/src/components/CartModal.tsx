import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useMobile } from '../context/MobileContext';
import { submitOrder } from '../api';

interface CartModalProps {
  onOrderSuccess: (orderNumber: string) => void;
}

export function CartModal({ onOrderSuccess }: CartModalProps) {
  const {
    isCartModalOpen,
    setIsCartModalOpen,
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotalCents,
    subtotalFormatted,
    clearCart,
    selectedBranch,
    addOrderToHistory,
  } = useMobile();

  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const isMinMet = orderType === 'pickup' || subtotalCents >= selectedBranch.minimumOrderCents;

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Sepetiniz Boş', 'Lütfen menüden ürün ekleyin.');
      return;
    }
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Eksik Bilgi', 'Ad ve telefon alanı zorunludur.');
      return;
    }
    if (orderType === 'delivery' && !address.trim()) {
      Alert.alert('Eksik Bilgi', 'Paket servis için teslimat adresi zorunludur.');
      return;
    }
    if (orderType === 'delivery' && !isMinMet) {
      Alert.alert('Minimum Sepet', `Paket servis için minimum tutar ${(selectedBranch.minimumOrderCents / 100).toFixed(2)} ₺ olmalıdır.`);
      return;
    }

    setLoading(true);
    try {
      const order = await submitOrder({
        branchId: selectedBranch.id,
        orderType,
        customerName: name,
        customerPhone: phone,
        deliveryAddress: orderType === 'delivery' ? address : undefined,
        paymentMethod: 'card_on_delivery',
        items: cartItems.map((i) => ({
          productId: i.productId,
          name: i.name,
          unitPriceCents: i.unitPriceCents,
          quantity: i.quantity,
        })),
      });

      addOrderToHistory(order);
      clearCart();
      setIsCartModalOpen(false);
      onOrderSuccess(order.orderNumber || (order as any).order_number);
    } catch (e: any) {
      Alert.alert('Sipariş Hatası', e.message || 'Sipariş iletilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isCartModalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsCartModalOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.sheetTitle}>Sipariş Sepetiniz</Text>
              <Text style={styles.sheetSubtitle}>Şube: {selectedBranch.name}</Text>
            </View>
            <TouchableOpacity onPress={() => setIsCartModalOpen(false)} style={styles.closeBtn}>
              <Feather name="x" size={18} color="#1C1C1C" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {cartItems.length === 0 ? (
              <View style={styles.emptyView}>
                <Text style={styles.emptyText}>Sepetiniz boş.</Text>
              </View>
            ) : (
              cartItems.map((item) => (
                <View key={item.productId} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>{(item.unitPriceCents / 100).toFixed(2)} ₺</Text>
                  </View>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Feather name="minus" size={12} color="#1C1C1C" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Feather name="plus" size={12} color="#1C1C1C" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            {cartItems.length > 0 && (
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Teslimat Şekli</Text>
                <View style={styles.typeRow}>
                  <TouchableOpacity
                    style={[styles.typeBtn, orderType === 'delivery' && styles.typeBtnActive]}
                    onPress={() => setOrderType('delivery')}
                  >
                    <Feather
                      name="truck"
                      size={14}
                      color={orderType === 'delivery' ? '#9E1B22' : '#737373'}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.typeBtnText, orderType === 'delivery' && styles.typeBtnTextActive]}>
                      Paket Servis
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.typeBtn, orderType === 'pickup' && styles.typeBtnActive]}
                    onPress={() => setOrderType('pickup')}
                  >
                    <Feather
                      name="shopping-bag"
                      size={14}
                      color={orderType === 'pickup' ? '#9E1B22' : '#737373'}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.typeBtnText, orderType === 'pickup' && styles.typeBtnTextActive]}>
                      Gel-Al (Şubeden)
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Ad Soyad *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ad Soyad"
                  placeholderTextColor="#737373"
                  value={name}
                  onChangeText={setName}
                />

                <Text style={styles.inputLabel}>Telefon * (05XXXXXXXXX)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="05XXXXXXXXX"
                  placeholderTextColor="#737373"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />

                {orderType === 'delivery' && (
                  <>
                    <Text style={styles.inputLabel}>Açık Adres (Osmaniye Merkez) *</Text>
                    <TextInput
                      style={[styles.input, { height: 50 }]}
                      multiline
                      placeholder="Mahalle, cadde, kapı no..."
                      placeholderTextColor="#737373"
                      value={address}
                      onChangeText={setAddress}
                    />
                  </>
                )}
              </View>
            )}
          </ScrollView>

          {cartItems.length > 0 && (
            <View style={styles.footer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Toplam Tutar:</Text>
                <Text style={styles.totalValue}>{subtotalFormatted}</Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={handleCheckout}
                disabled={loading}
              >
                <Text style={styles.checkoutBtnText}>
                  {loading ? 'İletiliyor...' : 'Siparişi Onayla'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  sheetSubtitle: {
    fontSize: 11,
    color: '#737373',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 16,
    color: '#737373',
  },
  body: {
    padding: 16,
  },
  emptyView: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#737373',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  itemPrice: {
    fontSize: 11,
    color: '#737373',
    marginTop: 2,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  formSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  typeBtn: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#1C1C1C',
    borderColor: '#1C1C1C',
  },
  typeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#737373',
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1C1C',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: '#1C1C1C',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 13,
    color: '#737373',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#9E1B22',
  },
  checkoutBtn: {
    backgroundColor: '#9E1B22',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
