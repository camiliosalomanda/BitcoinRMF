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
  bool _adsRemoved = false;
  
  int _gamesPlayedSinceLastAd = 0;
  static const int _gamesBeforeInterstitial = 3;
  
  bool get isBannerAdLoaded => _isBannerAdLoaded && !_adsRemoved;
  bool get isInterstitialAdLoaded => _isInterstitialAdLoaded && !_adsRemoved;
  bool get isRewardedAdLoaded => _isRewardedAdLoaded;
  bool get adsRemoved => _adsRemoved;
  BannerAd? get bannerAd => _bannerAd;
  
  AdService() {
    if (!AppConfig.isPaidVersion) {
      _loadBannerAd();
      _loadInterstitialAd();
      _loadRewardedAd();
    }
  }
  
  void setAdsRemoved(bool removed) {
    _adsRemoved = removed;
    if (removed) {
      _disposeBannerAd();
      _disposeInterstitialAd();
    }
    notifyListeners();
  }
  
  // Banner Ad
  void _loadBannerAd() {
    if (AppConfig.isPaidVersion || _adsRemoved) return;
    
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
          debugPrint('Banner ad failed to load: ${error.message}');
          ad.dispose();
          _isBannerAdLoaded = false;
          // Retry after delay
          Future.delayed(const Duration(seconds: 30), _loadBannerAd);
        },
        onAdClosed: (ad) {
          _loadBannerAd();
        },
      ),
    )..load();
  }
  
  void _disposeBannerAd() {
    _bannerAd?.dispose();
    _bannerAd = null;
    _isBannerAdLoaded = false;
  }
  
  // Interstitial Ad
  void _loadInterstitialAd() {
    if (AppConfig.isPaidVersion || _adsRemoved) return;
    
    InterstitialAd.load(
      adUnitId: AppConfig.interstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _interstitialAd = ad;
          _isInterstitialAdLoaded = true;
          
          ad.fullScreenContentCallback = FullScreenContentCallback(
            onAdDismissedFullScreenContent: (ad) {
              ad.dispose();
              _loadInterstitialAd();
            },
            onAdFailedToShowFullScreenContent: (ad, error) {
              debugPrint('Interstitial ad failed to show: ${error.message}');
              ad.dispose();
              _loadInterstitialAd();
            },
          );
          
          notifyListeners();
        },
        onAdFailedToLoad: (error) {
          debugPrint('Interstitial ad failed to load: ${error.message}');
          _isInterstitialAdLoaded = false;
          // Retry after delay
          Future.delayed(const Duration(seconds: 30), _loadInterstitialAd);
        },
      ),
    );
  }
  
  void _disposeInterstitialAd() {
    _interstitialAd?.dispose();
    _interstitialAd = null;
    _isInterstitialAdLoaded = false;
  }
  
  void showInterstitialAdIfReady() {
    if (AppConfig.isPaidVersion || _adsRemoved) return;
    
    _gamesPlayedSinceLastAd++;
    
    if (_gamesPlayedSinceLastAd >= _gamesBeforeInterstitial && _isInterstitialAdLoaded) {
      _interstitialAd?.show();
      _gamesPlayedSinceLastAd = 0;
      _isInterstitialAdLoaded = false;
    }
  }
  
  // Rewarded Ad
  void _loadRewardedAd() {
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
          debugPrint('Rewarded ad failed to load: ${error.message}');
          _isRewardedAdLoaded = false;
          // Retry after delay
          Future.delayed(const Duration(seconds: 30), _loadRewardedAd);
        },
      ),
    );
  }
  
  void showRewardedAd({required Function(int) onReward}) {
    if (_rewardedAd == null) {
      debugPrint('Rewarded ad not ready');
      return;
    }
    
    _rewardedAd!.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        ad.dispose();
        _isRewardedAdLoaded = false;
        _loadRewardedAd();
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        debugPrint('Rewarded ad failed to show: ${error.message}');
        ad.dispose();
        _isRewardedAdLoaded = false;
        _loadRewardedAd();
      },
    );
    
    _rewardedAd!.show(
      onUserEarnedReward: (ad, reward) {
        onReward(reward.amount.toInt());
      },
    );
  }
  
  @override
  void dispose() {
    _disposeBannerAd();
    _disposeInterstitialAd();
    _rewardedAd?.dispose();
    super.dispose();
  }
}
