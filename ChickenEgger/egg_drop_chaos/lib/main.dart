import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flame_audio/flame_audio.dart';

import 'config/app_config.dart';
import 'services/ad_service.dart';
import 'services/game_state_service.dart';
import 'services/purchase_service.dart';
import 'services/audio_service.dart';
import 'screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Lock to portrait mode
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  // Set fullscreen immersive mode
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  
  // Initialize SharedPreferences
  final prefs = await SharedPreferences.getInstance();
  
  // Initialize AdMob
  await MobileAds.instance.initialize();
  
  // Pre-cache audio
  await FlameAudio.audioCache.loadAll([
    'flap.wav',
    'egg_drop.wav',
    'hit.wav',
    'miss.wav',
    'powerup.wav',
    'game_over.wav',
    'background_music.mp3',
  ]);
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => GameStateService(prefs)),
        ChangeNotifierProvider(create: (_) => AdService()),
        ChangeNotifierProvider(create: (_) => PurchaseService()),
        ChangeNotifierProvider(create: (_) => AudioService()),
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
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppConfig.primaryColor,
          brightness: Brightness.light,
        ),
        fontFamily: 'GameFont',
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppConfig.primaryColor,
          brightness: Brightness.dark,
        ),
        fontFamily: 'GameFont',
      ),
      themeMode: ThemeMode.dark,
      home: const SplashScreen(),
    );
  }
}
