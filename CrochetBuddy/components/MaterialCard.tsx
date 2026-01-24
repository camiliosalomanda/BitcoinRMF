import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';
import { Material } from '../constants/Types';

interface MaterialCardProps {
  material: Material;
}

// Affiliate link configuration
// Replace these with your actual affiliate links/IDs
const AFFILIATE_CONFIG = {
  // Amazon Associates
  amazonTag: 'crochetbuddy-20', // Your Amazon affiliate tag
  
  // Craft store affiliates (examples)
  joannTag: 'crochetbuddy',
  michaelsTag: 'crochetbuddy',
};

// Generate affiliate URL based on material type
const getAffiliateUrl = (material: Material): string => {
  const searchTerm = encodeURIComponent(`${material.item} ${material.details}`);
  
  // Default to Amazon search with affiliate tag
  // In production, you'd want more specific product links
  return `https://www.amazon.com/s?k=${searchTerm}&tag=${AFFILIATE_CONFIG.amazonTag}`;
};

export default function MaterialCard({ material }: MaterialCardProps) {
  const handleShopPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const url = material.affiliateUrl || getAffiliateUrl(material);
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Oops!', 'Could not open the shop link.');
      }
    } catch (error) {
      console.error('Error opening affiliate link:', error);
      Alert.alert('Oops!', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.materialInfo}>
        <Text style={styles.emoji}>{material.emoji}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.itemName}>{material.item}</Text>
          <Text style={styles.details}>{material.details}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.shopButton}
        onPress={handleShopPress}
        activeOpacity={0.7}
      >
        <Text style={styles.shopButtonText}>🛒 Shop</Text>
      </TouchableOpacity>
    </View>
  );
}

// Full materials list component with all materials
interface MaterialsListProps {
  materials: Material[];
}

export function MaterialsList({ materials }: MaterialsListProps) {
  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>📦 Materials Needed</Text>
        <Text style={styles.affiliateNote}>Shop links help support the app!</Text>
      </View>
      
      {materials.map((material, index) => (
        <MaterialCard key={index} material={material} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  materialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 28,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  details: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 2,
  },
  shopButton: {
    backgroundColor: Colors.green + '20',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.green,
  },
  shopButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.green,
  },
  listContainer: {
    marginBottom: 16,
  },
  listHeader: {
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  affiliateNote: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
