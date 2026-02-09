import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface ProContextType {
  isPro: boolean;
  isLoading: boolean;
  upgradeToPro: (receiptData?: string) => Promise<void>;
  restorePurchases: () => Promise<{ success: boolean; message: string }>;
}

const ProContext = createContext<ProContextType | undefined>(undefined);

const STORAGE_KEY = '@crochet_buddy_pro_status';
const RECEIPT_KEY = '@crochet_buddy_receipt';

// Simple obfuscation for local Pro status to prevent trivial tampering.
// This is NOT cryptographic security — real protection comes from
// server-side receipt validation with App Store / Google Play.
const encodeProStatus = (isPro: boolean): string => {
  const payload = JSON.stringify({
    pro: isPro,
    ts: Date.now(),
    platform: Platform.OS,
  });
  // Base64 encode to prevent casual inspection/editing
  return btoa(payload);
};

const decodeProStatus = (encoded: string): boolean => {
  try {
    const payload = JSON.parse(atob(encoded));
    return payload.pro === true;
  } catch {
    return false;
  }
};

export function ProProvider({ children }: { children: ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProStatus();
  }, []);

  const loadProStatus = async () => {
    try {
      const status = await AsyncStorage.getItem(STORAGE_KEY);
      if (status) {
        setIsPro(decodeProStatus(status));
      }
    } catch (error: unknown) {
      console.error('Error loading pro status:', error instanceof Error ? error.message : error);
    } finally {
      setIsLoading(false);
    }
  };

  const upgradeToPro = useCallback(async (receiptData?: string) => {
    // ===========================================
    // PRODUCTION: This function should ONLY be called after
    // a verified purchase from App Store / Google Play.
    //
    // Integration steps:
    // 1. Install: npx expo install expo-in-app-purchases
    // 2. Set up products in App Store Connect / Google Play Console
    // 3. In UpgradeModal.tsx, initiate purchase via IAP library
    // 4. On purchase success callback, pass receiptData here
    // 5. Optionally validate receipt on your server before granting
    // ===========================================

    try {
      // Store receipt for later validation/restore
      if (receiptData) {
        await AsyncStorage.setItem(RECEIPT_KEY, receiptData);
      }

      await AsyncStorage.setItem(STORAGE_KEY, encodeProStatus(true));
      setIsPro(true);
    } catch (error: unknown) {
      console.error('Error saving pro status:', error instanceof Error ? error.message : error);
      throw new Error('Failed to activate Pro. Please try again.');
    }
  }, []);

  const restorePurchases = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    // ===========================================
    // PRODUCTION: Replace with real receipt validation:
    //
    // 1. Call App Store / Google Play to check purchase history
    // 2. Validate receipts server-side
    // 3. If valid purchase found, call upgradeToPro(receipt)
    // ===========================================

    try {
      const status = await AsyncStorage.getItem(STORAGE_KEY);
      if (status && decodeProStatus(status)) {
        setIsPro(true);
        return { success: true, message: 'Pro status restored!' };
      }
      return { success: false, message: 'No previous purchases found.' };
    } catch (error: unknown) {
      return { success: false, message: 'Could not restore purchases. Please try again.' };
    }
  }, []);

  const value = useMemo(
    () => ({ isPro, isLoading, upgradeToPro, restorePurchases }),
    [isPro, isLoading, upgradeToPro, restorePurchases]
  );

  return (
    <ProContext.Provider value={value}>
      {children}
    </ProContext.Provider>
  );
}

export function usePro() {
  const context = useContext(ProContext);
  if (context === undefined) {
    throw new Error('usePro must be used within a ProProvider');
  }
  return context;
}
