import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useMobile } from '../context/MobileContext';
import { getProducts, getCategories, MobileProduct, MobileCategory } from '../api';

export function MenuScreen() {
  const { selectedBranch, addToCart } = useMobile();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<MobileProduct[]>([]);
  const [categories, setCategories] = useState<MobileCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          getCategories(selectedBranch.id),
          getProducts({ branchId: selectedBranch.id }),
        ]);
        if (isMounted) {
          setCategories(cats);
          setProducts(prods);
        }
      } catch (err) {
        console.warn('[MenuScreen] Error loading data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedBranch.id]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Branch filter
      if (selectedBranch.id === 'raufbey' && p.isAdnanOnly) return false;

      // Category filter
      if (selectedCategory !== 'all') {
        const matchSlug = p.categorySlug === selectedCategory;
        const matchName = p.categoryName === selectedCategory;
        if (!matchSlug && !matchName) return false;
      }

      // Search filter
      if (search.trim().length > 0) {
        const q = search.toLowerCase();
        const matchesName = p.title.toLowerCase().includes(q);
        const matchesDesc = (p.description || '').toLowerCase().includes(q);
        const matchesCat = p.categoryName.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [products, selectedBranch.id, selectedCategory, search]);

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
    <View style={styles.container}>
      {/* Branch Context Info Header */}
      <View style={styles.topBar}>
        <View style={styles.branchBadge}>
          <Feather name="map-pin" size={13} color="#9E1B22" />
          <Text style={styles.branchBadgeText}>{selectedBranch.name}</Text>
        </View>
        <Text style={styles.itemCountText}>{filteredProducts.length} lezzet</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#737373" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Menüde ürün, tatlı veya yemek ara..."
            placeholderTextColor="#8C8C8C"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color="#737373" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories Horizontal Tabs */}
      <View style={styles.categoryScrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          <TouchableOpacity
            style={[styles.categoryTab, selectedCategory === 'all' && styles.categoryTabActive]}
            onPress={() => setSelectedCategory('all')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryTabText,
                selectedCategory === 'all' && styles.categoryTabTextActive,
              ]}
            >
              Tümü ({products.length})
            </Text>
          </TouchableOpacity>

          {categories.map((c) => {
            if (selectedBranch.id === 'raufbey' && c.isAdnanOnly) return null;
            const active = selectedCategory === c.slug || selectedCategory === c.name;

            return (
              <TouchableOpacity
                key={c.id || c.slug}
                style={[styles.categoryTab, active && styles.categoryTabActive]}
                onPress={() => setSelectedCategory(c.slug)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.categoryTabText, active && styles.categoryTabTextActive]}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Product List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#9E1B22" />
          <Text style={styles.loadingText}>Menü hazırlanıyor...</Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="search" size={32} color="#D4D4D4" />
          <Text style={styles.emptyTitle}>Aradığınız ürün bulunamadı</Text>
          <Text style={styles.emptyDesc}>Farklı bir arama terimi deneyebilir veya kategoriyi değiştirebilirsiniz.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isAdded = !!addedIds[item.id];

            return (
              <View style={styles.itemCard}>
                {/* Product Image */}
                <View style={styles.imageContainer}>
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Feather name="image" size={24} color="#A3A3A3" />
                    </View>
                  )}
                </View>

                {/* Product Info */}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemCategory}>{item.categoryName.toUpperCase()}</Text>
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                  {item.description ? (
                    <Text style={styles.itemDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}

                  <View style={styles.itemFooter}>
                    <Text style={styles.itemPrice}>{item.priceFormatted}</Text>

                    <TouchableOpacity
                      style={[styles.addBtn, isAdded && styles.addBtnSuccess]}
                      onPress={() => handleAdd(item)}
                      activeOpacity={0.8}
                    >
                      <Feather
                        name={isAdded ? 'check' : 'plus'}
                        size={14}
                        color={isAdded ? '#FFFFFF' : '#9E1B22'}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.addBtnText, isAdded && styles.addBtnTextSuccess]}>
                        {isAdded ? 'Eklendi' : 'Ekle'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
  },
  branchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  branchBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  itemCountText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#737373',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1C1C1C',
    padding: 0,
  },
  categoryScrollContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    paddingVertical: 8,
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  categoryTabActive: {
    backgroundColor: '#9E1B22',
    borderColor: '#9E1B22',
  },
  categoryTabText: {
    fontSize: 12,
    color: '#525252',
    fontWeight: '600',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemCategory: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9E1B22',
    letterSpacing: 0.5,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1C',
    marginTop: 2,
  },
  itemDesc: {
    fontSize: 11,
    color: '#737373',
    lineHeight: 15,
    marginTop: 2,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#9E1B22',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addBtnSuccess: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  addBtnText: {
    color: '#9E1B22',
    fontSize: 12,
    fontWeight: '700',
  },
  addBtnTextSuccess: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 12,
    color: '#737373',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#737373',
    textAlign: 'center',
  },
});
