import 'package:flame/components.dart';
import 'package:flutter/material.dart';

class Ground extends PositionComponent with HasGameRef {
  double gameSpeed;
  double _scrollOffset = 0;
  final double groundHeight = 100;
  
  Ground({required this.gameSpeed});
  
  @override
  Future<void> onLoad() async {
    await super.onLoad();
    position = Vector2(0, gameRef.size.y - groundHeight);
    size = Vector2(gameRef.size.x, groundHeight);
  }
  
  @override
  void update(double dt) {
    super.update(dt);
    _scrollOffset += gameSpeed * dt;
    if (_scrollOffset >= 50) {
      _scrollOffset -= 50;
    }
  }
  
  @override
  void render(Canvas canvas) {
    super.render(canvas);
    
    // Grass layer
    const grassGradient = LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [
        Color(0xFF4CAF50), // Grass green
        Color(0xFF388E3C), // Darker green
      ],
    );
    
    final grassRect = Rect.fromLTWH(0, 0, size.x, 25);
    canvas.drawRect(
      grassRect,
      Paint()..shader = grassGradient.createShader(grassRect),
    );
    
    // Grass texture
    final grassLinePaint = Paint()
      ..color = const Color(0xFF66BB6A)
      ..strokeWidth = 2;
    
    for (double x = -_scrollOffset % 8; x < size.x; x += 8) {
      canvas.drawLine(
        Offset(x, 0),
        Offset(x + 2, 15),
        grassLinePaint,
      );
    }
    
    // Sidewalk
    const sidewalkGradient = LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [
        Color(0xFFBDBDBD), // Light grey
        Color(0xFF9E9E9E), // Medium grey
      ],
    );
    
    final sidewalkRect = Rect.fromLTWH(0, 25, size.x, 35);
    canvas.drawRect(
      sidewalkRect,
      Paint()..shader = sidewalkGradient.createShader(sidewalkRect),
    );
    
    // Sidewalk cracks/segments
    final crackPaint = Paint()
      ..color = const Color(0xFF757575)
      ..strokeWidth = 2;
    
    for (double x = -_scrollOffset % 50; x < size.x; x += 50) {
      canvas.drawLine(
        Offset(x, 25),
        Offset(x, 60),
        crackPaint,
      );
    }
    
    // Curb
    canvas.drawRect(
      Rect.fromLTWH(0, 60, size.x, 8),
      Paint()..color = const Color(0xFF616161),
    );
    
    // Road
    const roadGradient = LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [
        Color(0xFF424242), // Dark grey
        Color(0xFF303030), // Darker grey
      ],
    );
    
    final roadRect = Rect.fromLTWH(0, 68, size.x, 32);
    canvas.drawRect(
      roadRect,
      Paint()..shader = roadGradient.createShader(roadRect),
    );
    
    // Road markings (dashed line)
    final linePaint = Paint()
      ..color = const Color(0xFFFFEB3B)
      ..strokeWidth = 3;
    
    for (double x = -_scrollOffset % 40; x < size.x; x += 40) {
      canvas.drawLine(
        Offset(x, 84),
        Offset(x + 20, 84),
        linePaint,
      );
    }
    
    // Bottom edge
    canvas.drawRect(
      Rect.fromLTWH(0, size.y - 2, size.x, 2),
      Paint()..color = const Color(0xFF212121),
    );
  }
}
