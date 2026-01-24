import 'package:flame/components.dart';
import 'package:flutter/material.dart';
import '../../config/app_config.dart';

class Chicken extends PositionComponent {
  double _velocityY = 0;
  double _flapAngle = 0;
  double _wingAngle = 0;
  bool _isFlapping = false;
  double _flapTimer = 0;
  bool _isOnGround = false;
  
  Chicken({required Vector2 position})
      : super(
          position: position,
          size: Vector2(50, 40),
          anchor: Anchor.center,
        );
  
  @override
  void update(double dt) {
    super.update(dt);
    
    // Apply gravity (only if not on ground)
    if (!_isOnGround) {
      _velocityY += AppConfig.gravity * dt;
      position.y += _velocityY * dt;
    }
    
    // Calculate rotation based on velocity
    _flapAngle = (_velocityY / 500).clamp(-0.5, 0.5);
    
    // Wing flapping animation
    if (_isFlapping) {
      _flapTimer += dt * 15;
      _wingAngle = 0.5 * (1 + (1 - _flapTimer).clamp(0, 1));
      
      if (_flapTimer >= 1) {
        _isFlapping = false;
        _flapTimer = 0;
      }
    } else {
      // Gentle wing movement while falling/standing
      if (_isOnGround) {
        _wingAngle = 0.05; // Wings tucked when on ground
      } else {
        _wingAngle = 0.1 * (1 + _velocityY.abs() / 500);
      }
    }
    
    // Keep chicken on screen (top boundary)
    if (position.y < size.y) {
      position.y = size.y;
      _velocityY = 0;
    }
  }
  
  void flap() {
    _velocityY = AppConfig.chickenFlapVelocity;
    _isFlapping = true;
    _flapTimer = 0;
    _isOnGround = false; // Leave the ground when flapping
  }
  
  void landOnGround() {
    _velocityY = 0;
    _isOnGround = true;
    _flapAngle = 0;
  }
  
  void reset(Vector2 newPosition) {
    position = newPosition;
    _velocityY = 0;
    _flapAngle = 0;
    _wingAngle = 0;
    _isFlapping = false;
    _isOnGround = false;
  }
  
  @override
  void render(Canvas canvas) {
    super.render(canvas);
    
    canvas.save();
    canvas.translate(size.x / 2, size.y / 2);
    canvas.rotate(_flapAngle);
    canvas.translate(-size.x / 2, -size.y / 2);
    
    // Body (orange oval)
    final bodyPaint = Paint()..color = AppColors.chicken;
    canvas.drawOval(
      Rect.fromCenter(
        center: Offset(size.x * 0.45, size.y * 0.5),
        width: size.x * 0.7,
        height: size.y * 0.6,
      ),
      bodyPaint,
    );
    
    // Head (smaller orange circle)
    canvas.drawCircle(
      Offset(size.x * 0.75, size.y * 0.35),
      size.x * 0.2,
      bodyPaint,
    );
    
    // Comb (red)
    final combPaint = Paint()..color = AppColors.chickenComb;
    final combPath = Path()
      ..moveTo(size.x * 0.65, size.y * 0.2)
      ..lineTo(size.x * 0.70, size.y * 0.05)
      ..lineTo(size.x * 0.75, size.y * 0.15)
      ..lineTo(size.x * 0.80, size.y * 0.0)
      ..lineTo(size.x * 0.85, size.y * 0.15)
      ..lineTo(size.x * 0.90, size.y * 0.05)
      ..lineTo(size.x * 0.85, size.y * 0.2)
      ..close();
    canvas.drawPath(combPath, combPaint);
    
    // Beak (orange/yellow triangle)
    final beakPaint = Paint()..color = Colors.orange.shade700;
    final beakPath = Path()
      ..moveTo(size.x * 0.9, size.y * 0.35)
      ..lineTo(size.x * 1.05, size.y * 0.4)
      ..lineTo(size.x * 0.9, size.y * 0.45)
      ..close();
    canvas.drawPath(beakPath, beakPaint);
    
    // Eye (white circle with black dot)
    final eyeWhitePaint = Paint()..color = Colors.white;
    final eyeBlackPaint = Paint()..color = Colors.black;
    canvas.drawCircle(
      Offset(size.x * 0.8, size.y * 0.3),
      size.x * 0.06,
      eyeWhitePaint,
    );
    canvas.drawCircle(
      Offset(size.x * 0.82, size.y * 0.3),
      size.x * 0.03,
      eyeBlackPaint,
    );
    
    // Wing (animated)
    final wingPaint = Paint()..color = Colors.orange.shade600;
    canvas.save();
    canvas.translate(size.x * 0.35, size.y * 0.45);
    canvas.rotate(-_wingAngle);
    
    final wingPath = Path()
      ..moveTo(0, 0)
      ..quadraticBezierTo(
        -size.x * 0.15,
        size.y * 0.2,
        -size.x * 0.05,
        size.y * 0.35,
      )
      ..quadraticBezierTo(
        size.x * 0.1,
        size.y * 0.25,
        size.x * 0.15,
        0,
      )
      ..close();
    canvas.drawPath(wingPath, wingPaint);
    canvas.restore();
    
    // Tail feathers
    final tailPaint = Paint()..color = Colors.orange.shade700;
    for (int i = 0; i < 3; i++) {
      canvas.drawOval(
        Rect.fromCenter(
          center: Offset(size.x * 0.1, size.y * (0.35 + i * 0.12)),
          width: size.x * 0.15,
          height: size.y * 0.08,
        ),
        tailPaint,
      );
    }
    
    // Legs (only visible when on/near ground)
    if (_isOnGround || _flapAngle > 0.2) {
      final legPaint = Paint()
        ..color = Colors.orange.shade800
        ..strokeWidth = 2
        ..style = PaintingStyle.stroke;
      
      // Left leg
      canvas.drawLine(
        Offset(size.x * 0.35, size.y * 0.75),
        Offset(size.x * 0.3, size.y * 0.95),
        legPaint,
      );
      // Left foot
      canvas.drawLine(
        Offset(size.x * 0.3, size.y * 0.95),
        Offset(size.x * 0.22, size.y * 0.95),
        legPaint,
      );
      canvas.drawLine(
        Offset(size.x * 0.3, size.y * 0.95),
        Offset(size.x * 0.35, size.y * 0.98),
        legPaint,
      );
      
      // Right leg
      canvas.drawLine(
        Offset(size.x * 0.5, size.y * 0.75),
        Offset(size.x * 0.55, size.y * 0.95),
        legPaint,
      );
      // Right foot
      canvas.drawLine(
        Offset(size.x * 0.55, size.y * 0.95),
        Offset(size.x * 0.48, size.y * 0.95),
        legPaint,
      );
      canvas.drawLine(
        Offset(size.x * 0.55, size.y * 0.95),
        Offset(size.x * 0.6, size.y * 0.98),
        legPaint,
      );
    }
    
    canvas.restore();
  }
}
