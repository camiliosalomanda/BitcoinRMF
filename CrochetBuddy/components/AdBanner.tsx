import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { usePro } from '../hooks/usePro';

interface AdBannerProps {
  placement?: 'bottom' | 'inline';
  onUpgradePress?: () => void;
}

// ===========================================
// COPPA COMPLIANCE CONFIGURATION
// ===========================================
// These settings MUST be applied when switching to real AdMob:
//
// 1. In Google AdMob dashboard:
//    - Set "max_ad_content_rating" to "G"
//    - Enable "Tag for child-directed treatment" (COPPA)
//    - Enable "Tag for users under the age of consent" (GDPR)
//
// 2. In code (BannerAd requestOptions):
//    - requestNonPersonalizedAdsOnly: true
//    - keywords: ['games', 'kids', 'crafts', 'art']
//
// 3. In app.json AdMob plugin config:
//    - Use your real AdMob App IDs
//
// See: https://developers.google.com/admob/android/targeting#child-directed_setting
// ===========================================
export const COPPA_AD_CONFIG = {
  requestNonPersonalizedAdsOnly: true,
  keywords: ['games', 'kids', 'crafts', 'art'],
  maxAdContentRating: 'G',
  tagForChildDirectedTreatment: true,
  tagForUnderAgeOfConsent: true,
} as const;

// Kid-friendly placeholder ads (used until real AdMob is configured)
const KID_FRIENDLY_ADS = [
  {
    emoji: '🎮',
    title: 'Fun Games!',
    subtitle: 'Play awesome games',
    color: '#6BC5E8',
  },
  {
    emoji: '🎨',
    title: 'Art Studio',
    subtitle: 'Create amazing art',
    color: '#B794F6',
  },
  {
    emoji: '📚',
    title: 'Story Time',
    subtitle: 'Discover new stories',
    color: '#7ED957',
  },
  {
    emoji: '🧩',
    title: 'Puzzle Fun',
    subtitle: 'Solve cool puzzles',
    color: '#FFB347',
  },
];

export default function AdBanner({ placement = 'bottom', onUpgradePress }: AdBannerProps) {
  const { isPro } = usePro();

  // Memoize ad selection so it doesn't change on every render
  const ad = useMemo(
    () => KID_FRIENDLY_ADS[Math.floor(Math.random() * KID_FRIENDLY_ADS.length)],
    []
  );

  // Don't show ads to Pro users
  if (isPro) {
    return null;
  }

  // ===========================================
  // PRODUCTION: Replace placeholder with real AdMob:
  //
  // import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
  //
  // const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxx/xxxxx';
  //
  // <BannerAd
  //   unitId={adUnitId}
  //   size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
  //   requestOptions={{
  //     requestNonPersonalizedAdsOnly: COPPA_AD_CONFIG.requestNonPersonalizedAdsOnly,
  //     keywords: COPPA_AD_CONFIG.keywords,
  //   }}
  // />
  // ===========================================

  return (
    <View style={[styles.container, placement === 'inline' && styles.containerInline]}>
      <View style={[styles.adContent, { backgroundColor: ad.color + '30' }]}>
        <Text style={styles.adEmoji}>{ad.emoji}</Text>
        <View style={styles.adText}>
          <Text style={[styles.adTitle, { color: ad.color }]}>{ad.title}</Text>
          <Text style={styles.adSubtitle}>{ad.subtitle}</Text>
        </View>
        <View style={styles.adBadge}>
          <Text style={styles.adBadgeText}>Ad</Text>
        </View>
      </View>

      {/* Remove ads prompt */}
      <TouchableOpacity style={styles.removeAdsButton} onPress={onUpgradePress}>
        <Text style={styles.removeAdsText}>✨ Remove ads</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: Colors.cream,
    borderTopWidth: 1,
    borderTopColor: Colors.primaryLight,
  },
  containerInline: {
    marginVertical: 12,
    borderRadius: 16,
    borderTopWidth: 0,
  },
  adContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  adEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  adText: {
    flex: 1,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  adSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
  },
  adBadge: {
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  adBadgeText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  removeAdsButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  removeAdsText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
});
