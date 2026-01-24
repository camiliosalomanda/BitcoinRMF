import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import '../config/app_config.dart';

class PurchaseService extends ChangeNotifier {
  final InAppPurchase _inAppPurchase = InAppPurchase.instance;
  
  StreamSubscription<List<PurchaseDetails>>? _subscription;
  
  List<ProductDetails> _products = [];
  final List<PurchaseDetails> _purchases = [];
  bool _isAvailable = false;
  bool _purchasePending = false;
  bool _loading = true;
  String? _queryProductError;
  
  bool _adsRemoved = false;
  bool _premiumUnlocked = false;
  
  List<ProductDetails> get products => _products;
  bool get isAvailable => _isAvailable;
  bool get purchasePending => _purchasePending;
  bool get loading => _loading;
  String? get queryProductError => _queryProductError;
  bool get adsRemoved => _adsRemoved;
  bool get premiumUnlocked => _premiumUnlocked;
  
  Function(bool success)? onPurchaseComplete;
  
  static const Set<String> _productIds = {
    AppConfig.removeAdsProductId,
    AppConfig.premiumUpgradeProductId,
  };
  
  PurchaseService() {
    _initialize();
  }
  
  Future<void> _initialize() async {
    _isAvailable = await _inAppPurchase.isAvailable();
    
    if (!_isAvailable) {
      _loading = false;
      notifyListeners();
      return;
    }
    
    if (Platform.isIOS) {
      final InAppPurchaseStoreKitPlatformAddition iosPlatformAddition =
          _inAppPurchase
              .getPlatformAddition<InAppPurchaseStoreKitPlatformAddition>();
      await iosPlatformAddition.setDelegate(ExamplePaymentQueueDelegate());
    }
    
    final Stream<List<PurchaseDetails>> purchaseUpdated =
        _inAppPurchase.purchaseStream;
    _subscription = purchaseUpdated.listen(
      _onPurchaseUpdate,
      onDone: _updateStreamOnDone,
      onError: _updateStreamOnError,
    );
    
    await _loadProducts();
    await _restorePurchases();
    
    _loading = false;
    notifyListeners();
  }
  
  Future<void> _loadProducts() async {
    final ProductDetailsResponse response =
        await _inAppPurchase.queryProductDetails(_productIds);
    
    if (response.notFoundIDs.isNotEmpty) {
      debugPrint('Products not found: ${response.notFoundIDs}');
    }
    
    if (response.error != null) {
      _queryProductError = response.error!.message;
      debugPrint('Product query error: ${response.error!.message}');
    }
    
    _products = response.productDetails;
    notifyListeners();
  }
  
  Future<void> _restorePurchases() async {
    try {
      await _inAppPurchase.restorePurchases();
    } catch (e) {
      debugPrint('Error restoring purchases: $e');
    }
  }
  
  void _onPurchaseUpdate(List<PurchaseDetails> purchaseDetailsList) {
    _purchases.addAll(purchaseDetailsList);
    
    for (final PurchaseDetails purchaseDetails in purchaseDetailsList) {
      if (purchaseDetails.status == PurchaseStatus.pending) {
        _purchasePending = true;
        notifyListeners();
      } else {
        if (purchaseDetails.status == PurchaseStatus.error) {
          _handleError(purchaseDetails.error!);
          onPurchaseComplete?.call(false);
        } else if (purchaseDetails.status == PurchaseStatus.purchased ||
            purchaseDetails.status == PurchaseStatus.restored) {
          _verifyAndDeliverPurchase(purchaseDetails);
        }
        
        if (purchaseDetails.pendingCompletePurchase) {
          _inAppPurchase.completePurchase(purchaseDetails);
        }
        
        _purchasePending = false;
        notifyListeners();
      }
    }
  }
  
  void _handleError(IAPError error) {
    debugPrint('Purchase error: ${error.message}');
  }
  
  void _verifyAndDeliverPurchase(PurchaseDetails purchaseDetails) {
    // In production, verify the purchase with your server
    // For now, we'll trust the local verification
    
    if (purchaseDetails.productID == AppConfig.removeAdsProductId) {
      _adsRemoved = true;
      onPurchaseComplete?.call(true);
    } else if (purchaseDetails.productID == AppConfig.premiumUpgradeProductId) {
      _premiumUnlocked = true;
      _adsRemoved = true;
      onPurchaseComplete?.call(true);
    }
    
    notifyListeners();
  }
  
  void _updateStreamOnDone() {
    _subscription?.cancel();
  }
  
  void _updateStreamOnError(dynamic error) {
    debugPrint('Purchase stream error: $error');
  }
  
  Future<bool> buyProduct(ProductDetails product) async {
    if (!_isAvailable) {
      return false;
    }
    
    final PurchaseParam purchaseParam = PurchaseParam(productDetails: product);
    
    try {
      final bool success = await _inAppPurchase.buyNonConsumable(
        purchaseParam: purchaseParam,
      );
      return success;
    } catch (e) {
      debugPrint('Error purchasing: $e');
      return false;
    }
  }
  
  Future<void> restorePurchases() async {
    await _restorePurchases();
  }
  
  ProductDetails? getProductById(String productId) {
    try {
      return _products.firstWhere((product) => product.id == productId);
    } catch (e) {
      return null;
    }
  }
  
  @override
  void dispose() {
    if (Platform.isIOS) {
      final InAppPurchaseStoreKitPlatformAddition iosPlatformAddition =
          _inAppPurchase
              .getPlatformAddition<InAppPurchaseStoreKitPlatformAddition>();
      iosPlatformAddition.setDelegate(null);
    }
    _subscription?.cancel();
    super.dispose();
  }
}

// iOS-specific delegate for payment queue
class ExamplePaymentQueueDelegate implements SKPaymentQueueDelegateWrapper {
  @override
  bool shouldContinueTransaction(
      SKPaymentTransactionWrapper transaction, SKStorefrontWrapper storefront) {
    return true;
  }

  @override
  bool shouldShowPriceConsent() {
    return false;
  }
}
