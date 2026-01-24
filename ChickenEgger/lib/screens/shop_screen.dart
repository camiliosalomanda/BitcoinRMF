import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../config/app_config.dart';
import '../services/purchase_service.dart';
import '../widgets/animated_background.dart';
import '../widgets/game_button.dart';

class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key});

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  bool _isPurchasing = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AnimatedBackground(
        child: SafeArea(
          child: Consumer<PurchaseService>(
            builder: (context, purchaseService, child) {
              return Column(
                children: [
                  // Header
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        GameIconButton(
                          icon: Icons.arrow_back_rounded,
                          onPressed: () => Navigator.pop(context),
                          backgroundColor: AppColors.buttonSecondary,
                          size: 44,
                        ),
                        const Expanded(
                          child: Center(
                            child: Text(
                              'SHOP',
                              style: TextStyle(
                                fontFamily: AppConfig.gameFont,
                                fontSize: 24,
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 2,
                                shadows: [
                                  Shadow(
                                    color: AppColors.accent,
                                    blurRadius: 10,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 44),
                      ],
                    ),
                  )
                      .animate()
                      .fadeIn(duration: 300.ms)
                      .slideY(begin: -0.2, end: 0),

                  // Shop content
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          // Remove Ads Card
                          _buildPurchaseCard(
                            title: 'REMOVE ADS',
                            description:
                                'Enjoy uninterrupted gameplay without any advertisements!',
                            icon: Icons.block_rounded,
                            iconColor: Colors.red,
                            price: '\$1.99',
                            isPurchased: purchaseService.isAdsRemoved,
                            onPurchase: () => _handlePurchase(
                              purchaseService,
                              AppConfig.removeAdsProductId,
                            ),
                            delay: 100,
                          ),

                          const SizedBox(height: 16),

                          // Premium Upgrade Card
                          _buildPurchaseCard(
                            title: 'PREMIUM',
                            description:
                                'Remove ads + Unlock exclusive chicken skins and bonus levels!',
                            icon: Icons.workspace_premium_rounded,
                            iconColor: AppColors.accent,
                            price: '\$4.99',
                            isPurchased: purchaseService.isPremium,
                            isPremium: true,
                            onPurchase: () => _handlePurchase(
                              purchaseService,
                              AppConfig.premiumUpgradeProductId,
                            ),
                            delay: 200,
                          ),

                          const SizedBox(height: 24),

                          // Restore Purchases
                          _buildRestoreSection(purchaseService),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildPurchaseCard({
    required String title,
    required String description,
    required IconData icon,
    required Color iconColor,
    required String price,
    required bool isPurchased,
    required VoidCallback onPurchase,
    required int delay,
    bool isPremium = false,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isPremium
              ? [
                  AppColors.accent.withValues(alpha: 0.2),
                  AppColors.accent.withValues(alpha: 0.05),
                ]
              : [
                  Colors.white.withValues(alpha: 0.1),
                  Colors.white.withValues(alpha: 0.02),
                ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isPremium
              ? AppColors.accent
              : Colors.white.withValues(alpha: 0.2),
          width: 2,
        ),
        boxShadow: isPremium
            ? [
                BoxShadow(
                  color: AppColors.accent.withValues(alpha: 0.2),
                  blurRadius: 15,
                  spreadRadius: 2,
                ),
              ]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Icon container
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: iconColor.withValues(alpha: 0.3),
                    width: 2,
                  ),
                ),
                child: Icon(icon, color: iconColor, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          title,
                          style: TextStyle(
                            fontFamily: AppConfig.gameFont,
                            fontSize: 18,
                            color: isPremium ? AppColors.accent : Colors.white,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1,
                          ),
                        ),
                        if (isPremium) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.accent,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              'BEST',
                              style: TextStyle(
                                fontFamily: AppConfig.gameFont,
                                fontSize: 8,
                                color: Colors.black,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      price,
                      style: TextStyle(
                        fontFamily: AppConfig.gameFont,
                        fontSize: 14,
                        color: isPremium
                            ? AppColors.accent.withValues(alpha: 0.8)
                            : Colors.grey.shade400,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            description,
            style: TextStyle(
              fontFamily: AppConfig.gameFont,
              fontSize: 11,
              color: Colors.grey.shade400,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),
          // Purchase button
          SizedBox(
            width: double.infinity,
            child: isPurchased
                ? _buildPurchasedBadge()
                : GameButton(
                    text: _isPurchasing ? 'LOADING...' : 'BUY NOW',
                    icon: Icons.shopping_cart_rounded,
                    onPressed: _isPurchasing ? () {} : onPurchase,
                    backgroundColor:
                        isPremium ? AppColors.accent : AppColors.success,
                    enabled: !_isPurchasing,
                    height: 48,
                  ),
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(delay: Duration(milliseconds: delay), duration: 300.ms)
        .slideX(begin: 0.1, end: 0);
  }

  Widget _buildPurchasedBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.success.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.success,
          width: 2,
        ),
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.check_circle_rounded,
            color: AppColors.success,
            size: 20,
          ),
          SizedBox(width: 8),
          Text(
            'PURCHASED',
            style: TextStyle(
              fontFamily: AppConfig.gameFont,
              fontSize: 14,
              color: AppColors.success,
              fontWeight: FontWeight.bold,
              letterSpacing: 1,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRestoreSection(PurchaseService purchaseService) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.1),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Text(
            'Already purchased?',
            style: TextStyle(
              fontFamily: AppConfig.gameFont,
              fontSize: 12,
              color: Colors.grey.shade400,
            ),
          ),
          const SizedBox(height: 12),
          GameButton(
            text: 'RESTORE PURCHASES',
            icon: Icons.restore_rounded,
            onPressed: () => _handleRestore(purchaseService),
            backgroundColor: AppColors.buttonSecondary,
            width: double.infinity,
            height: 44,
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(delay: 400.ms, duration: 300.ms)
        .slideY(begin: 0.1, end: 0);
  }

  Future<void> _handlePurchase(
    PurchaseService purchaseService,
    String productId,
  ) async {
    setState(() => _isPurchasing = true);

    try {
      final success = await purchaseService.purchaseProduct(productId);

      if (!mounted) return;

      if (success) {
        _showSnackBar('Purchase successful! Thank you!', Colors.green);
      } else {
        _showSnackBar('Purchase cancelled or failed', Colors.orange);
      }
    } catch (e) {
      if (!mounted) return;
      _showSnackBar('Error: $e', Colors.red);
    } finally {
      if (mounted) {
        setState(() => _isPurchasing = false);
      }
    }
  }

  Future<void> _handleRestore(PurchaseService purchaseService) async {
    setState(() => _isPurchasing = true);

    try {
      await purchaseService.restorePurchases();

      if (!mounted) return;
      _showSnackBar('Purchases restored!', Colors.green);
    } catch (e) {
      if (!mounted) return;
      _showSnackBar('Error restoring: $e', Colors.red);
    } finally {
      if (mounted) {
        setState(() => _isPurchasing = false);
      }
    }
  }

  void _showSnackBar(String message, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: const TextStyle(
            fontFamily: AppConfig.gameFont,
            fontSize: 12,
          ),
        ),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    );
  }
}
