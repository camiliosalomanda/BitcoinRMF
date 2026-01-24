import 'package:flutter/foundation.dart';

/// Simplified purchase service for cross-platform compatibility
/// Full IAP implementation should be added when deploying to mobile
class PurchaseService extends ChangeNotifier {
  bool _isAdsRemoved = false;
  bool _isPremium = false;
  bool _isAvailable = false;

  bool get isAdsRemoved => _isAdsRemoved;
  bool get isPremium => _isPremium;
  bool get isAvailable => _isAvailable;

  Future<void> initialize() async {
    // In-app purchases only work on iOS/Android
    // For Windows desktop testing, we'll simulate availability
    if (defaultTargetPlatform == TargetPlatform.iOS ||
        defaultTargetPlatform == TargetPlatform.android) {
      // TODO: Initialize real IAP when deploying to mobile
      _isAvailable = false;
    } else {
      // Desktop platforms - IAP not available
      _isAvailable = false;
    }
    notifyListeners();
  }

  Future<bool> purchaseRemoveAds() async {
    // Simulated purchase for testing
    if (!_isAvailable) {
      debugPrint('In-app purchases not available on this platform');
      return false;
    }
    // TODO: Implement real purchase flow
    _isAdsRemoved = true;
    notifyListeners();
    return true;
  }

  Future<bool> purchasePremium() async {
    // Simulated purchase for testing
    if (!_isAvailable) {
      debugPrint('In-app purchases not available on this platform');
      return false;
    }
    // TODO: Implement real purchase flow
    _isPremium = true;
    _isAdsRemoved = true;
    notifyListeners();
    return true;
  }

  /// Purchase a product by ID
  Future<bool> purchaseProduct(String productId) async {
    if (!_isAvailable) {
      debugPrint('In-app purchases not available on this platform');
      return false;
    }
    
    // Map product IDs to purchase methods
    if (productId.contains('remove_ads')) {
      return purchaseRemoveAds();
    } else if (productId.contains('premium')) {
      return purchasePremium();
    }
    
    debugPrint('Unknown product ID: $productId');
    return false;
  }

  Future<void> restorePurchases() async {
    // TODO: Implement restore purchases for mobile
    debugPrint('Restore purchases not available on this platform');
  }

}
