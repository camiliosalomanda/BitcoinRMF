import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../config/app_config.dart';
import '../services/game_state_service.dart';
import '../widgets/animated_background.dart';
import '../widgets/game_button.dart';

class StatsScreen extends StatelessWidget {
  const StatsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AnimatedBackground(
        child: SafeArea(
          child: Consumer<GameStateService>(
            builder: (context, gameState, child) {
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
                              'STATISTICS',
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
                        const SizedBox(width: 44), // Balance the back button
                      ],
                    ),
                  )
                      .animate()
                      .fadeIn(duration: 300.ms)
                      .slideY(begin: -0.2, end: 0),

                  // Stats content
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          // High Score Card
                          _buildHighScoreCard(gameState.highScore)
                              .animate()
                              .fadeIn(delay: 100.ms, duration: 300.ms)
                              .slideX(begin: -0.1, end: 0),

                          const SizedBox(height: 16),

                          // Main Stats Grid
                          _buildStatsGrid(gameState)
                              .animate()
                              .fadeIn(delay: 200.ms, duration: 300.ms)
                              .slideX(begin: 0.1, end: 0),

                          const SizedBox(height: 16),

                          // Additional Stats
                          _buildAdditionalStats(gameState)
                              .animate()
                              .fadeIn(delay: 300.ms, duration: 300.ms)
                              .slideY(begin: 0.1, end: 0),
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

  Widget _buildHighScoreCard(int highScore) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.accent.withValues(alpha: 0.3),
            AppColors.accent.withValues(alpha: 0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppColors.accent,
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.accent.withValues(alpha: 0.3),
            blurRadius: 15,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Column(
        children: [
          const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.emoji_events_rounded,
                color: AppColors.accent,
                size: 32,
              ),
              SizedBox(width: 8),
              Text(
                'HIGH SCORE',
                style: TextStyle(
                  fontFamily: AppConfig.gameFont,
                  fontSize: 18,
                  color: AppColors.accent,
                  letterSpacing: 2,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            '$highScore',
            style: const TextStyle(
              fontFamily: AppConfig.gameFont,
              fontSize: 56,
              color: Colors.white,
              fontWeight: FontWeight.bold,
              shadows: [
                Shadow(
                  color: AppColors.accent,
                  blurRadius: 20,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsGrid(GameStateService gameState) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.1),
          width: 2,
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _buildStatTile(
                  'GAMES\nPLAYED',
                  gameState.totalGamesPlayed,
                  Icons.videogame_asset_rounded,
                  Colors.blue,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatTile(
                  'EGGS\nDROPPED',
                  gameState.totalEggsDropped,
                  Icons.egg_outlined,
                  Colors.orange,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildStatTile(
                  'TARGETS\nHIT',
                  gameState.totalTargetsHit,
                  Icons.gps_fixed_rounded,
                  Colors.green,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatTile(
                  'MAX\nCOMBO',
                  gameState.maxCombo,
                  Icons.bolt_rounded,
                  Colors.purple,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatTile(String label, int value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            color.withValues(alpha: 0.2),
            color.withValues(alpha: 0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: color.withValues(alpha: 0.3),
          width: 2,
        ),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: 8),
          Text(
            '$value',
            style: TextStyle(
              fontFamily: AppConfig.gameFont,
              fontSize: 28,
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: AppConfig.gameFont,
              fontSize: 10,
              color: Colors.grey.shade400,
              letterSpacing: 1,
              height: 1.3,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAdditionalStats(GameStateService gameState) {
    final accuracy = gameState.totalEggsDropped > 0
        ? (gameState.totalTargetsHit / gameState.totalEggsDropped * 100)
            .toStringAsFixed(1)
        : '0.0';

    final avgScore = gameState.totalGamesPlayed > 0
        ? (gameState.totalScore / gameState.totalGamesPlayed).toStringAsFixed(0)
        : '0';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.1),
          width: 2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(bottom: 12),
            child: Text(
              'PERFORMANCE',
              style: TextStyle(
                fontFamily: AppConfig.gameFont,
                fontSize: 14,
                color: Colors.grey,
                letterSpacing: 2,
              ),
            ),
          ),
          _buildStatRow('Accuracy', '$accuracy%', Icons.track_changes_rounded),
          const SizedBox(height: 8),
          _buildStatRow('Avg Score', avgScore, Icons.analytics_rounded),
          const SizedBox(height: 8),
          _buildStatRow(
            'Total Score',
            '${gameState.totalScore}',
            Icons.star_rounded,
          ),
        ],
      ),
    );
  }

  Widget _buildStatRow(String label, String value, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: Colors.grey.shade500, size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              fontFamily: AppConfig.gameFont,
              fontSize: 12,
              color: Colors.grey.shade400,
            ),
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontFamily: AppConfig.gameFont,
            fontSize: 16,
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}
