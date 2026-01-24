import 'dart:math';
import 'package:flame/components.dart';
import 'package:flutter/material.dart';

class Cloud extends PositionComponent with HasGameRef {
  final double speed;
  final double _scale;
  final int _cloudType;
  
  static final Random _random = Random();
  
  Cloud({
    required Vector2 position,
    required this.speed,
  }) : _scale = 0.5 + _random.nextDouble() * 0.8,
       _cloudType = _random.nextInt(3),
       super(
         position: position,
         size: Vector2(100, 50),
         anchor: Anchor.center,
       );
  
  @override
  void update(double dt) {
    super.update(dt);
    
    // Move cloud slowly to the left
    position.x -= speed * dt;
    
    // Remove if off screen
    if (position.x < -size.x) {
      removeFromParent();
    }
  }
  
  @override
  void render(Canvas canvas) {
    super.render(canvas);
    
    canvas.save();
    canvas.scale(_scale);
    
    final cloudPaint = Paint()..color = Colors.white.withOpacity(0.9);
    final shadowPaint = Paint()..color = const Color(0xFFE0E0E0).withOpacity(0.5);
    
    switch (_cloudType) {
      case 0:
        _renderCloud1(canvas, cloudPaint, shadowPaint);
        break;
      case 1:
        _renderCloud2(canvas, cloudPaint, shadowPaint);
        break;
      case 2:
        _renderCloud3(canvas, cloudPaint, shadowPaint);
        break;
    }
    
    canvas.restore();
  }
  
  void _renderCloud1(Canvas canvas, Paint cloudPaint, Paint shadowPaint) {
    // Simple fluffy cloud
    // Shadow
    canvas.drawCircle(const Offset(52, 37), 20, shadowPaint);
    canvas.drawCircle(const Offset(32, 40), 18, shadowPaint);
    canvas.drawCircle(const Offset(72, 40), 16, shadowPaint);
    
    // Main cloud
    canvas.drawCircle(const Offset(50, 32), 22, cloudPaint);
    canvas.drawCircle(const Offset(30, 35), 18, cloudPaint);
    canvas.drawCircle(const Offset(70, 35), 16, cloudPaint);
    canvas.drawCircle(const Offset(45, 40), 15, cloudPaint);
    canvas.drawCircle(const Offset(60, 38), 14, cloudPaint);
  }
  
  void _renderCloud2(Canvas canvas, Paint cloudPaint, Paint shadowPaint) {
    // Wider cloud
    // Shadow
    canvas.drawOval(
      const Rect.fromLTWH(15, 30, 70, 25),
      shadowPaint,
    );
    
    // Main cloud
    canvas.drawCircle(const Offset(40, 28), 18, cloudPaint);
    canvas.drawCircle(const Offset(60, 30), 16, cloudPaint);
    canvas.drawCircle(const Offset(25, 32), 14, cloudPaint);
    canvas.drawCircle(const Offset(75, 32), 12, cloudPaint);
    canvas.drawOval(
      const Rect.fromLTWH(18, 28, 65, 20),
      cloudPaint,
    );
  }
  
  void _renderCloud3(Canvas canvas, Paint cloudPaint, Paint shadowPaint) {
    // Tall puffy cloud
    // Shadow
    canvas.drawCircle(const Offset(50, 42), 22, shadowPaint);
    
    // Main cloud
    canvas.drawCircle(const Offset(50, 20), 16, cloudPaint);
    canvas.drawCircle(const Offset(35, 30), 14, cloudPaint);
    canvas.drawCircle(const Offset(65, 30), 14, cloudPaint);
    canvas.drawCircle(const Offset(50, 35), 20, cloudPaint);
    canvas.drawCircle(const Offset(30, 38), 12, cloudPaint);
    canvas.drawCircle(const Offset(70, 38), 12, cloudPaint);
  }
}
