import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/app_config.dart';
import '../services/game_state_service.dart';
import '../services/audio_service.dart';
import '../widgets/animated_background.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final gameState = Provider.of<GameStateService>(context);
    final audioService = Provider.of<AudioService>(context);

    return Scaffold(
      body: Stack(
        children: [
          const AnimatedBackground(),
          SafeArea(
            child: Column(
              children: [
                _buildAppBar(context),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionTitle('AUDIO'),
                        const SizedBox(height: 16),
                        _buildSettingCard(
                          icon: Icons.music_note,
                          title: 'Music',
                          subtitle: 'Background music',
                          value: gameState.musicEnabled,
                          onChanged: (value) {
                            gameState.toggleMusic();
                            audioService.setMusicEnabled(value);
                          },
                        ),
                        const SizedBox(height: 12),
                        _buildSettingCard(
                          icon: Icons.volume_up,
                          title: 'Sound Effects',
                          subtitle: 'Game sounds',
                          value: gameState.soundEnabled,
                          onChanged: (value) {
                            gameState.toggleSound();
                            audioService.setSoundEnabled(value);
                          },
                        ),
                        const SizedBox(height: 30),
                        _buildSectionTitle('DATA'),
                        const SizedBox(height: 16),
                        _buildActionCard(
                          icon: Icons.delete_outline,
                          title: 'Reset Progress',
                          subtitle: 'Clear all game data',
                          color: Colors.red,
                          onTap: () => _showResetConfirmation(context, gameState),
                        ),
                        const SizedBox(height: 30),
                        _buildSectionTitle('ABOUT'),
                        const SizedBox(height: 16),
                        _buildInfoCard(
                          icon: Icons.info_outline,
                          title: AppConfig.appName,
                          subtitle: 'Version ${AppConfig.appVersion}',
                        ),
                        const SizedBox(height: 12),
                        _buildActionCard(
                          icon: Icons.star_outline,
                          title: 'Rate Us',
                          subtitle: 'Love the game? Leave a review!',
                          color: AppConfig.accentColor,
                          onTap: () {
                            // Would open app store review
                          },
                        ),
                        const SizedBox(height: 12),
                        _buildActionCard(
                          icon: Icons.policy_outlined,
                          title: 'Privacy Policy',
                          subtitle: 'View our privacy policy',
                          color: Colors.blue,
                          onTap: () {
                            // Would open privacy policy
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.of(context).pop(),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.3),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.arrow_back,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(width: 16),
          const Text(
            'SETTINGS',
            style: TextStyle(
              fontFamily: 'GameFont',
              fontSize: 24,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: TextStyle(
        fontFamily: 'GameFont',
        fontSize: 14,
        color: Colors.white.withOpacity(0.7),
        letterSpacing: 2,
      ),
    );
  }

  Widget _buildSettingCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.3),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white.withOpacity(0.1),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppConfig.primaryColor.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: AppConfig.primaryColor),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontFamily: 'GameFont',
                    fontSize: 14,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white.withOpacity(0.6),
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeThumbColor: AppConfig.primaryColor,
          ),
        ],
      ),
    );
  }

  Widget _buildActionCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.3),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: Colors.white.withOpacity(0.1),
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontFamily: 'GameFont',
                      fontSize: 14,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white.withOpacity(0.6),
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: Colors.white.withOpacity(0.5),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.3),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white.withOpacity(0.1),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppConfig.secondaryColor.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: AppConfig.secondaryColor),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontFamily: 'GameFont',
                    fontSize: 14,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white.withOpacity(0.6),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showResetConfirmation(BuildContext context, GameStateService gameState) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF2D2D2D),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: const Text(
          'Reset Progress?',
          style: TextStyle(
            fontFamily: 'GameFont',
            fontSize: 18,
            color: Colors.white,
          ),
        ),
        content: Text(
          'This will delete all your game data including high scores and statistics. This action cannot be undone.',
          style: TextStyle(
            color: Colors.white.withOpacity(0.8),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(
              'CANCEL',
              style: TextStyle(
                fontFamily: 'GameFont',
                color: Colors.white.withOpacity(0.7),
              ),
            ),
          ),
          TextButton(
            onPressed: () {
              gameState.resetAllData();
              Navigator.of(context).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Progress has been reset'),
                  backgroundColor: Colors.red,
                ),
              );
            },
            child: const Text(
              'RESET',
              style: TextStyle(
                fontFamily: 'GameFont',
                color: Colors.red,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
