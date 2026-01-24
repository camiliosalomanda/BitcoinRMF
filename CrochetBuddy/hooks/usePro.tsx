import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProContextType {
  isPro: boolean;
  isLoading: boolean;
  upgradeToPro: () => Promise<void>;
  restorePurchases: () => Promise<{ success: boolean; message: string }>;
}

const ProContext = createContext<ProContextType | undefined>(undefined);

const STORAGE_KEY = '@crochet_buddy_pro_status';

export function ProProvider({ children }: { children: ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProStatus();
  }, []);

  const loadProStatus = async () => {
    try {
      const status = await AsyncStorage.getItem(STORAGE_KEY);
      if (status === 'true') {
        setIsPro(true);
      }
    } catch (error) {
      console.error('Error loading pro status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const upgradeToPro = async () => {
    // In production, this will be triggered AFTER a successful
    // App Store / Google Play purchase is verified
    // 
    // For iOS: Use expo-in-app-purchases or react-native-iap
    // For Android: Use the same libraries
    //
    // The purchase flow:
    // 1. User taps "Subscribe" 
    // 2. App Store/Google Play handles payment
    // 3. On success callback, call this function
    // 4. Store status locally as a cache
    
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
      setIsPro(true);
    } catch (error) {
      console.error('Error saving pro status:', error);
    }
  };

  const restorePurchases = async (): Promise<{ success: boolean; message: string }> => {
    // In production, this will:
    // 1. Call App Store / Google Play to check purchase history
    // 2. If valid purchase found, enable Pro
    //
    // For now, just check local storage
    
    try {
      const status = await AsyncStorage.getItem(STORAGE_KEY);
      if (status === 'true') {
        setIsPro(true);
        return { success: true, message: 'Pro status restored!' };
      }
      return { success: false, message: 'No previous purchases found.' };
    } catch (error) {
      return { success: false, message: 'Could not restore purchases. Please try again.' };
    }
  };

  return (
    <ProContext.Provider
      value={{
        isPro,
        isLoading,
        upgradeToPro,
        restorePurchases,
      }}
    >
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
