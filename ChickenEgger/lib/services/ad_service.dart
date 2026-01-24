import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import '../config/app_config.dart';

class AdService extends ChangeNotifier {
  BannerAd? _bannerAd;
  InterstitialAd? _interstitialAd;
  RewardedAd? _rewardedAd;

  bool _isBannerAdLoaded = false;
  bool _isInterstitialAdLoaded = false;
  bool _isRewardedAdLoaded = false;
  int _gamesPlayedSinceLastAd = 0;

  BannerAd? get bannerAd => _bannerAd;
  bool get isBannerAdLoaded => _isBannerAdLoaded;
  bool get isInterstitialAdLoaded => _isInterstitialAdLoaded;
  bool get isRewardedAdLoaded => _isRewardedAdLoaded;

  // Check if we're on a mobile platform that supports ads
  bool get _isMobilePlatform {
    try {
      return Platform.isAndroid || Platform.isIOS;
    } catch (e) {
      return false;
    }
  }

  AdService() {
    if (!AppConfig.isPaidVersion && _isMobilePlatform) {
      _loadBannerAd();
      _loadInterstitialAd();
      _loadRewardedAd();
    }
  }

  void _loadBannerAd() {
    if (!_isMobilePlatform) return;
    
    try {
      _bannerAd = BannerAd(
        adUnitId: AppConfig.bannerAdUnitId,
        size: AdSize.banner,
        request: const AdRequest(),
        listener: BannerAdListener(
          onAdLoaded: (ad) {
            _isBannerAdLoaded = true;
            notifyListeners();
          },
          onAdFailedToLoad: (ad, error) {
            debugPrint('Banner ad failed to load: $error');
            ad.dispose();
            _isBannerAdLoaded = false;
            // Retry after delay
            Future.delayed(const Duration(seconds: 30), _loadBannerAd);
          },
        ),
      );
      _bannerAd!.load();
    } catch (e) {
      debugPrint('Error loading banner ad: $e');
    }
  }

  void _loadInterstitialAd() {
    if (!_isMobilePlatform) return;
    
    try {
      InterstitialAd.load(
        adUnitId: AppConfig.interstitialAdUnitId,
        request: const AdRequest(),
        adLoadCallback: InterstitialAdLoadCallback(
          onAdLoaded: (ad) {
            _interstitialAd = ad;
            _isInterstitialAdLoaded = true;

            _interstitialAd!.fullScreenContentCallback = FullScreenContentCallback(
              onAdDismissedFullScreenContent: (ad) {
                ad.dispose();
                _isInterstitialAdLoaded = false;
                _loadInterstitialAd();
              },
              onAdFailedToShowFullScreenContent: (ad, error) {
                debugPrint('Interstitial ad failed to show: $error');
                ad.dispose();
                _isInterstitialAdLoaded = false;
                _loadInterstitialAd();
              },
            );

            notifyListeners();
          },
          onAdFailedToLoad: (error) {
            debugPrint('Interstitial ad failed to load: $error');
            _isInterstitialAdLoaded = false;
            Future.delayed(const Duration(seconds: 30), _loadInterstitialAd);
          },
        ),
      );
    } catch (e) {
      debugPrint('Error loading interstitial ad: $e');
    }
  }

  void _loadRewardedAd() {
    if (!_isMobilePlatform) return;
    
    try {
      RewardedAd.load(
        adUnitId: AppConfig.rewardedAdUnitId,
        request: const AdRequest(),
        rewardedAdLoadCallback: RewardedAdLoadCallback(
          onAdLoaded: (ad) {
            _rewardedAd = ad;
            _isRewardedAdLoaded = true;
            notifyListeners();
          },
          onAdFailedToLoad: (error) {
            debugPrint('Rewarded ad failed to load: $error');
            _isRewardedAdLoaded = false;
            Future.delayed(const Duration(seconds: 30), _loadRewardedAd);
          },
        ),
      );
    } catch (e) {
      debugPrint('Error loading rewarded ad: $e');
    }
  }

  void showInterstitialAdIfReady() {
    if (!_isMobilePlatform) return;
    
    _gamesPlayedSinceLastAd++;

    if (_gamesPlayedSinceLastAd >= AppConfig.gamesBeforeInterstitial &&
        _isInterstitialAdLoaded &&
        _interstitialAd != null) {
      _interstitialAd!.show();
      _gamesPlayedSinceLastAd = 0;
    }
  }

  void showRewardedAd({required Function(int) onRewarded}) {
    if (!_isMobilePlatform) {
      // On desktop, just give the reward without showing an ad
      onRewarded(AppConfig.rewardedAdBonusPoints);
      return;
    }
    
    if (_isRewardedAdLoaded && _rewardedAd != null) {
      _rewardedAd!.fullScreenContentCallback = FullScreenContentCallback(
        onAdDismissedFullScreenContent: (ad) {
          ad.dispose();
          _isRewardedAdLoaded = false;
          _loadRewardedAd();
        },
        onAdFailedToShowFullScreenContent: (ad, error) {
          debugPrint('Rewarded ad failed to show: $error');
          ad.dispose();
          _isRewardedAdLoaded = false;
          _loadRewardedAd();
        },
      );

      _rewardedAd!.show(
        onUserEarnedReward: (ad, reward) {
          onRewarded(AppConfig.rewardedAdBonusPoints);
        },
      );
    }
  }

  @override
  void dispose() {
    _bannerAd?.dispose();
    _interstitialAd?.dispose();
    _rewardedAd?.dispose();
    super.dispose();
  }
}
