import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MobileProvider, useMobile } from './src/context/MobileContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { OrdersScreen } from './src/screens/OrdersScreen';
import { CustomCakeScreen } from './src/screens/CustomCakeScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { CartModal } from './src/components/CartModal';

type Tab = 'home' | 'menu' | 'orders' | 'cake' | 'profile';

function MainNavigator() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const { cartItems, setIsCartModalOpen } = useMobile();

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Content */}
      <View style={styles.content}>
        {activeTab === 'home' && (
          <HomeScreen
            onNavigateToMenu={() => setActiveTab('menu')}
            onNavigateToCustomCake={() => setActiveTab('cake')}
          />
        )}
        {activeTab === 'menu' && <MenuScreen />}
        {activeTab === 'orders' && <OrdersScreen />}
        {activeTab === 'cake' && <CustomCakeScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </View>

      {/* Floating Cart Button (visible if items exist) */}
      {totalCartCount > 0 && (
        <TouchableOpacity
          style={styles.floatingCart}
          onPress={() => setIsCartModalOpen(true)}
          activeOpacity={0.9}
        >
          <Feather name="shopping-bag" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.floatingCartText}>Sepet ({totalCartCount})</Text>
        </TouchableOpacity>
      )}

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('home')}
          activeOpacity={0.8}
        >
          <Feather
            name="home"
            size={20}
            color={activeTab === 'home' ? '#9E1B22' : '#737373'}
          />
          <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>
            Ana Sayfa
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('menu')}
          activeOpacity={0.8}
        >
          <Feather
            name="book-open"
            size={20}
            color={activeTab === 'menu' ? '#9E1B22' : '#737373'}
          />
          <Text style={[styles.tabLabel, activeTab === 'menu' && styles.tabLabelActive]}>
            Menü
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('orders')}
          activeOpacity={0.8}
        >
          <Feather
            name="package"
            size={20}
            color={activeTab === 'orders' ? '#9E1B22' : '#737373'}
          />
          <Text style={[styles.tabLabel, activeTab === 'orders' && styles.tabLabelActive]}>
            Siparişler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('cake')}
          activeOpacity={0.8}
        >
          <Feather
            name="gift"
            size={20}
            color={activeTab === 'cake' ? '#9E1B22' : '#737373'}
          />
          <Text style={[styles.tabLabel, activeTab === 'cake' && styles.tabLabelActive]}>
            Özel Pasta
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.8}
        >
          <Feather
            name="map-pin"
            size={20}
            color={activeTab === 'profile' ? '#9E1B22' : '#737373'}
          />
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>
            Şubeler
          </Text>
        </TouchableOpacity>
      </View>

      {/* Slide-up Cart Modal */}
      <CartModal
        onOrderSuccess={(orderNum) => {
          setActiveTab('orders');
        }}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <MobileProvider>
      <MainNavigator />
    </MobileProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  floatingCart: {
    position: 'absolute',
    bottom: 72,
    right: 16,
    backgroundColor: '#9E1B22',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 30,
  },
  floatingCartText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    color: '#737373',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#9E1B22',
    fontWeight: '700',
  },
});
