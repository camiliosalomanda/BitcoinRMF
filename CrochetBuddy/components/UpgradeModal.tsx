import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';
import { usePro } from '../hooks/usePro';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PlanOption {
  id: string;
  name: string;
  price: string;
  period: string;
  savings?: string;
}

const PLANS: PlanOption[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$2.99',
    period: '/month',
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '$19.99',
    period: '/year',
    savings: 'Save 44%',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$49.99',
    period: 'one-time',
    savings: 'Best Value!',
  },
];

export default function UpgradeModal({ visible, onClose, onSuccess }: UpgradeModalProps) {
  const { upgradeToPro, restorePurchases } = usePro();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      // ===========================================
      // TODO: Replace with real IAP before submission
      //
      // 1. npx expo install expo-in-app-purchases
      // 2. import * as InAppPurchases from 'expo-in-app-purchases';
      // 3. await InAppPurchases.connectAsync();
      // 4. const { results } = await InAppPurchases.getProductsAsync([selectedPlan]);
      // 5. await InAppPurchases.purchaseItemAsync(selectedPlan);
      // 6. InAppPurchases.setPurchaseListener(({ responseCode, results }) => {
      //      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
      //        const receipt = JSON.stringify(results);
      //        upgradeToPro(receipt);
      //      }
      //    });
      // ===========================================

      // Development only: show a warning that real IAP is not configured
      if (__DEV__) {
        await upgradeToPro('dev-test-receipt');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'DEV MODE',
          'Pro activated for testing. Real IAP must be configured before submission.',
          [{
            text: 'OK',
            onPress: () => {
              onSuccess?.();
              onClose();
            }
          }]
        );
      } else {
        // In production builds, show "coming soon" until real IAP is integrated
        Alert.alert(
          'Coming Soon',
          'In-app purchases are being set up. Please check back soon!',
        );
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Purchase failed';
      Alert.alert('Error', `${message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);

    try {
      // ===========================================
      // IN PRODUCTION: Check with App Store/Google Play
      // ===========================================
      // 
      // const history = await InAppPurchases.getPurchaseHistoryAsync();
      // // Verify purchases and restore if valid
      // ===========================================

      const result = await restorePurchases();
      
      if (result.success) {
        Alert.alert('Restored!', result.message, [
          { text: 'Great!', onPress: onClose }
        ]);
      } else {
        Alert.alert('No Purchases Found', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🌟 Go Pro! 🌟</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Benefits */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Unlock Amazing Features!</Text>
            
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>📷</Text>
              <View style={styles.benefitText}>
                <Text style={styles.benefitName}>Camera & Image Upload</Text>
                <Text style={styles.benefitDesc}>Take photos or upload pictures to generate patterns!</Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>🚫</Text>
              <View style={styles.benefitText}>
                <Text style={styles.benefitName}>No Ads</Text>
                <Text style={styles.benefitDesc}>Enjoy a clean, distraction-free experience</Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>⭐</Text>
              <View style={styles.benefitText}>
                <Text style={styles.benefitName}>Unlimited Patterns</Text>
                <Text style={styles.benefitDesc}>Create as many patterns as you want</Text>
              </View>
            </View>
          </View>

          {/* Plan selection */}
          <View style={styles.plansSection}>
            <Text style={styles.plansTitle}>Choose Your Plan</Text>
            
            {PLANS.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.planCardSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedPlan(plan.id);
                }}
                activeOpacity={0.8}
              >
                {plan.savings && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>{plan.savings}</Text>
                  </View>
                )}
                
                <View style={styles.planInfo}>
                  <Text style={[
                    styles.planName,
                    selectedPlan === plan.id && styles.planNameSelected,
                  ]}>
                    {plan.name}
                  </Text>
                  <View style={styles.planPricing}>
                    <Text style={[
                      styles.planPrice,
                      selectedPlan === plan.id && styles.planPriceSelected,
                    ]}>
                      {plan.price}
                    </Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                  </View>
                </View>
                
                {selectedPlan === plan.id && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Purchase button */}
          <TouchableOpacity
            style={[styles.purchaseButton, isLoading && styles.purchaseButtonDisabled]}
            onPress={handlePurchase}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.purchaseButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.purchaseButtonText}>
                  ✨ Get Pro Now ✨
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Restore purchases */}
          <TouchableOpacity 
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={isLoading}
          >
            <Text style={styles.restoreButtonText}>Restore Previous Purchase</Text>
          </TouchableOpacity>

          {/* Terms */}
          <Text style={styles.terms}>
            Payment will be charged to your App Store or Google Play account. 
            Subscriptions auto-renew unless cancelled 24 hours before the end of the current period. 
            Manage subscriptions in your device settings.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  benefitsSection: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  benefitText: {
    flex: 1,
  },
  benefitName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  benefitDesc: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 2,
  },
  plansSection: {
    marginBottom: 24,
  },
  plansTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: Colors.cream,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '20',
  },
  savingsBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: Colors.yellow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.text,
  },
  planInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  planNameSelected: {
    color: Colors.primary,
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  planPriceSelected: {
    color: Colors.primary,
  },
  planPeriod: {
    fontSize: 12,
    color: Colors.textLight,
  },
  checkmark: {
    marginLeft: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  purchaseButton: {
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
  },
  purchaseButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  restoreButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  terms: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 16,
  },
});
