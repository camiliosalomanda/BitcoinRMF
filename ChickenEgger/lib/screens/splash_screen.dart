import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../config/app_config.dart';
import 'main_menu_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToMenu();
  }

  Future<void> _navigateToMenu() async {
    await Future.delayed(const Duration(milliseconds: 2500));
    if (mounted) {
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) =>
              const MainMenuScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(
              opacity: animation,
              child: child,
            );
          },
          transitionDuration: const Duration(milliseconds: 500),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF1E90FF),
              Color(0xFF87CEEB),
            ],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Animated chicken icon
              _buildChickenIcon()
                  .animate()
                  .fadeIn(duration: 500.ms)
                  .scale(delay: 200.ms, duration: 500.ms)
                  .then()
                  .shake(hz: 3, rotation: 0.05),
              const SizedBox(height: 30),
              // Game title
              Text(
                'EGG DROP',
                style: TextStyle(
                  fontFamily: 'GameFont',
                  fontSize: 36,
                  color: Colors.white,
                  shadows: [
                    Shadow(
                      blurRadius: 10,
                      color: Colors.black.withOpacity(0.5),
                      offset: const Offset(3, 3),
                    ),
                  ],
                ),
              )
                  .animate()
                  .fadeIn(delay: 300.ms, duration: 500.ms)
                  .slideY(begin: -0.3, end: 0),
              Text(
                'CHAOS',
                style: TextStyle(
                  fontFamily: 'GameFont',
                  fontSize: 48,
                  color: AppConfig.accentColor,
                  shadows: [
                    Shadow(
                      blurRadius: 10,
                      color: Colors.black.withOpacity(0.5),
                      offset: const Offset(3, 3),
                    ),
                  ],
                ),
              )
                  .animate()
                  .fadeIn(delay: 500.ms, duration: 500.ms)
                  .slideY(begin: 0.3, end: 0),
              const SizedBox(height: 50),
              // Loading indicator
              const SizedBox(
                width: 40,
                height: 40,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 3,
                ),
              ).animate().fadeIn(delay: 800.ms, duration: 500.ms),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildChickenIcon() {
    return Container(
      width: 120,
      height: 120,
      decoration: BoxDecoration(
        color: AppConfig.primaryColor,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            blurRadius: 20,
            color: Colors.black.withOpacity(0.3),
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Center(
        child: CustomPaint(
          size: const Size(80, 70),
          painter: _ChickenIconPainter(),
        ),
      ),
    );
  }
}

class _ChickenIconPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final bodyPaint = Paint()..color = const Color(0xFFFFA500);
    final wingPaint = Paint()..color = const Color(0xFFFF8C00);
    final beakPaint = Paint()..color = const Color(0xFFFFD700);
    final eyePaint = Paint()..color = Colors.black;
    final combPaint = Paint()..color = const Color(0xFFFF0000);
    
    // Body
    canvas.drawOval(
      Rect.fromCenter(
        center: Offset(size.width * 0.45, size.height * 0.55),
        width: size.width * 0.6,
        height: size.height * 0.5,
      ),
      bodyPaint,
    );
    
    // Head
    canvas.drawCircle(
      Offset(size.width * 0.7, size.height * 0.35),
      size.width * 0.2,
      bodyPaint,
    );
    
    // Comb
    final combPath = Path();
    combPath.moveTo(size.width * 0.6, size.height * 0.18);
    combPath.lineTo(size.width * 0.65, size.height * 0.05);
    combPath.lineTo(size.width * 0.72, size.height * 0.15);
    combPath.lineTo(size.width * 0.78, size.height * 0.02);
    combPath.lineTo(size.width * 0.85, size.height * 0.18);
    combPath.close();
    canvas.drawPath(combPath, combPaint);
    
    // Wing
    final wingPath = Path();
    wingPath.moveTo(size.width * 0.35, size.height * 0.45);
    wingPath.quadraticBezierTo(
      size.width * 0.1, size.height * 0.35,
      size.width * 0.15, size.height * 0.6,
    );
    wingPath.quadraticBezierTo(
      size.width * 0.2, size.height * 0.7,
      size.width * 0.35, size.height * 0.65,
    );
    canvas.drawPath(wingPath, wingPaint);
    
    // Eye
    canvas.drawCircle(
      Offset(size.width * 0.75, size.height * 0.32),
      5,
      eyePaint,
    );
    canvas.drawCircle(
      Offset(size.width * 0.77, size.height * 0.3),
      2,
      Paint()..color = Colors.white,
    );
    
    // Beak
    final beakPath = Path();
    beakPath.moveTo(size.width * 0.85, size.height * 0.35);
    beakPath.lineTo(size.width * 0.98, size.height * 0.4);
    beakPath.lineTo(size.width * 0.85, size.height * 0.45);
    beakPath.close();
    canvas.drawPath(beakPath, beakPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
