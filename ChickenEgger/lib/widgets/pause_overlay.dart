import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../config/app_config.dart';
import 'game_button.dart';

class PauseOverlay extends StatelessWidget {
  final VoidCallback onResume;
  final VoidCallback onRestart;
  final VoidCallback onExit;

  const PauseOverlay({
    super.key,
    required this.onResume,
    required this.onRestart,
    required this.onExit,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withValues(alpha: 0.7),
      child: Center(
        child: Container(
          margin: const EdgeInsets.all(32),
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
              color: AppColors.accent,
              width: 3,
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.accent.withValues(alpha: 0.3),
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
              // Pause icon
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.1),
                  border: Border.all(
                    color: AppColors.accent,
                    width: 3,
                  ),
                ),
                child: const Icon(
                  Icons.pause_rounded,
                  color: AppColors.accent,
                  size: 48,
                ),
              )
                  .animate()
                  .scale(
                    begin: const Offset(0.8, 0.8),
                    end: const Offset(1.0, 1.0),
                    duration: 300.ms,
                    curve: Curves.elasticOut,
                  ),
              const SizedBox(height: 16),
              // Title
              const Text(
                'PAUSED',
                style: TextStyle(
                  fontFamily: AppConfig.gameFont,
                  fontSize: 32,
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 4,
                  shadows: [
                    Shadow(
                      color: AppColors.accent,
                      blurRadius: 10,
                    ),
                  ],
                ),
              )
                  .animate()
                  .fadeIn(duration: 300.ms)
                  .slideY(begin: -0.2, end: 0),
              const SizedBox(height: 32),
              // Resume button
              GameButton(
                text: 'RESUME',
                icon: Icons.play_arrow_rounded,
                onPressed: onResume,
                backgroundColor: AppColors.success,
                width: 220,
              )
                  .animate()
                  .fadeIn(delay: 100.ms, duration: 300.ms)
                  .slideX(begin: -0.2, end: 0),
              const SizedBox(height: 12),
              // Restart button
              GameButton(
                text: 'RESTART',
                icon: Icons.refresh_rounded,
                onPressed: onRestart,
                backgroundColor: AppColors.buttonPrimary,
                width: 220,
              )
                  .animate()
                  .fadeIn(delay: 200.ms, duration: 300.ms)
                  .slideX(begin: -0.2, end: 0),
              const SizedBox(height: 12),
              // Exit button
              GameButton(
                text: 'EXIT',
                icon: Icons.exit_to_app_rounded,
                onPressed: onExit,
                backgroundColor: AppColors.error,
                width: 220,
              )
                  .animate()
                  .fadeIn(delay: 300.ms, duration: 300.ms)
                  .slideX(begin: -0.2, end: 0),
            ],
          ),
        )
            .animate()
            .scale(
              begin: const Offset(0.9, 0.9),
              end: const Offset(1.0, 1.0),
              duration: 300.ms,
              curve: Curves.easeOutBack,
            )
            .fadeIn(duration: 200.ms),
      ),
    );
  }
}
