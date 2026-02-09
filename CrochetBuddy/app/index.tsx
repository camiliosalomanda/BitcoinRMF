import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { getUserProgress } from '../utils/storage';
import { usePro } from '../hooks/usePro';
import WoollyMascot from '../components/WoollyMascot';
import StarCounter from '../components/StarCounter';
import AdBanner from '../components/AdBanner';
import UpgradeModal from '../components/UpgradeModal';

const getTimeBasedGreeting = (): { greeting: string; message: string } => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return { greeting: 'Good Morning!', message: "Rise and shine! Ready to create something cozy? ☀️" };
  } else if (hour < 17) {
    return { greeting: 'Good Afternoon!', message: "Perfect time for some crafty fun! 🧶" };
  }
  return { greeting: 'Good Evening!', message: "Evening crafts are the best crafts! 🌙" };
};

export default function HomeScreen() {
  const { isPro } = usePro();
  const [totalStars, setTotalStars] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Compute once on mount — no state needed for static time-of-day values
  const { greeting, message: woollyMessage } = useMemo(getTimeBasedGreeting, []);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const progress = await getUserProgress();
    setTotalStars(progress.totalStars);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF5F8', '#FFE5EC', '#FFD6E0']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <StarCounter count={totalStars} />
          
          <View style={styles.headerRight}>
            {/* Pro Badge */}
            {isPro && (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>⭐ PRO</Text>
              </View>
            )}
            
            {/* Achievements Button */}
            <TouchableOpacity 
              style={styles.achievementButton}
              onPress={() => router.push('/achievements')}
            >
              <Text style={styles.achievementButtonText}>🏆</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.title}>Crochet Buddy</Text>
          <Text style={styles.subtitle}>🧶 Let's Make Something Amazing! 🧶</Text>
        </View>

        {/* Woolly Mascot */}
        <View style={styles.woollyContainer}>
          <WoollyMascot 
            message={woollyMessage}
            emotion="happy"
            size="large"
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/create')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.primaryButtonText}>✨ Create New Pattern ✨</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/my-patterns')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>📚 My Patterns</Text>
          </TouchableOpacity>

          {/* Upgrade button for free users */}
          {!isPro && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => setShowUpgradeModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.upgradeButtonText}>🌟 Upgrade to Pro</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Decorative elements */}
        <View style={styles.decorativeYarn1}>
          <Text style={styles.decorativeEmoji}>🧶</Text>
        </View>
        <View style={styles.decorativeYarn2}>
          <Text style={styles.decorativeEmoji}>🪡</Text>
        </View>
      </LinearGradient>

      {/* Bottom Ad Banner for free users */}
      {!isPro && (
        <AdBanner 
          placement="bottom"
          onUpgradePress={() => setShowUpgradeModal(true)}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proBadge: {
    backgroundColor: Colors.yellow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  proBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
  },
  achievementButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementButtonText: {
    fontSize: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 18,
    color: Colors.textLight,
    marginBottom: 4,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: Colors.primary,
    textShadowColor: 'rgba(255, 107, 157, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 8,
  },
  woollyContainer: {
    alignItems: 'center',
    marginVertical: 16,
    flex: 1,
    justifyContent: 'center',
  },
  buttonsContainer: {
    paddingBottom: 20,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: Colors.cream,
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.purple,
  },
  secondaryButtonText: {
    color: Colors.purple,
    fontSize: 20,
    fontWeight: '600',
  },
  upgradeButton: {
    backgroundColor: Colors.yellow,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  decorativeYarn1: {
    position: 'absolute',
    top: 120,
    left: 20,
    opacity: 0.3,
  },
  decorativeYarn2: {
    position: 'absolute',
    top: 200,
    right: 30,
    opacity: 0.3,
  },
  decorativeEmoji: {
    fontSize: 40,
  },
});
