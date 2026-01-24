import 'package:flame/components.dart';
import 'package:flutter/material.dart';

class GameBackground extends PositionComponent with HasGameRef {
  @override
  Future<void> onLoad() async {
    await super.onLoad();
    size = gameRef.size;
  }
  
  @override
  void render(Canvas canvas) {
    super.render(canvas);
    
    // Sky gradient
    const skyGradient = LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [
        Color(0xFF1E90FF), // Dodger blue at top
        Color(0xFF87CEEB), // Sky blue
        Color(0xFFB0E2FF), // Light sky blue at horizon
      ],
      stops: [0.0, 0.6, 1.0],
    );
    
    final skyRect = Rect.fromLTWH(0, 0, size.x, size.y * 0.75);
    final skyPaint = Paint()
      ..shader = skyGradient.createShader(skyRect);
    
    canvas.drawRect(skyRect, skyPaint);
    
    // Sun
    _renderSun(canvas);
    
    // Distant hills
    _renderHills(canvas);
  }
  
  void _renderSun(Canvas canvas) {
    final sunCenter = Offset(size.x * 0.85, size.y * 0.12);
    
    // Sun glow
    final glowGradient = RadialGradient(
      colors: [
        const Color(0xFFFFEB3B).withOpacity(0.6),
        const Color(0xFFFFEB3B).withOpacity(0.0),
      ],
    );
    
    final glowPaint = Paint()
      ..shader = glowGradient.createShader(
        Rect.fromCircle(center: sunCenter, radius: 60),
      );
    
    canvas.drawCircle(sunCenter, 60, glowPaint);
    
    // Sun body
    canvas.drawCircle(
      sunCenter,
      30,
      Paint()..color = const Color(0xFFFFEB3B),
    );
    
    // Sun highlight
    canvas.drawCircle(
      Offset(sunCenter.dx - 8, sunCenter.dy - 8),
      8,
      Paint()..color = const Color(0xFFFFF9C4),
    );
  }
  
  void _renderHills(Canvas canvas) {
    // Distant hills (darker)
    final hill1Path = Path();
    hill1Path.moveTo(0, size.y * 0.65);
    hill1Path.quadraticBezierTo(
      size.x * 0.15, size.y * 0.55,
      size.x * 0.35, size.y * 0.62,
    );
    hill1Path.quadraticBezierTo(
      size.x * 0.5, size.y * 0.68,
      size.x * 0.7, size.y * 0.58,
    );
    hill1Path.quadraticBezierTo(
      size.x * 0.85, size.y * 0.52,
      size.x, size.y * 0.6,
    );
    hill1Path.lineTo(size.x, size.y * 0.75);
    hill1Path.lineTo(0, size.y * 0.75);
    hill1Path.close();
    
    canvas.drawPath(
      hill1Path,
      Paint()..color = const Color(0xFF66BB6A).withOpacity(0.6),
    );
    
    // Closer hills (lighter)
    final hill2Path = Path();
    hill2Path.moveTo(0, size.y * 0.68);
    hill2Path.quadraticBezierTo(
      size.x * 0.2, size.y * 0.72,
      size.x * 0.4, size.y * 0.66,
    );
    hill2Path.quadraticBezierTo(
      size.x * 0.6, size.y * 0.60,
      size.x * 0.8, size.y * 0.68,
    );
    hill2Path.quadraticBezierTo(
      size.x * 0.95, size.y * 0.73,
      size.x, size.y * 0.7,
    );
    hill2Path.lineTo(size.x, size.y * 0.75);
    hill2Path.lineTo(0, size.y * 0.75);
    hill2Path.close();
    
    canvas.drawPath(
      hill2Path,
      Paint()..color = const Color(0xFF81C784).withOpacity(0.7),
    );
  }
}
