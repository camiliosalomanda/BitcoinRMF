import 'dart:math';
import 'package:flame/components.dart';
import 'package:flutter/material.dart';
import '../../config/app_config.dart';

class Target extends PositionComponent {
  final String targetType;
  double gameSpeed;
  bool isHit = false;
  double _hitAnimationTimer = 0;
  final Color _color;
  
  static final Random _random = Random();
  
  Target({
    required this.targetType,
    required Vector2 position,
    required this.gameSpeed,
  }) : _color = _getRandomColor(targetType),
       super(
         position: position,
         size: Vector2(
           AppConfig.targetSizes[targetType]![0],
           AppConfig.targetSizes[targetType]![1],
         ),
         anchor: Anchor.bottomLeft,
       );
  
  static Color _getRandomColor(String type) {
    final colors = {
      'car': [
        const Color(0xFFE53935), // Red
        const Color(0xFF1E88E5), // Blue
        const Color(0xFF43A047), // Green
        const Color(0xFFFFB300), // Amber
        const Color(0xFF8E24AA), // Purple
        const Color(0xFF00ACC1), // Cyan
      ],
      'mailbox': [
        const Color(0xFF1565C0), // Blue
        const Color(0xFF2E7D32), // Green
        const Color(0xFFD32F2F), // Red
      ],
      'trashcan': [
        const Color(0xFF424242), // Grey
        const Color(0xFF1B5E20), // Dark green
        const Color(0xFF0D47A1), // Dark blue
      ],
      'bicycle': [
        const Color(0xFFE53935),
        const Color(0xFF1565C0),
        const Color(0xFFFFB300),
      ],
      'doghouse': [
        const Color(0xFF6D4C41), // Brown
        const Color(0xFF8D6E63), // Light brown
        const Color(0xFF5D4037), // Dark brown
      ],
      'gnome': [
        const Color(0xFFD32F2F), // Red hat
      ],
      'flamingo': [
        const Color(0xFFEC407A), // Pink
      ],
    };
    
    final typeColors = colors[type] ?? [Colors.grey];
    return typeColors[_random.nextInt(typeColors.length)];
  }
  
  void hit() {
    isHit = true;
    _hitAnimationTimer = 0;
  }
  
  @override
  void update(double dt) {
    super.update(dt);
    
    // Move left
    position.x -= gameSpeed * dt;
    
    // Hit animation
    if (isHit) {
      _hitAnimationTimer += dt;
    }
  }
  
  @override
  void render(Canvas canvas) {
    super.render(canvas);
    
    // Apply hit effect
    if (isHit) {
      final opacity = (1 - _hitAnimationTimer * 2).clamp(0.0, 1.0);
      canvas.saveLayer(
        Rect.fromLTWH(0, 0, size.x, size.y + 20),
        Paint()..color = Colors.white.withOpacity(opacity),
      );
    }
    
    switch (targetType) {
      case 'car':
        _renderCar(canvas);
        break;
      case 'mailbox':
        _renderMailbox(canvas);
        break;
      case 'trashcan':
        _renderTrashcan(canvas);
        break;
      case 'bicycle':
        _renderBicycle(canvas);
        break;
      case 'doghouse':
        _renderDoghouse(canvas);
        break;
      case 'gnome':
        _renderGnome(canvas);
        break;
      case 'flamingo':
        _renderFlamingo(canvas);
        break;
    }
    
    // Egg splat if hit
    if (isHit) {
      _renderEggSplat(canvas);
      canvas.restore();
    }
  }
  
  void _renderCar(Canvas canvas) {
    final paint = Paint()..color = _color;
    final darkPaint = Paint()..color = _darken(_color, 0.2);
    final windowPaint = Paint()..color = const Color(0xFF90CAF9);
    final wheelPaint = Paint()..color = const Color(0xFF212121);
    final chromePaint = Paint()..color = const Color(0xFFE0E0E0);
    
    // Car body
    final bodyPath = Path();
    bodyPath.moveTo(5, size.y - 15);
    bodyPath.lineTo(5, size.y - 25);
    bodyPath.lineTo(15, size.y - 35);
    bodyPath.lineTo(55, size.y - 35);
    bodyPath.lineTo(70, size.y - 25);
    bodyPath.lineTo(75, size.y - 15);
    bodyPath.close();
    canvas.drawPath(bodyPath, paint);
    
    // Lower body
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(2, size.y - 18, size.x - 4, 12),
        const Radius.circular(3),
      ),
      darkPaint,
    );
    
    // Windows
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(18, size.y - 33, 18, 12),
        const Radius.circular(2),
      ),
      windowPaint,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(40, size.y - 33, 18, 12),
        const Radius.circular(2),
      ),
      windowPaint,
    );
    
    // Wheels
    canvas.drawCircle(Offset(18, size.y - 5), 8, wheelPaint);
    canvas.drawCircle(Offset(18, size.y - 5), 4, chromePaint);
    canvas.drawCircle(Offset(62, size.y - 5), 8, wheelPaint);
    canvas.drawCircle(Offset(62, size.y - 5), 4, chromePaint);
    
    // Headlights
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(72, size.y - 22, 4, 5),
        const Radius.circular(1),
      ),
      Paint()..color = const Color(0xFFFFEB3B),
    );
    
    // Taillights
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(2, size.y - 22, 4, 5),
        const Radius.circular(1),
      ),
      Paint()..color = const Color(0xFFD32F2F),
    );
  }
  
  void _renderMailbox(Canvas canvas) {
    final paint = Paint()..color = _color;
    final postPaint = Paint()..color = const Color(0xFF5D4037);
    final flagPaint = Paint()..color = const Color(0xFFD32F2F);
    
    // Post
    canvas.drawRect(
      Rect.fromLTWH(size.x / 2 - 3, size.y - 35, 6, 35),
      postPaint,
    );
    
    // Mailbox body
    final boxPath = Path();
    boxPath.addRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(0, size.y - 50, size.x, 18),
        const Radius.circular(8),
      ),
    );
    canvas.drawPath(boxPath, paint);
    
    // Door
    canvas.drawArc(
      Rect.fromLTWH(size.x - 12, size.y - 50, 12, 18),
      -pi / 2,
      pi,
      true,
      Paint()..color = _darken(_color, 0.15),
    );
    
    // Flag
    final flagPath = Path();
    flagPath.moveTo(2, size.y - 50);
    flagPath.lineTo(2, size.y - 58);
    flagPath.lineTo(10, size.y - 54);
    flagPath.close();
    canvas.drawPath(flagPath, flagPaint);
  }
  
  void _renderTrashcan(Canvas canvas) {
    final paint = Paint()..color = _color;
    final darkPaint = Paint()..color = _darken(_color, 0.2);
    final lidPaint = Paint()..color = _darken(_color, 0.1);
    
    // Body
    final bodyPath = Path();
    bodyPath.moveTo(3, size.y);
    bodyPath.lineTo(5, size.y - 35);
    bodyPath.lineTo(30, size.y - 35);
    bodyPath.lineTo(32, size.y);
    bodyPath.close();
    canvas.drawPath(bodyPath, paint);
    
    // Lid
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(2, size.y - 42, 31, 8),
        const Radius.circular(3),
      ),
      lidPaint,
    );
    
    // Handle
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(13, size.y - 47, 9, 6),
        const Radius.circular(2),
      ),
      darkPaint,
    );
    
    // Lines on body
    final linePaint = Paint()
      ..color = _darken(_color, 0.15)
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;
    canvas.drawLine(
      Offset(10, size.y - 32),
      Offset(8, size.y - 5),
      linePaint,
    );
    canvas.drawLine(
      Offset(17.5, size.y - 32),
      Offset(17.5, size.y - 5),
      linePaint,
    );
    canvas.drawLine(
      Offset(25, size.y - 32),
      Offset(27, size.y - 5),
      linePaint,
    );
  }
  
  void _renderBicycle(Canvas canvas) {
    final framePaint = Paint()
      ..color = _color
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;
    final wheelPaint = Paint()
      ..color = const Color(0xFF212121)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;
    final seatPaint = Paint()..color = const Color(0xFF5D4037);
    final spokePaint = Paint()
      ..color = const Color(0xFF9E9E9E)
      ..strokeWidth = 1;
    
    // Wheels
    canvas.drawCircle(Offset(12, size.y - 12), 10, wheelPaint);
    canvas.drawCircle(Offset(38, size.y - 12), 10, wheelPaint);
    
    // Spokes
    for (int i = 0; i < 8; i++) {
      final angle = i * pi / 4;
      canvas.drawLine(
        Offset(12, size.y - 12),
        Offset(12 + cos(angle) * 8, size.y - 12 + sin(angle) * 8),
        spokePaint,
      );
      canvas.drawLine(
        Offset(38, size.y - 12),
        Offset(38 + cos(angle) * 8, size.y - 12 + sin(angle) * 8),
        spokePaint,
      );
    }
    
    // Frame
    canvas.drawLine(Offset(12, size.y - 12), Offset(25, size.y - 28), framePaint);
    canvas.drawLine(Offset(25, size.y - 28), Offset(38, size.y - 12), framePaint);
    canvas.drawLine(Offset(25, size.y - 28), Offset(25, size.y - 12), framePaint);
    canvas.drawLine(Offset(12, size.y - 12), Offset(25, size.y - 12), framePaint);
    
    // Handlebar
    canvas.drawLine(Offset(36, size.y - 30), Offset(42, size.y - 35), framePaint);
    canvas.drawLine(Offset(40, size.y - 35), Offset(45, size.y - 32), framePaint);
    
    // Seat
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(20, size.y - 38, 12, 4),
        const Radius.circular(2),
      ),
      seatPaint,
    );
    canvas.drawLine(Offset(25, size.y - 34), Offset(25, size.y - 28), framePaint);
  }
  
  void _renderDoghouse(Canvas canvas) {
    final woodPaint = Paint()..color = _color;
    final roofPaint = Paint()..color = _darken(_color, 0.3);
    final holePaint = Paint()..color = const Color(0xFF212121);
    
    // Base
    canvas.drawRect(
      Rect.fromLTWH(0, size.y - 35, size.x, 35),
      woodPaint,
    );
    
    // Roof
    final roofPath = Path();
    roofPath.moveTo(-3, size.y - 35);
    roofPath.lineTo(size.x / 2, size.y - 50);
    roofPath.lineTo(size.x + 3, size.y - 35);
    roofPath.close();
    canvas.drawPath(roofPath, roofPaint);
    
    // Entrance hole
    canvas.drawArc(
      Rect.fromLTWH(size.x / 2 - 12, size.y - 30, 24, 30),
      pi,
      pi,
      true,
      holePaint,
    );
    
    // Wood grain lines
    final grainPaint = Paint()
      ..color = _darken(_color, 0.1)
      ..strokeWidth = 1;
    canvas.drawLine(Offset(5, size.y - 30), Offset(5, size.y - 5), grainPaint);
    canvas.drawLine(Offset(size.x - 5, size.y - 30), Offset(size.x - 5, size.y - 5), grainPaint);
  }
  
  void _renderGnome(Canvas canvas) {
    final hatPaint = Paint()..color = const Color(0xFFD32F2F);
    final facePaint = Paint()..color = const Color(0xFFFFCCBC);
    final beardPaint = Paint()..color = const Color(0xFFFFFFFF);
    final bodyPaint = Paint()..color = const Color(0xFF1565C0);
    
    // Body
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(3, size.y - 22, 19, 22),
        const Radius.circular(5),
      ),
      bodyPaint,
    );
    
    // Face
    canvas.drawCircle(Offset(size.x / 2, size.y - 30), 8, facePaint);
    
    // Beard
    final beardPath = Path();
    beardPath.moveTo(5, size.y - 28);
    beardPath.quadraticBezierTo(size.x / 2, size.y - 10, 20, size.y - 28);
    beardPath.close();
    canvas.drawPath(beardPath, beardPaint);
    
    // Hat
    final hatPath = Path();
    hatPath.moveTo(3, size.y - 28);
    hatPath.lineTo(size.x / 2, size.y - 50);
    hatPath.lineTo(22, size.y - 28);
    hatPath.close();
    canvas.drawPath(hatPath, hatPaint);
    
    // Eyes
    canvas.drawCircle(Offset(9, size.y - 32), 2, Paint()..color = Colors.black);
    canvas.drawCircle(Offset(16, size.y - 32), 2, Paint()..color = Colors.black);
    
    // Nose
    canvas.drawCircle(Offset(size.x / 2, size.y - 28), 3, Paint()..color = const Color(0xFFFFAB91));
  }
  
  void _renderFlamingo(Canvas canvas) {
    final bodyPaint = Paint()..color = const Color(0xFFEC407A);
    final legPaint = Paint()
      ..color = const Color(0xFFEC407A)
      ..strokeWidth = 2;
    final beakPaint = Paint()..color = const Color(0xFF212121);
    
    // Legs
    canvas.drawLine(Offset(10, size.y - 20), Offset(10, size.y), legPaint);
    canvas.drawLine(Offset(10, size.y - 35), Offset(10, size.y - 20), legPaint);
    
    // Body
    canvas.drawOval(
      Rect.fromCenter(
        center: Offset(12, size.y - 40),
        width: 14,
        height: 12,
      ),
      bodyPaint,
    );
    
    // Neck
    final neckPath = Path();
    neckPath.moveTo(14, size.y - 45);
    neckPath.quadraticBezierTo(20, size.y - 50, 15, size.y - 55);
    neckPath.quadraticBezierTo(10, size.y - 50, 12, size.y - 45);
    canvas.drawPath(neckPath, bodyPaint);
    
    // Head
    canvas.drawCircle(Offset(14, size.y - 52), 4, bodyPaint);
    
    // Beak
    final beakPath = Path();
    beakPath.moveTo(16, size.y - 52);
    beakPath.lineTo(22, size.y - 50);
    beakPath.lineTo(16, size.y - 50);
    beakPath.close();
    canvas.drawPath(beakPath, beakPaint);
    
    // Eye
    canvas.drawCircle(Offset(13, size.y - 53), 1.5, Paint()..color = Colors.black);
  }
  
  void _renderEggSplat(Canvas canvas) {
    final splatPaint = Paint()..color = const Color(0xFFFFEB3B);
    final whitePaint = Paint()..color = const Color(0xFFFFFDE7);
    
    // Splat on top of target
    final splatPath = Path();
    final centerX = size.x / 2;
    const centerY = -10.0;
    
    // Create irregular splat shape
    splatPath.moveTo(centerX, centerY - 15);
    splatPath.quadraticBezierTo(centerX + 20, centerY - 5, centerX + 15, centerY + 10);
    splatPath.quadraticBezierTo(centerX + 5, centerY + 15, centerX - 5, centerY + 12);
    splatPath.quadraticBezierTo(centerX - 20, centerY + 5, centerX - 15, centerY - 8);
    splatPath.quadraticBezierTo(centerX - 5, centerY - 12, centerX, centerY - 15);
    
    canvas.drawPath(splatPath, whitePaint);
    
    // Yolk
    canvas.drawCircle(Offset(centerX, centerY), 6, splatPaint);
    
    // Drips
    canvas.drawOval(
      Rect.fromCenter(center: Offset(centerX + 12, centerY + 18), width: 4, height: 8),
      whitePaint,
    );
    canvas.drawOval(
      Rect.fromCenter(center: Offset(centerX - 8, centerY + 15), width: 3, height: 6),
      whitePaint,
    );
  }
  
  Color _darken(Color color, double amount) {
    return Color.fromARGB(
      color.alpha,
      (color.red * (1 - amount)).round(),
      (color.green * (1 - amount)).round(),
      (color.blue * (1 - amount)).round(),
    );
  }
}
