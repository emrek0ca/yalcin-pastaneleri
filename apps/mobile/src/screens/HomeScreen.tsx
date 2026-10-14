import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useMobile } from '../context/MobileContext';
import { VERIFIED_BRANCHES } from '@yalcin/shared';
import { getProducts, getCategories, MobileProduct, MobileCategory } from '../api';

interface HomeScreenProps {
  onNavigateToMenu: (category?: string) => void;
  onNavigateToCustomCake: () => void;
}

export function HomeScreen({ onNavigateToMenu, onNavigateToCustomCake }: HomeScreenProps) {
  const { selectedBranch, setSelectedBranch, addToCart } = useMobile();
  const [signatureItems, setSignatureItems] = useState<MobileProduct[]>([]);
  const [categories, setCategories] = useState<MobileCategory[]>([]);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      try {
        const [cats, prods] = await Promise.all([
          getCategories(selectedBranch.id),
          getProducts({ branchId: selectedBranch.id }),
        ]);
        if (isMounted) {
          setCategories(cats.slice(0, 8)); // Top 8 categories
          // Pick 6 prominent items with authentic pictures
          const signature = prods
            .filter((p) => p.imageUrl && p.imageUrl.length > 5)
            .slice(0, 6);
          setSignatureItems(signature);
        }
      } catch (e) {
        console.warn('[HomeScreen] Error loading data:', e);
      }
    }
    loadInitial();
    return () => {
      isMounted = false;
    };
  }, [selectedBranch.id]);

  const handleAdd = (item: MobileProduct) => {
    addToCart({
      productId: item.id,
      name: item.title,
      unitPriceCents: item.priceCents,
      quantity: 1,
    });
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1200);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>YALÇIN PASTANELERİ</Text>
          <Text style={styles.brandSubtitle}>1997’den beri Pastaneci Emine Abla</Text>
        </View>

        {/* Branch Selector Pill */}
        <TouchableOpacity
          style={styles.branchButton}
          onPress={() => setIsBranchModalOpen(true)}
          activeOpacity={0.8}
        >
          <Feather name="map-pin" size={12} color="#9E1B22" />
          <Text style={styles.branchButtonText} numberOfLines={1}>
            {selectedBranch.name.split(' ')[0]}
          </Text>
          <Feather name="chevron-down" size={12} color="#737373" />
        </TouchableOpacity>
      </View>

      {/* Hero Banner Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>OSMANİYE’NİN AİLE PASTANESİ</Text>
        </View>
        <Text style={styles.heroHeading}>Taze & Geleneksel Lezzetler</Text>
        <Text style={styles.heroDesc}>
          Usta ellerden günlük çıkan çıtır baklavalar, yaş pastalar ve sıcak mutfak lezzetleri.
        </Text>
        <View style={styles.heroActions}>
          <TouchableOpacity
            style={styles.heroPrimaryBtn}
            onPress={() => onNavigateToMenu()}
            activeOpacity={0.85}
          >
            <Text style={styles.heroPrimaryBtnText}>Menüyü İncele</Text>
            <Feather name="arrow-right" size={14} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroSecondaryBtn}
            onPress={onNavigateToCustomCake}
            activeOpacity={0.85}
          >
            <Text style={styles.heroSecondaryBtnText}>Özel Pasta</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Category Icons Strip */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kategoriler</Text>
        <TouchableOpacity onPress={() => onNavigateToMenu()} activeOpacity={0.7}>
          <Text style={styles.sectionLink}>Tümü ({categories.length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id || cat.slug}
            style={styles.catCard}
            onPress={() => onNavigateToMenu(cat.slug)}
            activeOpacity={0.8}
          >
            <View style={styles.catIconWrap}>
              {cat.imageUrl ? (
                <Image source={{ uri: cat.imageUrl }} style={styles.catImg} resizeMode="cover" />
              ) : (
                <Feather name="coffee" size={18} color="#9E1B22" />
              )}
            </View>
            <Text style={styles.catName} numberOfLines={1}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Custom Cake Banner */}
      <TouchableOpacity
        style={styles.customCakeCard}
        onPress={onNavigateToCustomCake}
        activeOpacity={0.9}
      >
        <View style={styles.customCakeContent}>
          <Text style={styles.customCakeTag}>ÖZEL KUTLAMA TASARIMI</Text>
          <Text style={styles.customCakeHeading}>Özel Gün Pastası Tasarla</Text>
          <Text style={styles.customCakeDesc}>
            Kişi sayısı, lezzet tercihi ve özel mesajınızla butik pasta talebinizi doğrudan şubeye iletin.
          </Text>
        </View>
        <View style={styles.customCakeActionBox}>
          <Feather name="arrow-right" size={18} color="#9E1B22" />
        </View>
      </TouchableOpacity>

      {/* Signature Items Section with Photos */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>İmza Lezzetlerimiz</Text>
        <TouchableOpacity onPress={() => onNavigateToMenu()} activeOpacity={0.7}>
          <Text style={styles.sectionLink}>Tümünü Gör</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.signatureGrid}>
        {signatureItems.map((item) => {
          const isAdded = !!addedIds[item.id];

          return (
            <View key={item.id} style={styles.productCard}>
              <View style={styles.productImageContainer}>
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.productImagePlaceholder}>
                    <Feather name="image" size={24} color="#A3A3A3" />
                  </View>
                )}
                <View style={styles.productBadge}>
                  <Text style={styles.productBadgeText}>{item.categoryName.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.productBody}>
                <Text style={styles.productName} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.description ? (
                  <Text style={styles.productDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}

                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>{item.priceFormatted}</Text>
                  <TouchableOpacity
                    style={[styles.addButton, isAdded && styles.addButtonSuccess]}
                    onPress={() => handleAdd(item)}
                    activeOpacity={0.8}
                  >
                    <Feather
                      name={isAdded ? 'check' : 'plus'}
                      size={13}
                      color={isAdded ? '#FFFFFF' : '#9E1B22'}
                    />
                    <Text style={[styles.addButtonText, isAdded && styles.addButtonTextSuccess]}>
                      {isAdded ? 'Eklendi' : 'Ekle'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Authentic Branch Cards */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Şubelerimiz</Text>
      </View>

      <View style={styles.branchesContainer}>
        {VERIFIED_BRANCHES.map((b) => {
          const isSelected = selectedBranch.id === b.id;

          return (
            <TouchableOpacity
              key={b.id}
              style={[styles.branchCard, isSelected && styles.branchCardActive]}
              onPress={() => setSelectedBranch(b)}
              activeOpacity={0.9}
            >
              <View style={styles.branchHeaderRow}>
                <View style={styles.branchTitleWrap}>
                  <Feather
                    name="map-pin"
                    size={14}
                    color={isSelected ? '#9E1B22' : '#737373'}
                  />
                  <Text style={styles.branchName}>{b.name}</Text>
                </View>
                {isSelected && (
                  <View style={styles.activeCheck}>
                    <Feather name="check" size={12} color="#FFFFFF" />
                  </View>
                )}
              </View>
              <Text style={styles.branchAddress}>{b.address}</Text>
              <View style={styles.branchInfoRow}>
                <View style={styles.branchInfoItem}>
                  <Feather name="clock" size={11} color="#737373" />
                  <Text style={styles.branchInfoText}>{b.openingHours}</Text>
                </View>
                <View style={styles.branchInfoItem}>
                  <Feather name="phone" size={11} color="#737373" />
                  <Text style={styles.branchInfoText}>{b.phone}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ height: 40 }} />

      {/* Branch Selector Modal */}
      <Modal
        visible={isBranchModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsBranchModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsBranchModalOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Şube Seçimi</Text>
              <TouchableOpacity onPress={() => setIsBranchModalOpen(false)}>
                <Feather name="x" size={18} color="#737373" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>
              Siparişinizin hazırlanacağı şubeyi seçin. Menü ve teslimat koşulları şubeye göre güncellenir.
            </Text>

            <View style={styles.modalBranchList}>
              {VERIFIED_BRANCHES.map((b) => {
                const isSelected = selectedBranch.id === b.id;
                return (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.modalBranchItem, isSelected && styles.modalBranchItemActive]}
                    onPress={() => {
                      setSelectedBranch(b);
                      setIsBranchModalOpen(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalBranchName, isSelected && styles.modalBranchNameActive]}>
                        {b.name}
                      </Text>
                      <Text style={styles.modalBranchAddress}>{b.address}</Text>
                    </View>
                    {isSelected && <Feather name="check" size={16} color="#9E1B22" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  brandContainer: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1C1C1C',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 10,
    color: '#737373',
    fontWeight: '500',
    marginTop: 1,
  },
  branchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  branchButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1C1C',
    maxWidth: 90,
  },
  heroCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FBF0F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9E1B22',
    letterSpacing: 0.6,
  },
  heroHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1C',
    lineHeight: 26,
  },
  heroDesc: {
    fontSize: 12,
    color: '#737373',
    lineHeight: 18,
    marginTop: 6,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  heroPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#9E1B22',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  heroPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heroSecondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  heroSecondaryBtnText: {
    color: '#1C1C1C',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9E1B22',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 8,
  },
  catCard: {
    alignItems: 'center',
    width: 72,
    gap: 6,
  },
  catIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catImg: {
    width: '100%',
    height: '100%',
  },
  catName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#525252',
    textAlign: 'center',
  },
  customCakeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    gap: 12,
  },
  customCakeContent: {
    flex: 1,
  },
  customCakeTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9E1B22',
    letterSpacing: 0.5,
  },
  customCakeHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1C1C',
    marginTop: 2,
  },
  customCakeDesc: {
    fontSize: 11,
    color: '#737373',
    lineHeight: 16,
    marginTop: 4,
  },
  customCakeActionBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FBF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  productImageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  productBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9E1B22',
    letterSpacing: 0.5,
  },
  productBody: {
    padding: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  productDesc: {
    fontSize: 11,
    color: '#737373',
    lineHeight: 16,
    marginTop: 3,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FBF0F0',
    borderWidth: 1,
    borderColor: '#9E1B22',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addButtonSuccess: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  addButtonText: {
    color: '#9E1B22',
    fontSize: 11,
    fontWeight: '700',
  },
  addButtonTextSuccess: {
    color: '#FFFFFF',
  },
  branchesContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  branchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 14,
    gap: 6,
  },
  branchCardActive: {
    borderColor: '#9E1B22',
    backgroundColor: '#FDFBFB',
  },
  branchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  branchTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  branchName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  activeCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#9E1B22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchAddress: {
    fontSize: 11,
    color: '#737373',
  },
  branchInfoRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 2,
  },
  branchInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  branchInfoText: {
    fontSize: 10,
    color: '#737373',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  modalDesc: {
    fontSize: 12,
    color: '#737373',
    lineHeight: 16,
  },
  modalBranchList: {
    gap: 10,
    marginTop: 4,
    paddingBottom: 20,
  },
  modalBranchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  modalBranchItemActive: {
    borderColor: '#9E1B22',
    backgroundColor: '#FDFBFB',
  },
  modalBranchName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  modalBranchNameActive: {
    color: '#9E1B22',
  },
  modalBranchAddress: {
    fontSize: 11,
    color: '#737373',
    marginTop: 2,
  },
});
