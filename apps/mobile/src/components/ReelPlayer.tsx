import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Linking,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ReelPlayerProps {
  videoUrl: string;
  posterUrl: string;
  title: string;
  views: string;
  likes: string;
  instagramUrl?: string;
  width?: number;
}

export function ReelPlayer({
  videoUrl,
  posterUrl,
  title,
  views,
  likes,
  instagramUrl = 'https://www.instagram.com/yalcinpastaneleri/',
  width = SCREEN_WIDTH - 32,
}: ReelPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // GSAP-style pulsing animation for live badge
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  // Modern expo-video player instance with loop and autoplay
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    if (!player) return;
    const sub = player.addListener('statusChange', (status) => {
      if (status.status === 'readyToPlay') {
        setVideoReady(true);
      }
    });
    return () => {
      sub?.remove?.();
    };
  }, [player]);

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!player) return;
    player.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handleOpenInstagram = () => {
    Linking.openURL(instagramUrl).catch(() => {});
  };

  const cardHeight = width * (16 / 9);

  return (
    <Animated.View style={[styles.cardWrapper, { width, height: cardHeight, transform: [{ scale: scaleAnim }] }]}>
      {/* 9:16 Video Player */}
      <View style={styles.videoContainer}>
        {posterUrl && !videoReady ? (
          <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
        ) : null}

        {player ? (
          <VideoView
            player={player}
            style={styles.video}
            contentFit="cover"
            nativeControls={false}
          />
        ) : (
          <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
        )}
      </View>

      {/* Floating Interactive Controls & Minimalist Badges */}
      <View style={styles.overlay}>
        {/* Top Header Row */}
        <View style={styles.topRow}>
          <View style={styles.badgeGroup}>
            <View style={styles.liveBadge}>
              <Animated.View
                style={[
                  styles.pulsingDot,
                  { transform: [{ scale: pulseAnim }], opacity: 0.9 },
                ]}
              />
              <Text style={styles.liveBadgeText}>REELS • 9:16</Text>
            </View>
            <View style={styles.accountPill}>
              <Text style={styles.accountText}>@yalcinpastaneleri</Text>
            </View>
          </View>

          {/* Sound Mute/Unmute Toggle */}
          <TouchableOpacity
            style={styles.iconCircleBtn}
            onPress={toggleMute}
            activeOpacity={0.8}
          >
            <Feather
              name={isMuted ? 'volume-x' : 'volume-2'}
              size={14}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* Center Tap-to-Play/Pause overlay */}
        <TouchableOpacity
          style={styles.centerArea}
          onPress={togglePlay}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {!isPlaying && (
            <View style={styles.pausedIconWrap}>
              <Feather name="play" size={28} color="#FFFFFF" style={{ marginLeft: 3 }} />
            </View>
          )}
        </TouchableOpacity>

        {/* Bottom Metadata & One-Tap Actions */}
        <View style={styles.bottomRow}>
          <View style={styles.bottomMeta}>
            <Text style={styles.reelTitle} numberOfLines={1}>
              {title}
            </Text>
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Feather name="eye" size={11} color="#E0E0E0" />
                <Text style={styles.metricText}>{views}</Text>
              </View>
              <Text style={styles.metricDot}>•</Text>
              <View style={styles.metricItem}>
                <Feather name="clock" size={11} color="#E0E0E0" />
                <Text style={styles.metricText}>Canlı Video</Text>
              </View>
            </View>
          </View>

          {/* Right Floating Actions (Like & Instagram) */}
          <View style={styles.sideActions}>
            <TouchableOpacity
              style={[styles.actionBtn, hasLiked && styles.actionBtnActive]}
              onPress={() => setHasLiked(!hasLiked)}
              activeOpacity={0.8}
            >
              <Feather
                name="heart"
                size={16}
                color={hasLiked ? '#EF4444' : '#FFFFFF'}
              />
              <Text style={styles.actionCount}>
                {hasLiked ? '1.5B' : likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.openIgBtn}
              onPress={handleOpenInstagram}
              activeOpacity={0.85}
            >
              <Feather name="external-link" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000000',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  poster: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.22)',
    justifyContent: 'space-between',
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(158, 27, 34, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  accountPill: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  accountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  iconCircleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pausedIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 10,
  },
  bottomMeta: {
    flex: 1,
    paddingRight: 12,
  },
  reelTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 6,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    color: '#E0E0E0',
    fontSize: 11,
    fontWeight: '600',
  },
  metricDot: {
    color: '#A3A3A3',
    fontSize: 10,
  },
  sideActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  actionBtnActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: '#EF4444',
  },
  actionCount: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  openIgBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#9E1B22',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
