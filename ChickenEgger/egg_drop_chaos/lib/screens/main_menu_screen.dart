import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../config/app_config.dart';
import '../services/game_state_service.dart';
import '../services/audio_service.dart';
import '../widgets/game_button.dart';
import '../widgets/animated_background.dart';
import 'game_screen.dart';
import 'settings_screen.dart';
import 'shop_screen.dart';
import 'stats_screen.dart';

class MainMenuScreen extends StatefulWidget {
  const MainMenuScreen({super.key});

  @override
  State<MainMenuScreen> createState() => _MainMenuScreenState();
}

class _MainMenuScreenState extends State<MainMenuScreen> {
  @override
  void initState() {
    super.initState();
    // Play background music
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final audioService = Provider.of<AudioService>(context, listen: false);
      if (audioService.musicEnabled) {
        audioService.playBackgroundMusic();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final gameState = Provider.of<GameStateService>(context);
    
    return Scaffold(
      body: AnimatedBackground(
        child: SafeArea(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(flex: 1),
                
                // Title
                _buildTitle(),
                
                const SizedBox(height: 20),
                
                // High score
                _buildHighScore(gameState.highScore),
                
                const Spacer(flex: 1),
                
                // Buttons
                _buildMenuButtons(context),
                
                const Spacer(flex: 1),
                
                // Version info
                Text(
                  'v${AppConfig.appVersion}',
                  style: TextStyle(
                    fontFamily: AppConfig.gameFont,
                    fontSize: 10,
                    color: Colors.white.withValues(alpha: 0.5),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTitle() {
    return Column(
      children: [
        // Chicken mascot
        _buildChickenMascot()
            .animate(onPlay: (controller) => controller.repeat())
            .shimmer(
              duration: 2.seconds,
              color: Colors.white.withValues(alpha: 0.3),
            ),
        const SizedBox(height: 20),
        Text(
          'EGG DROP',
          style: TextStyle(
            fontFamily: AppConfig.gameFont,
            fontSize: 32,
            color: Colors.white,
            shadows: [
              Shadow(
                blurRadius: 10,
                color: Colors.black.withValues(alpha: 0.5),
                offset: const Offset(3, 3),
              ),
            ],
          ),
        ).animate().fadeIn(duration: 500.ms),
        Text(
          'CHAOS',
          style: TextStyle(
            fontFamily: AppConfig.gameFont,
            fontSize: 44,
            color: AppColors.accent,
            shadows: [
              Shadow(
                blurRadius: 10,
                color: Colors.black.withValues(alpha: 0.5),
                offset: const Offset(3, 3),
              ),
            ],
          ),
        ).animate().fadeIn(delay: 200.ms, duration: 500.ms),
      ],
    );
  }

  Widget _buildChickenMascot() {
    return Container(
      width: 100,
      height: 100,
      decoration: BoxDecoration(
        color: AppColors.chicken,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            blurRadius: 20,
            color: AppColors.chicken.withValues(alpha: 0.5),
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: const Center(
        child: Text(
          '🐔',
          style: TextStyle(fontSize: 50),
        ),
      ),
    );
  }

  Widget _buildHighScore(int highScore) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppColors.accent.withValues(alpha: 0.5),
          width: 2,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.emoji_events,
            color: AppColors.accent,
            size: 24,
          ),
          const SizedBox(width: 10),
          Text(
            'BEST: $highScore',
            style: const TextStyle(
              fontFamily: AppConfig.gameFont,
              fontSize: 18,
              color: Colors.white,
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 400.ms, duration: 500.ms).slideY(begin: 0.3, end: 0);
  }

  Widget _buildMenuButtons(BuildContext context) {
    return Column(
      children: [
        // Play button
        GameButton(
          text: 'PLAY',
          onPressed: () => _navigateToGame(context),
          backgroundColor: AppColors.success,
          width: 200,
        ).animate().fadeIn(delay: 500.ms, duration: 300.ms).slideX(begin: -0.3, end: 0),
        
        const SizedBox(height: 16),
        
        // Stats button
        GameButton(
          text: 'STATS',
          onPressed: () => _navigateToStats(context),
          backgroundColor: const Color(0xFF2196F3),
          width: 200,
        ).animate().fadeIn(delay: 600.ms, duration: 300.ms).slideX(begin: 0.3, end: 0),
        
        const SizedBox(height: 16),
        
        // Shop button (only show for free version)
        if (!AppConfig.isPaidVersion)
          GameButton(
            text: 'SHOP',
            onPressed: () => _navigateToShop(context),
            backgroundColor: AppColors.accent,
            width: 200,
          ).animate().fadeIn(delay: 700.ms, duration: 300.ms).slideX(begin: -0.3, end: 0),
        
        if (!AppConfig.isPaidVersion) const SizedBox(height: 16),
        
        // Settings button
        GameButton(
          text: 'SETTINGS',
          onPressed: () => _navigateToSettings(context),
          backgroundColor: AppColors.buttonSecondary,
          width: 200,
        ).animate().fadeIn(delay: 800.ms, duration: 300.ms).slideX(begin: 0.3, end: 0),
      ],
    );
  }

  void _navigateToGame(BuildContext context) {
    Provider.of<AudioService>(context, listen: false).stopMusic();
    Navigator.of(context).push(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) =>
            const GameScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(
            opacity: animation,
            child: child,
          );
        },
        transitionDuration: const Duration(milliseconds: 300),
      ),
    );
  }

  void _navigateToStats(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => const StatsScreen()),
    );
  }

  void _navigateToShop(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => const ShopScreen()),
    );
  }

  void _navigateToSettings(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => const SettingsScreen()),
    );
  }
}
