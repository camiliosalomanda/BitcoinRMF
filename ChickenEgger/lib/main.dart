import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flame_audio/flame_audio.dart';

import 'config/app_config.dart';
import 'services/ad_service.dart';
import 'services/audio_service.dart';
import 'services/game_state_service.dart';
import 'services/purchase_service.dart';
import 'screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock to portrait mode on mobile
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Initialize SharedPreferences
  final prefs = await SharedPreferences.getInstance();

  // Only initialize ads on mobile platforms
  final bool isMobile = Platform.isAndroid || Platform.isIOS;
  
  if (isMobile && !AppConfig.isPaidVersion) {
    await MobileAds.instance.initialize();
  }

  // Pre-cache audio (skip on desktop for now)
  if (isMobile) {
    try {
      FlameAudio.audioCache.loadAll([
        'flap.wav',
        'egg_drop.wav',
        'hit.wav',
        'miss.wav',
        'powerup.wav',
        'game_over.wav',
      ]);
    } catch (e) {
      debugPrint('Audio loading skipped: $e');
    }
  }

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => GameStateService(prefs)),
        ChangeNotifierProvider(create: (_) => AudioService()),
        ChangeNotifierProvider(create: (_) => AdService()),
        ChangeNotifierProvider(create: (_) => PurchaseService()),
      ],
      child: const EggDropChaosApp(),
    ),
  );
}

class EggDropChaosApp extends StatelessWidget {
  const EggDropChaosApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.orange,
        fontFamily: AppConfig.gameFont,
        scaffoldBackgroundColor: AppColors.primary,
      ),
      home: const SplashScreen(),
    );
  }
}