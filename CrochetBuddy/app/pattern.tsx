import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';
import { PatternData } from '../constants/Types';
import { getSavedPatterns, savePattern, addStars, completePattern } from '../utils/storage';
import { usePro } from '../hooks/usePro';
import WoollyMascot from '../components/WoollyMascot';
import StepCard from '../components/StepCard';
import AdBanner from '../components/AdBanner';
import { MaterialsList } from '../components/MaterialCard';
import UpgradeModal from '../components/UpgradeModal';

export default function PatternScreen() {
  const { patternId } = useLocalSearchParams<{ patternId: string }>();
  const { isPro } = usePro();
  const [pattern, setPattern] = useState<PatternData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showMaterials, setShowMaterials] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadPattern();
  }, [patternId]);

  const loadPattern = async () => {
    const patterns = await getSavedPatterns();
    const found = patterns.find(p => p.id === patternId);
    if (found) {
      setPattern(found);
      const firstIncomplete = found.steps.findIndex(s => !s.isCompleted);
      setCurrentStep(firstIncomplete >= 0 ? firstIncomplete : 0);
    }
  };

  const handleStepComplete = async (stepIndex: number) => {
    if (!pattern) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const updatedSteps = [...pattern.steps];
    updatedSteps[stepIndex].isCompleted = true;
    
    const completedCount = updatedSteps.filter(s => s.isCompleted).length;
    const starsEarned = 1;
    
    const updatedPattern: PatternData = {
      ...pattern,
      steps: updatedSteps,
      completedSteps: completedCount,
      totalStars: pattern.totalStars + starsEarned,
    };
    
    if (completedCount === pattern.steps.length) {
      updatedPattern.isComplete = true;
      const bonusStars = 5;
      await addStars(starsEarned + bonusStars);
      await completePattern(pattern.id);
      
      Alert.alert(
        '🎉 Amazing Job! 🎉',
        `You completed "${pattern.title}"!\n\nYou earned ${starsEarned + bonusStars} stars! ⭐`,
        [
          {
            text: 'Yay!',
            onPress: () => router.replace('/'),
          },
        ]
      );
    } else {
      await addStars(starsEarned);
      
      const nextIncomplete = updatedSteps.findIndex((s, i) => i > stepIndex && !s.isCompleted);
      if (nextIncomplete >= 0) {
        setCurrentStep(nextIncomplete);
      }
    }
    
    setPattern(updatedPattern);
    await savePattern(updatedPattern);
  };

  const handleStepPress = (stepIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStep(stepIndex);
  };

  const getWoollyMessage = (): string => {
    if (!pattern) return "Loading your pattern...";
    
    const progress = pattern.completedSteps / pattern.steps.length;
    
    if (progress === 0) {
      return "Let's get started! Read each step carefully. You've got this! 💪";
    } else if (progress < 0.5) {
      return "Great job so far! Keep going! 🌟";
    } else if (progress < 1) {
      return "Wow, you're almost done! 🎉";
    } else {
      return "YOU DID IT! I'm so proud! 🏆";
    }
  };

  if (!pattern) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading pattern...</Text>
      </View>
    );
  }

  const progressPercent = Math.round((pattern.completedSteps / pattern.steps.length) * 100);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF5F8', '#FFE5EC']}
        style={styles.gradient}
      >
        {/* Header with progress */}
        <View style={styles.header}>
          <Text style={styles.patternTitle} numberOfLines={1}>
            {pattern.title}
          </Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${progressPercent}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {pattern.completedSteps}/{pattern.steps.length} steps
            </Text>
          </View>
        </View>

        {/* Woolly helper */}
        <View style={styles.woollyMini}>
          <WoollyMascot 
            message={getWoollyMessage()}
            emotion={pattern.isComplete ? 'celebrating' : 'happy'}
            size="small"
          />
        </View>

        {/* Materials button with affiliate links */}
        <TouchableOpacity 
          style={styles.materialsButton}
          onPress={() => setShowMaterials(true)}
        >
          <Text style={styles.materialsButtonText}>
            📦 Materials ({pattern.materials.length} items) - Tap to Shop!
          </Text>
        </TouchableOpacity>

        {/* Steps list */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.stepsContainer}
          contentContainerStyle={styles.stepsContent}
          showsVerticalScrollIndicator={false}
        >
          {pattern.steps.map((step, index) => (
            <StepCard
              key={index}
              step={step}
              stepNumber={index + 1}
              isActive={currentStep === index}
              isCompleted={step.isCompleted}
              onPress={() => handleStepPress(index)}
              onComplete={() => handleStepComplete(index)}
            />
          ))}
          
          {/* Inline ad after steps for free users */}
          {!isPro && (
            <AdBanner 
              placement="inline"
              onUpgradePress={() => setShowUpgradeModal(true)}
            />
          )}
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </LinearGradient>

      {/* Bottom ad banner for free users */}
      {!isPro && (
        <AdBanner 
          placement="bottom"
          onUpgradePress={() => setShowUpgradeModal(true)}
        />
      )}

      {/* Materials Modal with Affiliate Links */}
      <Modal
        visible={showMaterials}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMaterials(false)}
      >
        <View style={styles.materialsModal}>
          <View style={styles.materialsHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowMaterials(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.materialsTitle}>Shop Materials</Text>
          </View>
          
          <ScrollView style={styles.materialsScroll}>
            <View style={styles.materialsPadding}>
              <Text style={styles.materialsSubtitle}>
                🛍️ Tap "Shop" to find these items online!
              </Text>
              
              <MaterialsList materials={pattern.materials} />
              
              <Text style={styles.affiliateDisclosure}>
                As an Amazon Associate, we earn from qualifying purchases. 
                Shopping through these links helps support Crochet Buddy at no extra cost to you! 💝
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.text,
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  patternTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: Colors.cream,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.green,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  woollyMini: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  materialsButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    backgroundColor: Colors.green + '20',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.green,
  },
  materialsButtonText: {
    fontSize: 16,
    color: Colors.green,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepsContainer: {
    flex: 1,
  },
  stepsContent: {
    padding: 16,
  },
  materialsModal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  materialsHeader: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cream,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: Colors.textLight,
  },
  materialsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  materialsScroll: {
    flex: 1,
  },
  materialsPadding: {
    padding: 20,
  },
  materialsSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  affiliateDisclosure: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.cream,
  },
});
