import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { VERIFIED_BRANCHES, BRAND_INFO } from '@yalcin/shared';
import { useMobile } from '../context/MobileContext';

export function ProfileScreen() {
  const { selectedBranch, setSelectedBranch } = useMobile();

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
  };

  const handleInstagram = () => {
    Linking.openURL(BRAND_INFO.instagram);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Kurumsal & Şubeler</Text>
      <Text style={styles.subtitle}>
        Yalçın Pastaneleri marka bilgileri, iletişim ve şubelerimiz.
      </Text>

      {/* Brand Heritage Box */}
      <View style={styles.brandCard}>
        <Text style={styles.brandTag}>1997’DEN BERİ</Text>
        <Text style={styles.brandHeading}>Pastaneci Emine Abla</Text>
        <Text style={styles.brandStory}>
          1997 yılından bu yana Osmaniye’de değişmeyen lezzet ve sevgiyle hizmet veren Yalçın Ailenizin Pastanesi, geleneksel baklavalardan modern pastacılığa ve dünya mutfağına uzanan zengin çeşitleriyle sofralarınıza eşlik ediyor.
        </Text>
        <TouchableOpacity style={styles.igBtn} onPress={handleInstagram} activeOpacity={0.85}>
          <Feather name="instagram" size={14} color="#9E1B22" style={{ marginRight: 6 }} />
          <Text style={styles.igBtnText}>Instagram: @yalcinpastaneleri</Text>
        </TouchableOpacity>
      </View>

      {/* Branches Section */}
      <Text style={styles.sectionHeading}>Doğrulanmış Şubelerimiz</Text>
      {VERIFIED_BRANCHES.map((b) => {
        const isSelected = selectedBranch.id === b.id;

        return (
          <View key={b.id} style={[styles.branchCard, isSelected && styles.branchCardActive]}>
            <View style={styles.branchHeader}>
              <View style={styles.branchTitleWrap}>
                <Feather name="map-pin" size={15} color={isSelected ? '#9E1B22' : '#737373'} />
                <Text style={styles.branchName}>{b.name}</Text>
              </View>
              {isSelected && (
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>Aktif Şube</Text>
                </View>
              )}
            </View>

            <Text style={styles.branchAddress}>{b.address}</Text>

            <View style={styles.branchMetaRow}>
              <View style={styles.metaItem}>
                <Feather name="clock" size={12} color="#737373" />
                <Text style={styles.metaText}>{b.openingHours}</Text>
              </View>
              <View style={styles.metaItem}>
                <Feather name="phone" size={12} color="#737373" />
                <Text style={styles.metaText}>{b.phone}</Text>
              </View>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => handleCall(b.phone)}
                activeOpacity={0.8}
              >
                <Feather name="phone-call" size={13} color="#1C1C1C" style={{ marginRight: 6 }} />
                <Text style={styles.callBtnText}>Şubeyi Ara</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.selectBtn, isSelected && styles.selectBtnActive]}
                onPress={() => setSelectedBranch(b)}
                activeOpacity={0.8}
              >
                {isSelected && <Feather name="check" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />}
                <Text style={[styles.selectBtnText, isSelected && styles.selectBtnTextActive]}>
                  {isSelected ? 'Seçili Şube' : 'Bu Şubeyi Seç'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <View style={styles.infoFooter}>
        <Text style={styles.infoFooterText}>
          Tüm fiyat ve ürün bilgileri resmî Yalçın Pastaneleri veritabanı ile eşzamanlıdır.
        </Text>
      </View>

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
  brandCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 16,
    marginBottom: 20,
  },
  brandTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9E1B22',
    letterSpacing: 0.5,
  },
  brandHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1C',
    marginTop: 2,
  },
  brandStory: {
    fontSize: 12,
    color: '#525252',
    lineHeight: 18,
    marginTop: 6,
  },
  igBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBF0F0',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  igBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9E1B22',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1C1C',
    marginBottom: 10,
  },
  branchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 16,
    marginBottom: 12,
  },
  branchCardActive: {
    borderColor: '#9E1B22',
  },
  branchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  branchTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  branchName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  activeTag: {
    backgroundColor: '#FBF0F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9E1B22',
  },
  branchAddress: {
    fontSize: 11,
    color: '#737373',
    lineHeight: 16,
    marginTop: 6,
  },
  branchMetaRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 11,
    color: '#525252',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingVertical: 9,
    borderRadius: 8,
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1C',
  },
  selectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#9E1B22',
    paddingVertical: 9,
    borderRadius: 8,
  },
  selectBtnActive: {
    backgroundColor: '#9E1B22',
  },
  selectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9E1B22',
  },
  selectBtnTextActive: {
    color: '#FFFFFF',
  },
  infoFooter: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  infoFooterText: {
    fontSize: 10,
    color: '#737373',
    textAlign: 'center',
    lineHeight: 14,
  },
});
