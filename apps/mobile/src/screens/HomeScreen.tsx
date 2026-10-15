import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Linking,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useMobile } from '../context/MobileContext';
import { VERIFIED_BRANCHES } from '@yalcin/shared';
import {
  getProducts,
  getCategories,
  getInstagramFeed,
  MobileProduct,
  MobileCategory,
  InstagramFeed,
  InstagramStory,
} from '../api';
import { ReelPlayer } from '../components/ReelPlayer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HomeScreenProps {
  onNavigateToMenu: (category?: string) => void;
  onNavigateToCustomCake: () => void;
}

export function HomeScreen({ onNavigateToMenu, onNavigateToCustomCake }: HomeScreenProps) {
  const { selectedBranch, setSelectedBranch, addToCart } = useMobile();
  const [signatureItems, setSignatureItems] = useState<MobileProduct[]>([]);
  const [categories, setCategories] = useState<MobileCategory[]>([]);
  const [feed, setFeed] = useState<InstagramFeed | null>(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  // GSAP-style physics and entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const storyPulseAnim = useRef(new Animated.Value(1)).current;
  const storyProgressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. GSAP-style staggered entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 850,
        easing: Easing.bezier(0.16, 1, 0.3, 1), // GSAP power4.out
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 850,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Breathing pulse loop for story rings
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(storyPulseAnim, {
          toValue: 1.06,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(storyPulseAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [fadeAnim, slideAnim, storyPulseAnim]);

  // Story progress animation when activeStoryIndex changes
  useEffect(() => {
    if (activeStoryIndex !== null) {
      storyProgressAnim.setValue(0);
      Animated.timing(storyProgressAnim, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          const storiesCount = feed?.stories?.length || 0;
          if (activeStoryIndex < storiesCount - 1) {
            setActiveStoryIndex(activeStoryIndex + 1);
          } else {
            setActiveStoryIndex(null);
          }
        }
      });
    }
  }, [activeStoryIndex, feed?.stories?.length, storyProgressAnim]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [cats, prods, igFeed] = await Promise.all([
          getCategories(selectedBranch.id),
          getProducts({ branchId: selectedBranch.id }),
          getInstagramFeed(),
        ]);
        if (isMounted) {
          setCategories(cats);
          // Pick 6 prominent items with authentic pictures
          const signature = prods
            .filter((p) => p.imageUrl && p.imageUrl.length > 5)
            .slice(0, 6);
          setSignatureItems(signature);
          setFeed(igFeed);
        }
      } catch (e) {
        console.warn('[HomeScreen] Error loading data:', e);
      }
    }
    loadData();
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

  const handleOpenInstagram = (url?: string) => {
    const targetUrl = url || feed?.instagramUrl || 'https://www.instagram.com/yalcinpastaneleri/';
    Linking.openURL(targetUrl).catch(() => {});
  };

  const stories = feed?.stories || [];
  const currentStory: InstagramStory | null =
    activeStoryIndex !== null && stories[activeStoryIndex] ? stories[activeStoryIndex] : null;

  const reels = feed?.reels && feed.reels.length > 0 ? feed.reels : feed?.latestReel ? [feed.latestReel] : [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* 1. Sleek Apple-Minimal Header */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <Text style={styles.brandTitle}>YALÇIN PASTANELERİ</Text>
            <View style={styles.badgeRow}>
              <Text style={styles.brandBadge}>1997</Text>
              <Text style={styles.brandDot}>•</Text>
              <Text style={styles.brandSubtitle}>OSMANİYE</Text>
            </View>
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

        {/* 2. INSTAGRAM STORIES BAR WITH BREATHING PULSE */}
        {stories.length > 0 && (
          <View style={styles.storiesSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storiesScroll}
            >
              {stories.map((story, index) => (
                <TouchableOpacity
                  key={story.id}
                  style={styles.storyBubble}
                  onPress={() => setActiveStoryIndex(index)}
                  activeOpacity={0.85}
                >
                  <Animated.View
                    style={[
                      styles.storyRing,
                      index === 0 && { transform: [{ scale: storyPulseAnim }] },
                    ]}
                  >
                    <Image source={{ uri: story.imageUrl }} style={styles.storyAvatar} />
                  </Animated.View>
                  <Text style={styles.storyTitle} numberOfLines={1}>
                    {story.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 3. DIRECT VIDEO PLAYBACK (9:16 REELS VITRINI) */}
        {reels.length > 0 && (
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.reelsBadge}>
                <Feather name="video" size={12} color="#FFFFFF" />
                <Text style={styles.reelsBadgeText}>9:16 REELS</Text>
              </View>
              <Text style={styles.sectionTitle}>Canlı Mutfak</Text>
            </View>
            <TouchableOpacity onPress={() => handleOpenInstagram()} activeOpacity={0.7}>
              <Feather name="instagram" size={16} color="#9E1B22" />
            </TouchableOpacity>
          </View>
        )}

        {reels.length > 0 && (
          <View style={styles.reelsScrollWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.reelsHorizontalScroll}
              decelerationRate="fast"
              snapToInterval={SCREEN_WIDTH * 0.75 + 14}
            >
              {reels.map((reel) => (
                <View key={reel.id} style={styles.reelItemWrapper}>
                  <ReelPlayer
                    videoUrl={reel.videoUrl}
                    posterUrl={reel.posterUrl}
                    title={reel.title}
                    views={reel.views}
                    likes={reel.likes}
                    instagramUrl={reel.instagramUrl}
                    width={SCREEN_WIDTH * 0.75}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 4. GÜNÜN PAYLAŞIMI (INSTAGRAM FOTOĞRAFI) */}
        {feed?.latestPost && (
          <View style={styles.sectionPadding}>
            <TouchableOpacity
              style={styles.postCard}
              onPress={() => handleOpenInstagram(feed.latestPost.instagramUrl)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: feed.latestPost.imageUrl }}
                style={styles.postImage}
                resizeMode="cover"
              />
              <View style={styles.postOverlay}>
                <View style={styles.postBadge}>
                  <Text style={styles.postBadgeText}>GÜNÜN PAYLAŞIMI</Text>
                </View>
                <View style={styles.postFooter}>
                  <Text style={styles.postTitle} numberOfLines={1}>
                    {feed.latestPost.title}
                  </Text>
                  <View style={styles.postLikes}>
                    <Feather name="heart" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.postLikesText}>{feed.latestPost.likes}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* 5. KATEGORİLER (FOTOĞRAFLI DAİRESEL KARTLAR) */}
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

        {/* 6. ÖZEL GÜN PASTASI (MINIMAL GÖRSEL KART) */}
        <View style={styles.sectionPadding}>
          <TouchableOpacity
            style={styles.customCakeCard}
            onPress={onNavigateToCustomCake}
            activeOpacity={0.9}
          >
            <View style={styles.customCakeContent}>
              <View style={styles.customCakeBadge}>
                <Text style={styles.customCakeBadgeText}>BUTİK TASARIM</Text>
              </View>
              <Text style={styles.customCakeHeading}>Özel Gün Pastası Tasarla</Text>
            </View>
            <View style={styles.customCakeBtn}>
              <Feather name="arrow-right" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* 7. İMZA LEZZETLER (GÖRSEL ODAKLI BÜYÜK FOTOĞRAFLAR) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>İmza Lezzetler</Text>
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

                  <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>{item.priceFormatted}</Text>
                    <TouchableOpacity
                      style={[styles.addButton, isAdded && styles.addButtonSuccess]}
                      onPress={() => handleAdd(item)}
                      activeOpacity={0.8}
                    >
                      <Feather
                        name={isAdded ? 'check' : 'plus'}
                        size={14}
                        color={isAdded ? '#FFFFFF' : '#9E1B22'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* 8. ŞUBELERİMİZ */}
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
                  <TouchableOpacity
                    style={styles.branchInfoItem}
                    onPress={() => Linking.openURL(`tel:${b.phone}`)}
                  >
                    <Feather name="phone" size={11} color="#9E1B22" />
                    <Text style={[styles.branchInfoText, { color: '#9E1B22', fontWeight: '600' }]}>
                      {b.phone}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </Animated.View>

      {/* INSTAGRAM STORY VIEWER MODAL */}
      <Modal
        visible={activeStoryIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveStoryIndex(null)}
      >
        {currentStory && (
          <View style={styles.storyModalContainer}>
            {/* Top segmented progress bars */}
            <View style={styles.storyProgressContainer}>
              {stories.map((s, idx) => {
                const isActive = idx === activeStoryIndex;
                const isPassed = idx < (activeStoryIndex ?? 0);

                return (
                  <View key={s.id} style={styles.storyProgressTrack}>
                    {isActive ? (
                      <Animated.View
                        style={[
                          styles.storyProgressBar,
                          {
                            width: storyProgressAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', '100%'],
                            }),
                          },
                        ]}
                      />
                    ) : (
                      <View
                        style={[
                          styles.storyProgressBar,
                          { width: isPassed ? '100%' : '0%' },
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </View>

            {/* Story Header */}
            <View style={styles.storyModalHeader}>
              <View style={styles.storyUserWrap}>
                <Image source={{ uri: currentStory.imageUrl }} style={styles.storyUserAvatar} />
                <View>
                  <Text style={styles.storyUserName}>@yalcinpastaneleri</Text>
                  <Text style={styles.storyUserTime}>{currentStory.timestamp}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setActiveStoryIndex(null)}
                style={styles.storyCloseBtn}
              >
                <Feather name="x" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Story Image */}
            <Image
              source={{ uri: currentStory.imageUrl }}
              style={styles.storyModalImage}
              resizeMode="contain"
            />

            {/* Story Title & Action */}
            <View style={styles.storyModalFooter}>
              <View style={styles.storyBadge}>
                <Text style={styles.storyBadgeText}>{currentStory.category}</Text>
              </View>
              <Text style={styles.storyModalTitle}>{currentStory.title}</Text>

              <TouchableOpacity
                style={styles.storyIgBtn}
                onPress={() => handleOpenInstagram()}
                activeOpacity={0.85}
              >
                <Feather name="external-link" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.storyIgBtnText}>Instagram'da Gör</Text>
              </TouchableOpacity>
            </View>

            {/* Left / Right touch navigation zones */}
            <TouchableOpacity
              style={styles.storyNavLeft}
              onPress={() => {
                if ((activeStoryIndex ?? 0) > 0) {
                  setActiveStoryIndex((activeStoryIndex ?? 0) - 1);
                }
              }}
            />
            <TouchableOpacity
              style={styles.storyNavRight}
              onPress={() => {
                if ((activeStoryIndex ?? 0) < stories.length - 1) {
                  setActiveStoryIndex((activeStoryIndex ?? 0) + 1);
                } else {
                  setActiveStoryIndex(null);
                }
              }}
            />
          </View>
        )}
      </Modal>

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
    borderBottomColor: '#F0F0F0',
  },
  brandContainer: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1C1C1C',
    letterSpacing: 0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 5,
  },
  brandBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9E1B22',
  },
  brandDot: {
    fontSize: 10,
    color: '#A3A3A3',
  },
  brandSubtitle: {
    fontSize: 10,
    color: '#737373',
    fontWeight: '600',
    letterSpacing: 0.5,
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
  // Stories Section
  storiesSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  storiesScroll: {
    paddingHorizontal: 12,
    gap: 14,
  },
  storyBubble: {
    alignItems: 'center',
    width: 68,
  },
  storyRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    padding: 2.5,
    borderWidth: 2.5,
    borderColor: '#9E1B22',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  storyAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EAEAEA',
  },
  storyTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1C1C1C',
    marginTop: 5,
    textAlign: 'center',
  },
  sectionPadding: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  // 9:16 Reels Section
  reelsScrollWrap: {
    marginTop: 8,
    marginBottom: 6,
  },
  reelsHorizontalScroll: {
    paddingHorizontal: 16,
    gap: 14,
  },
  reelItemWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reelsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9E1B22',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    gap: 4,
  },
  reelsBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  // Post Card
  postCard: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'space-between',
    padding: 14,
  },
  postBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  postBadgeText: {
    color: '#1C1C1C',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  postLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  postLikesText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  // Categories
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
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
    gap: 12,
  },
  catCard: {
    alignItems: 'center',
    width: 72,
  },
  catIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  catImg: {
    width: '100%',
    height: '100%',
  },
  catName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1C1C1C',
    marginTop: 6,
    textAlign: 'center',
  },
  // Custom Cake Banner
  customCakeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1C',
    borderRadius: 14,
    padding: 16,
  },
  customCakeContent: {
    flex: 1,
  },
  customCakeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#9E1B22',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  customCakeBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  customCakeHeading: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  customCakeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#9E1B22',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  // Signature Items Grid
  signatureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  productCard: {
    width: (SCREEN_WIDTH - 36) / 2,
    marginHorizontal: 3,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    overflow: 'hidden',
  },
  productImageContainer: {
    width: '100%',
    height: 125,
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(28,28,28,0.7)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
  productBody: {
    padding: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9E1B22',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FBF0F0',
    borderWidth: 1,
    borderColor: '#F2D6D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonSuccess: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  // Branches
  branchesContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  branchCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    padding: 12,
  },
  branchCardActive: {
    borderColor: '#9E1B22',
    backgroundColor: '#FCFAFA',
  },
  branchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  branchTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  branchName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  activeCheck: {
    backgroundColor: '#9E1B22',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchAddress: {
    fontSize: 11,
    color: '#737373',
    marginBottom: 6,
  },
  branchInfoRow: {
    flexDirection: 'row',
    gap: 14,
  },
  branchInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  branchInfoText: {
    fontSize: 11,
    color: '#737373',
  },
  // Story Modal
  storyModalContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
    position: 'relative',
  },
  storyProgressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 50,
    gap: 4,
    zIndex: 10,
  },
  storyProgressTrack: {
    flex: 1,
    height: 2.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  storyProgressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  storyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    zIndex: 10,
  },
  storyUserWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  storyUserAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#9E1B22',
  },
  storyUserName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  storyUserTime: {
    color: '#B3B3B3',
    fontSize: 10,
  },
  storyCloseBtn: {
    padding: 6,
  },
  storyModalImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.25,
    alignSelf: 'center',
  },
  storyModalFooter: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
    zIndex: 10,
  },
  storyBadge: {
    backgroundColor: '#9E1B22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  storyBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  storyModalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
    textAlign: 'center',
  },
  storyIgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9E1B22',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  storyIgBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  storyNavLeft: {
    position: 'absolute',
    top: 100,
    bottom: 120,
    left: 0,
    width: SCREEN_WIDTH * 0.4,
    zIndex: 5,
  },
  storyNavRight: {
    position: 'absolute',
    top: 100,
    bottom: 120,
    right: 0,
    width: SCREEN_WIDTH * 0.4,
    zIndex: 5,
  },
  // Branch Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  modalBranchList: {
    gap: 10,
  },
  modalBranchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 10,
  },
  modalBranchItemActive: {
    borderColor: '#9E1B22',
    backgroundColor: '#FBF0F0',
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
