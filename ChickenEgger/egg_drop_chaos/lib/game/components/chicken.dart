import 'package:flame/components.dart';
import 'package:flutter/material.dart';
import '../../config/app_config.dart';

class Chicken extends PositionComponent {
  double _velocityY = 0;
  double _flapAngle = 0;
  double _wingAngle = 0;
  bool _isFlapping = false;
  double _flapTimer = 0;
  
  Chicken({required Vector2 position})
      : super(
          position: position,
          size: Vector2(50, 40),
          anchor: Anchor.center,
        );
  
  @override
  void update(double dt) {
    super.update(dt);
    
    // Apply gravity
    _velocityY += AppConfig.gravity * dt;
    position.y += _velocityY * dt;
    
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
      // Gentle wing movement while falling
      _wingAngle = 0.1 * (1 + _velocityY.abs() / 500);
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
  }
  
  void reset(Vector2 newPosition) {
    position = newPosition;
    _velocityY = 0;
    _flapAngle = 0;
    _wingAngle = 0;
    _isFlapping = false;
    _flapTimer = 0;
  }
  
  @override
  void render(Canvas canvas) {
    super.render(canvas);
    
    canvas.save();
    canvas.translate(size.x / 2, size.y / 2);
    canvas.rotate(_flapAngle);
    canvas.translate(-size.x / 2, -size.y / 2);
    
    // Colors
    const bodyColor = Color(0xFFFFA500); // Orange
    const wingColor = Color(0xFFFF8C00); // Dark orange
    const beakColor = Color(0xFFFFD700); // Gold
    const eyeColor = Color(0xFF000000); // Black
    const combColor = Color(0xFFFF0000); // Red
    const legColor = Color(0xFFFF8C00);
    const featherHighlight = Color(0xFFFFB84D);
    
    final bodyPaint = Paint()..color = bodyColor;
    final wingPaint = Paint()..color = wingColor;
    final beakPaint = Paint()..color = beakColor;
    final eyePaint = Paint()..color = eyeColor;
    final combPaint = Paint()..color = combColor;
    final legPaint = Paint()
      ..color = legColor
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;
    final highlightPaint = Paint()..color = featherHighlight;
    
    // Body (ellipse)
    final bodyRect = Rect.fromCenter(
      center: Offset(size.x * 0.45, size.y * 0.55),
      width: size.x * 0.7,
      height: size.y * 0.65,
    );
    canvas.drawOval(bodyRect, bodyPaint);
    
    // Body highlight
    final highlightRect = Rect.fromCenter(
      center: Offset(size.x * 0.4, size.y * 0.45),
      width: size.x * 0.35,
      height: size.y * 0.3,
    );
    canvas.drawOval(highlightRect, highlightPaint);
    
    // Head
    final headRect = Rect.fromCircle(
      center: Offset(size.x * 0.75, size.y * 0.35),
      radius: size.x * 0.22,
    );
    canvas.drawOval(headRect, bodyPaint);
    
    // Comb (rooster crest)
    final combPath = Path();
    combPath.moveTo(size.x * 0.7, size.y * 0.15);
    combPath.lineTo(size.x * 0.75, size.y * 0.05);
    combPath.lineTo(size.x * 0.8, size.y * 0.12);
    combPath.lineTo(size.x * 0.85, size.y * 0.02);
    combPath.lineTo(size.x * 0.9, size.y * 0.15);
    combPath.lineTo(size.x * 0.85, size.y * 0.2);
    combPath.lineTo(size.x * 0.75, size.y * 0.2);
    combPath.close();
    canvas.drawPath(combPath, combPaint);
    
    // Wattle (under beak)
    final wattlePath = Path();
    wattlePath.moveTo(size.x * 0.88, size.y * 0.42);
    wattlePath.quadraticBezierTo(
      size.x * 0.92, size.y * 0.55,
      size.x * 0.85, size.y * 0.5,
    );
    canvas.drawPath(wattlePath, combPaint);
    
    // Eye
    canvas.drawCircle(
      Offset(size.x * 0.8, size.y * 0.32),
      size.x * 0.06,
      eyePaint,
    );
    // Eye highlight
    canvas.drawCircle(
      Offset(size.x * 0.82, size.y * 0.3),
      size.x * 0.02,
      Paint()..color = Colors.white,
    );
    
    // Beak
    final beakPath = Path();
    beakPath.moveTo(size.x * 0.9, size.y * 0.35);
    beakPath.lineTo(size.x * 1.05, size.y * 0.4);
    beakPath.lineTo(size.x * 0.9, size.y * 0.45);
    beakPath.close();
    canvas.drawPath(beakPath, beakPaint);
    
    // Wings (animated)
    canvas.save();
    canvas.translate(size.x * 0.35, size.y * 0.5);
    canvas.rotate(-_wingAngle);
    
    final wingPath = Path();
    wingPath.moveTo(0, 0);
    wingPath.quadraticBezierTo(
      -size.x * 0.25, -size.y * 0.15,
      -size.x * 0.3, size.y * 0.1,
    );
    wingPath.quadraticBezierTo(
      -size.x * 0.2, size.y * 0.2,
      0, size.y * 0.15,
    );
    wingPath.close();
    canvas.drawPath(wingPath, wingPaint);
    
    // Wing feather details
    final featherPaint = Paint()
      ..color = bodyColor
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;
    canvas.drawLine(
      Offset(-size.x * 0.1, size.y * 0.02),
      Offset(-size.x * 0.2, size.y * 0.08),
      featherPaint,
    );
    canvas.drawLine(
      Offset(-size.x * 0.12, size.y * 0.08),
      Offset(-size.x * 0.22, size.y * 0.14),
      featherPaint,
    );
    
    canvas.restore();
    
    // Tail feathers
    final tailPath = Path();
    tailPath.moveTo(size.x * 0.1, size.y * 0.45);
    tailPath.quadraticBezierTo(
      -size.x * 0.1, size.y * 0.3,
      -size.x * 0.05, size.y * 0.5,
    );
    tailPath.quadraticBezierTo(
      -size.x * 0.15, size.y * 0.4,
      -size.x * 0.08, size.y * 0.6,
    );
    tailPath.quadraticBezierTo(
      -size.x * 0.1, size.y * 0.55,
      size.x * 0.1, size.y * 0.7,
    );
    tailPath.close();
    canvas.drawPath(tailPath, wingPaint);
    
    // Legs
    canvas.drawLine(
      Offset(size.x * 0.35, size.y * 0.85),
      Offset(size.x * 0.3, size.y * 1.0),
      legPaint,
    );
    canvas.drawLine(
      Offset(size.x * 0.3, size.y * 1.0),
      Offset(size.x * 0.22, size.y * 1.0),
      legPaint,
    );
    canvas.drawLine(
      Offset(size.x * 0.3, size.y * 1.0),
      Offset(size.x * 0.38, size.y * 1.0),
      legPaint,
    );
    
    canvas.drawLine(
      Offset(size.x * 0.55, size.y * 0.85),
      Offset(size.x * 0.55, size.y * 1.0),
      legPaint,
    );
    canvas.drawLine(
      Offset(size.x * 0.55, size.y * 1.0),
      Offset(size.x * 0.47, size.y * 1.0),
      legPaint,
    );
    canvas.drawLine(
      Offset(size.x * 0.55, size.y * 1.0),
      Offset(size.x * 0.63, size.y * 1.0),
      legPaint,
    );
    
    canvas.restore();
  }
}
