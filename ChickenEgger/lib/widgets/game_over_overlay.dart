import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../config/app_config.dart';
import 'game_button.dart';

class GameOverOverlay extends StatelessWidget {
  final int score;
  final int highScore;
  final int eggsDropped;
  final int targetsHit;
  final int maxCombo;
  final bool isNewHighScore;
  final VoidCallback onRestart;
  final VoidCallback onExit;
  final VoidCallback? onWatchAd;

  const GameOverOverlay({
    super.key,
    required this.score,
    this.highScore = 0,
    this.eggsDropped = 0,
    this.targetsHit = 0,
    this.maxCombo = 0,
    required this.isNewHighScore,
    required this.onRestart,
    required this.onExit,
    this.onWatchAd,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withValues(alpha: 0.8),
      child: Center(
        child: SingleChildScrollView(
          child: Container(
            margin: const EdgeInsets.all(24),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  AppColors.primary.withValues(alpha: 0.95),
                  AppColors.primaryDark.withValues(alpha: 0.95),
                ],
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: isNewHighScore ? AppColors.accent : AppColors.error,
                width: 3,
              ),
              boxShadow: [
                BoxShadow(
                  color: (isNewHighScore ? AppColors.accent : AppColors.error)
                      .withValues(alpha: 0.3),
                  blurRadius: 20,
                  spreadRadius: 5,
                ),
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.5),
                  blurRadius: 30,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Game Over or New High Score title
                if (isNewHighScore) _buildNewHighScoreHeader() else _buildGameOverHeader(),
                const SizedBox(height: 24),
                // Score display
                _buildScoreDisplay(),
                const SizedBox(height: 20),
                // Stats
                _buildStatsRow(),
                const SizedBox(height: 24),
                // High score
                _buildHighScoreDisplay(),
                const SizedBox(height: 24),
                // Watch ad for bonus (optional)
                if (onWatchAd != null) ...[
                  GameButton(
                    text: 'WATCH AD +50',
                    icon: Icons.play_circle_outline,
                    onPressed: onWatchAd!,
                    backgroundColor: Colors.purple,
                    width: 220,
                  )
                      .animate()
                      .fadeIn(delay: 400.ms, duration: 300.ms)
                      .shimmer(
                        delay: 1000.ms,
                        duration: 1500.ms,
                        color: Colors.white.withValues(alpha: 0.3),
                      ),
                  const SizedBox(height: 12),
                ],
                // Restart button
                GameButton(
                  text: 'PLAY AGAIN',
                  icon: Icons.refresh_rounded,
                  onPressed: onRestart,
                  backgroundColor: AppColors.success,
                  width: 220,
                )
                    .animate()
                    .fadeIn(delay: 500.ms, duration: 300.ms)
                    .slideY(begin: 0.2, end: 0),
                const SizedBox(height: 12),
                // Exit button
                GameButton(
                  text: 'MAIN MENU',
                  icon: Icons.home_rounded,
                  onPressed: onExit,
                  backgroundColor: AppColors.buttonSecondary,
                  width: 220,
                )
                    .animate()
                    .fadeIn(delay: 600.ms, duration: 300.ms)
                    .slideY(begin: 0.2, end: 0),
              ],
            ),
          )
              .animate()
              .scale(
                begin: const Offset(0.8, 0.8),
                end: const Offset(1.0, 1.0),
                duration: 400.ms,
                curve: Curves.easeOutBack,
              )
              .fadeIn(duration: 300.ms),
        ),
      ),
    );
  }

  Widget _buildGameOverHeader() {
    return Column(
      children: [
        // Broken egg icon
        Stack(
          alignment: Alignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.error.withValues(alpha: 0.2),
                border: Border.all(
                  color: AppColors.error,
                  width: 3,
                ),
              ),
              child: const Text(
                '🍳',
                style: TextStyle(fontSize: 40),
              ),
            ),
          ],
        )
            .animate()
            .shake(duration: 500.ms)
            .then()
            .scale(
              begin: const Offset(1.1, 1.1),
              end: const Offset(1.0, 1.0),
              duration: 200.ms,
            ),
        const SizedBox(height: 12),
        const Text(
          'GAME OVER',
          style: TextStyle(
            fontFamily: AppConfig.gameFont,
            fontSize: 28,
            color: AppColors.error,
            fontWeight: FontWeight.bold,
            letterSpacing: 4,
          ),
        )
            .animate()
            .fadeIn(delay: 200.ms, duration: 300.ms),
      ],
    );
  }

  Widget _buildNewHighScoreHeader() {
    return Column(
      children: [
        // Trophy icon
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(
              colors: [
                AppColors.accent.withValues(alpha: 0.3),
                AppColors.accent.withValues(alpha: 0.1),
              ],
            ),
            border: Border.all(
              color: AppColors.accent,
              width: 3,
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.accent.withValues(alpha: 0.5),
                blurRadius: 20,
                spreadRadius: 5,
              ),
            ],
          ),
          child: const Text(
            '🏆',
            style: TextStyle(fontSize: 48),
          ),
        )
            .animate(onPlay: (controller) => controller.repeat())
            .shimmer(
              duration: 1500.ms,
              color: Colors.white.withValues(alpha: 0.3),
            ),
        const SizedBox(height: 12),
        const Text(
          'NEW HIGH SCORE!',
          style: TextStyle(
            fontFamily: AppConfig.gameFont,
            fontSize: 24,
            color: AppColors.accent,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
          ),
        )
            .animate()
            .fadeIn(duration: 300.ms)
            .scale(
              begin: const Offset(0.8, 0.8),
              end: const Offset(1.0, 1.0),
              duration: 300.ms,
              curve: Curves.elasticOut,
            ),
      ],
    );
  }

  Widget _buildScoreDisplay() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isNewHighScore
              ? AppColors.accent.withValues(alpha: 0.5)
              : Colors.white.withValues(alpha: 0.2),
          width: 2,
        ),
      ),
      child: Column(
        children: [
          const Text(
            'SCORE',
            style: TextStyle(
              fontFamily: AppConfig.gameFont,
              fontSize: 14,
              color: Colors.grey,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '$score',
            style: TextStyle(
              fontFamily: AppConfig.gameFont,
              fontSize: 48,
              color: isNewHighScore ? AppColors.accent : Colors.white,
              fontWeight: FontWeight.bold,
              shadows: isNewHighScore
                  ? [
                      const Shadow(
                        color: AppColors.accent,
                        blurRadius: 20,
                      ),
                    ]
                  : null,
            ),
          )
              .animate()
              .fadeIn(delay: 300.ms, duration: 300.ms)
              .scale(
                begin: const Offset(0.5, 0.5),
                end: const Offset(1.0, 1.0),
                duration: 400.ms,
                curve: Curves.elasticOut,
              ),
        ],
      ),
    );
  }

  Widget _buildStatsRow() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _buildStatItem('EGGS', eggsDropped, Icons.egg_outlined),
        _buildStatItem('HITS', targetsHit, Icons.gps_fixed_rounded),
        _buildStatItem('COMBO', maxCombo, Icons.bolt_rounded),
      ],
    );
  }

  Widget _buildStatItem(String label, int value, IconData icon) {
    return Column(
      children: [
        Icon(
          icon,
          color: Colors.grey.shade400,
          size: 24,
        ),
        const SizedBox(height: 4),
        Text(
          '$value',
          style: const TextStyle(
            fontFamily: AppConfig.gameFont,
            fontSize: 20,
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontFamily: AppConfig.gameFont,
            fontSize: 10,
            color: Colors.grey.shade500,
            letterSpacing: 1,
          ),
        ),
      ],
    );
  }

  Widget _buildHighScoreDisplay() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(
          Icons.workspace_premium_rounded,
          color: AppColors.accent,
          size: 20,
        ),
        const SizedBox(width: 8),
        Text(
          'BEST: $highScore',
          style: const TextStyle(
            fontFamily: AppConfig.gameFont,
            fontSize: 16,
            color: AppColors.accent,
            letterSpacing: 1,
          ),
        ),
      ],
    );
  }
}
