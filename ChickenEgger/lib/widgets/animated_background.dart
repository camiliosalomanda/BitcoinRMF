import 'dart:math';
import 'package:flutter/material.dart';
import '../config/app_config.dart';

class AnimatedBackground extends StatefulWidget {
  final Widget? child;
  final bool animate;

  const AnimatedBackground({
    super.key,
    this.child,
    this.animate = true,
  });

  @override
  State<AnimatedBackground> createState() => _AnimatedBackgroundState();
}

class _AnimatedBackgroundState extends State<AnimatedBackground>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late AnimationController _cloudController;
  final List<_Cloud> _clouds = [];
  final Random _random = Random();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    );

    _cloudController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 30),
    );

    if (widget.animate) {
      _controller.repeat();
      _cloudController.repeat();
    }

    // Generate clouds
    for (int i = 0; i < 5; i++) {
      _clouds.add(_Cloud(
        x: _random.nextDouble(),
        y: _random.nextDouble() * 0.4,
        scale: 0.5 + _random.nextDouble() * 0.5,
        speed: 0.02 + _random.nextDouble() * 0.03,
      ));
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _cloudController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Sky gradient
        AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    _lerpColor(
                      AppColors.skyGradientTop,
                      AppColors.skyGradientTop.withValues(alpha: 0.8),
                      (sin(_controller.value * 2 * pi) + 1) / 2,
                    ),
                    AppColors.skyGradientBottom,
                    const Color(0xFF90EE90), // Light green for grass hint
                  ],
                  stops: const [0.0, 0.7, 1.0],
                ),
              ),
            );
          },
        ),
        // Sun
        Positioned(
          top: 60,
          right: 40,
          child: AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return Transform.scale(
                scale: 1.0 + 0.05 * sin(_controller.value * 2 * pi),
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        Colors.yellow.shade200,
                        Colors.yellow.shade400,
                        Colors.orange.shade300,
                      ],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.yellow.withValues(alpha: 0.5),
                        blurRadius: 30,
                        spreadRadius: 10,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        // Animated clouds
        AnimatedBuilder(
          animation: _cloudController,
          builder: (context, child) {
            return CustomPaint(
              size: Size.infinite,
              painter: _CloudPainter(
                clouds: _clouds,
                progress: _cloudController.value,
              ),
            );
          },
        ),
        // Hills silhouette
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          child: CustomPaint(
            size: Size(MediaQuery.of(context).size.width, 150),
            painter: _HillsPainter(),
          ),
        ),
        // Content (if provided)
        if (widget.child != null) widget.child!,
      ],
    );
  }

  Color _lerpColor(Color a, Color b, double t) {
    return Color.lerp(a, b, t) ?? a;
  }
}

class _Cloud {
  double x;
  double y;
  double scale;
  double speed;

  _Cloud({
    required this.x,
    required this.y,
    required this.scale,
    required this.speed,
  });
}

class _CloudPainter extends CustomPainter {
  final List<_Cloud> clouds;
  final double progress;

  _CloudPainter({
    required this.clouds,
    required this.progress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.8)
      ..style = PaintingStyle.fill;

    for (final cloud in clouds) {
      final x = ((cloud.x + progress * cloud.speed) % 1.2 - 0.1) * size.width;
      final y = cloud.y * size.height;

      _drawCloud(canvas, Offset(x, y), cloud.scale * 60, paint);
    }
  }

  void _drawCloud(Canvas canvas, Offset center, double baseSize, Paint paint) {
    // Main body
    canvas.drawCircle(center, baseSize, paint);
    // Left bump
    canvas.drawCircle(
      center + Offset(-baseSize * 0.7, baseSize * 0.1),
      baseSize * 0.7,
      paint,
    );
    // Right bump
    canvas.drawCircle(
      center + Offset(baseSize * 0.7, baseSize * 0.15),
      baseSize * 0.6,
      paint,
    );
    // Top bump
    canvas.drawCircle(
      center + Offset(baseSize * 0.2, -baseSize * 0.4),
      baseSize * 0.5,
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant _CloudPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}

class _HillsPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Back hill (darker)
    final backHillPaint = Paint()
      ..color = const Color(0xFF228B22).withValues(alpha: 0.6)
      ..style = PaintingStyle.fill;

    final backHillPath = Path()
      ..moveTo(0, size.height)
      ..quadraticBezierTo(
        size.width * 0.25,
        size.height * 0.3,
        size.width * 0.5,
        size.height * 0.6,
      )
      ..quadraticBezierTo(
        size.width * 0.75,
        size.height * 0.4,
        size.width,
        size.height * 0.5,
      )
      ..lineTo(size.width, size.height)
      ..close();

    canvas.drawPath(backHillPath, backHillPaint);

    // Front hill (lighter)
    final frontHillPaint = Paint()
      ..color = const Color(0xFF32CD32).withValues(alpha: 0.8)
      ..style = PaintingStyle.fill;

    final frontHillPath = Path()
      ..moveTo(0, size.height)
      ..quadraticBezierTo(
        size.width * 0.3,
        size.height * 0.5,
        size.width * 0.6,
        size.height * 0.7,
      )
      ..quadraticBezierTo(
        size.width * 0.85,
        size.height * 0.5,
        size.width,
        size.height * 0.8,
      )
      ..lineTo(size.width, size.height)
      ..close();

    canvas.drawPath(frontHillPath, frontHillPaint);

    // Grass at bottom
    final grassPaint = Paint()
      ..color = const Color(0xFF228B22)
      ..style = PaintingStyle.fill;

    canvas.drawRect(
      Rect.fromLTWH(0, size.height * 0.85, size.width, size.height * 0.15),
      grassPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Simple gradient background without animation
class SimpleGradientBackground extends StatelessWidget {
  final Widget? child;
  final List<Color>? colors;

  const SimpleGradientBackground({
    super.key,
    this.child,
    this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: colors ??
              [
                AppColors.primary,
                AppColors.primaryDark,
              ],
        ),
      ),
      child: child,
    );
  }
}
