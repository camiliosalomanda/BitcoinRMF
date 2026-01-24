import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../config/app_config.dart';
import 'game_button.dart';

class GameHUD extends StatelessWidget {
  final int score;
  final int combo;
  final int eggsDropped;
  final VoidCallback onPause;

  const GameHUD({
    super.key,
    required this.score,
    required this.combo,
    required this.eggsDropped,
    required this.onPause,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Score panel
                _buildScorePanel(),
                // Pause button
                GameIconButton(
                  icon: Icons.pause_rounded,
                  onPressed: onPause,
                  backgroundColor: AppColors.buttonSecondary,
                  size: 44,
                ),
              ],
            ),
            const SizedBox(height: 8),
            // Combo indicator
            if (combo > 1) _buildComboIndicator(),
          ],
        ),
      ),
    );
  }

  Widget _buildScorePanel() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.black.withValues(alpha: 0.7),
            Colors.black.withValues(alpha: 0.5),
          ],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.accent.withValues(alpha: 0.5),
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Score
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.star_rounded,
                color: AppColors.accent,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                '$score',
                style: const TextStyle(
                  fontFamily: AppConfig.gameFont,
                  fontSize: 24,
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  shadows: [
                    Shadow(
                      color: AppColors.accent,
                      blurRadius: 8,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          // Eggs dropped counter
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 16,
                height: 20,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey.shade300),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                '$eggsDropped',
                style: TextStyle(
                  fontFamily: AppConfig.gameFont,
                  fontSize: 14,
                  color: Colors.grey.shade300,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildComboIndicator() {
    Color comboColor;
    String comboText;
    
    if (combo >= 10) {
      comboColor = Colors.purple;
      comboText = 'MEGA COMBO!';
    } else if (combo >= 5) {
      comboColor = Colors.orange;
      comboText = 'SUPER COMBO!';
    } else {
      comboColor = AppColors.accent;
      comboText = 'COMBO x$combo';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            comboColor.withValues(alpha: 0.8),
            comboColor,
            comboColor.withValues(alpha: 0.8),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.5),
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: comboColor.withValues(alpha: 0.5),
            blurRadius: 12,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Text(
        comboText,
        style: const TextStyle(
          fontFamily: AppConfig.gameFont,
          fontSize: 14,
          color: Colors.white,
          fontWeight: FontWeight.bold,
          letterSpacing: 2,
        ),
      ),
    )
        .animate(onPlay: (controller) => controller.repeat())
        .shimmer(
          duration: 1000.ms,
          color: Colors.white.withValues(alpha: 0.3),
        )
        .scale(
          begin: const Offset(1.0, 1.0),
          end: const Offset(1.05, 1.05),
          duration: 500.ms,
        )
        .then()
        .scale(
          begin: const Offset(1.05, 1.05),
          end: const Offset(1.0, 1.0),
          duration: 500.ms,
        );
  }
}

class MiniScoreDisplay extends StatelessWidget {
  final String label;
  final int value;
  final IconData icon;
  final Color color;

  const MiniScoreDisplay({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 4),
        Text(
          '$value',
          style: TextStyle(
            fontFamily: AppConfig.gameFont,
            fontSize: 18,
            color: color,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontFamily: AppConfig.gameFont,
            fontSize: 10,
            color: color.withValues(alpha: 0.7),
          ),
        ),
      ],
    );
  }
}
