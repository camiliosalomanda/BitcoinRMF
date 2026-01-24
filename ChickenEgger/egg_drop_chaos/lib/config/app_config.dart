import 'dart:io';
import 'package:flutter/material.dart';

class AppConfig {
  // App Info
  static const String appName = 'Egg Drop Chaos';
  static const String appVersion = '1.0.0';
  static const String bundleIdFree = 'com.yourstudio.eggdropchaos.free';
  static const String bundleIdPaid = 'com.yourstudio.eggdropchaos.premium';
  
  // Set this to true for the paid version build
  static const bool isPaidVersion = false;
  
  // Font
  static const String gameFont = 'PressStart2P';
  
  // Colors (legacy - use AppColors instead)
  static const Color primaryColor = Color(0xFFFF6B35);
  static const Color secondaryColor = Color(0xFF004E89);
  static const Color accentColor = Color(0xFFFFD700);
  static const Color backgroundColor = Color(0xFF87CEEB);
  static const Color groundColor = Color(0xFF228B22);
  
  // Game Settings
  static const double gravity = 800.0;
  static const double chickenFlapVelocity = -350.0;
  static const double gameSpeed = 150.0;
  static const double maxGameSpeed = 350.0;
  static const double speedIncreasePerPoint = 2.0;
  static const double eggDropInterval = 0.3; // seconds between egg drops
  static const int maxEggsOnScreen = 5;
  
  // Scoring
  static const int pointsPerHit = 10;
  static const int bonusPointsCombo = 5;
  static const int pointsPerMiss = -2;
  
  // AdMob IDs - Replace with your actual AdMob IDs
  static String get bannerAdUnitId {
    if (Platform.isAndroid) {
      // Android test ad unit ID - Replace with real ID for production
      return 'ca-app-pub-3940256099942544/6300978111';
    } else if (Platform.isIOS) {
      // iOS test ad unit ID - Replace with real ID for production
      return 'ca-app-pub-3940256099942544/2934735716';
    }
    throw UnsupportedError('Unsupported platform');
  }
  
  static String get interstitialAdUnitId {
    if (Platform.isAndroid) {
      return 'ca-app-pub-3940256099942544/1033173712';
    } else if (Platform.isIOS) {
      return 'ca-app-pub-3940256099942544/4411468910';
    }
    throw UnsupportedError('Unsupported platform');
  }
  
  static String get rewardedAdUnitId {
    if (Platform.isAndroid) {
      return 'ca-app-pub-3940256099942544/5224354917';
    } else if (Platform.isIOS) {
      return 'ca-app-pub-3940256099942544/1712485313';
    }
    throw UnsupportedError('Unsupported platform');
  }
  
  // In-App Purchase IDs
  static const String removeAdsProductId = 'remove_ads';
  static const String premiumUpgradeProductId = 'premium_upgrade';
  
  // Leaderboard & Achievement IDs (for Game Center / Google Play Games)
  static const String leaderboardId = 'egg_drop_chaos_highscores';
  static const String achievementFirstHit = 'first_egg_hit';
  static const String achievementComboMaster = 'combo_master_10';
  static const String achievement100Points = 'score_100_points';
  static const String achievement500Points = 'score_500_points';
  
  // Target spawn rates (total should be 1.0)
  static const Map<String, double> targetSpawnRates = {
    'car': 0.25,
    'mailbox': 0.25,
    'trashcan': 0.20,
    'bicycle': 0.10,
    'doghouse': 0.10,
    'gnome': 0.05,
    'flamingo': 0.05,
  };
  
  // Target point values
  static const Map<String, int> targetPoints = {
    'car': 10,
    'mailbox': 15,
    'trashcan': 12,
    'bicycle': 20,
    'doghouse': 25,
    'gnome': 50,      // Rare, high value
    'flamingo': 50,   // Rare, high value
  };
  
  // Target sizes (width, height)
  static const Map<String, List<double>> targetSizes = {
    'car': [80.0, 45.0],
    'mailbox': [30.0, 50.0],
    'trashcan': [35.0, 45.0],
    'bicycle': [50.0, 40.0],
    'doghouse': [55.0, 50.0],
    'gnome': [25.0, 40.0],
    'flamingo': [20.0, 55.0],
  };
}

// Centralized color definitions
class AppColors {
  // Primary palette
  static const Color primary = Color(0xFF1E3A5F);
  static const Color primaryDark = Color(0xFF0D1B2A);
  static const Color accent = Color(0xFFFFD700);
  
  // Sky colors
  static const Color skyGradientTop = Color(0xFF1E90FF);
  static const Color skyGradientBottom = Color(0xFF87CEEB);
  
  // Game elements
  static const Color chicken = Color(0xFFFFA500);
  static const Color chickenComb = Color(0xFFFF0000);
  static const Color egg = Color(0xFFFFFAF0);
  static const Color ground = Color(0xFF228B22);
  static const Color sidewalk = Color(0xFFC0C0C0);
  static const Color road = Color(0xFF404040);
  
  // UI elements
  static const Color buttonPrimary = Color(0xFF4CAF50);
  static const Color buttonSecondary = Color(0xFF607D8B);
  static const Color success = Color(0xFF4CAF50);
  static const Color error = Color(0xFFE53935);
  static const Color warning = Color(0xFFFF9800);
}
