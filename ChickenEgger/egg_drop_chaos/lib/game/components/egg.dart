import 'package:flame/components.dart';
import 'package:flutter/material.dart';
import '../../config/app_config.dart';

class Egg extends PositionComponent {
  double _velocityY = 0;
  double _velocityX = 0;
  double _rotation = 0;
  bool hasHit = false;
  
  Egg({required Vector2 position})
      : super(
          position: position,
          size: Vector2(18, 22),
          anchor: Anchor.center,
        ) {
    // Initial velocity - slight forward momentum
    _velocityX = -20;
    _velocityY = 50;
  }
  
  @override
  void update(double dt) {
    super.update(dt);
    
    if (hasHit) return;
    
    // Apply gravity
    _velocityY += AppConfig.gravity * dt;
    
    // Update position
    position.y += _velocityY * dt;
    position.x += _velocityX * dt;
    
    // Rotate based on velocity
    _rotation += dt * 8;
  }
  
  @override
  void render(Canvas canvas) {
    super.render(canvas);
    
    canvas.save();
    canvas.translate(size.x / 2, size.y / 2);
    canvas.rotate(_rotation);
    canvas.translate(-size.x / 2, -size.y / 2);
    
    // Egg colors
    const eggColor = Color(0xFFFFFAF0); // Floral white
    const eggShadow = Color(0xFFEEE8DC);
    const eggHighlight = Color(0xFFFFFFFF);
    
    final eggPaint = Paint()..color = eggColor;
    final shadowPaint = Paint()..color = eggShadow;
    
    // Egg shape (oval with pointed top)
    final eggPath = Path();
    
    // Create egg shape using bezier curves
    final centerX = size.x / 2;
    final centerY = size.y / 2;
    final width = size.x;
    final height = size.y;
    
    eggPath.moveTo(centerX, 0);
    
    // Right side - more curved at bottom
    eggPath.cubicTo(
      centerX + width * 0.45, height * 0.15,
      centerX + width * 0.5, height * 0.5,
      centerX + width * 0.4, height * 0.85,
    );
    
    // Bottom curve
    eggPath.quadraticBezierTo(
      centerX, height * 1.05,
      centerX - width * 0.4, height * 0.85,
    );
    
    // Left side
    eggPath.cubicTo(
      centerX - width * 0.5, height * 0.5,
      centerX - width * 0.45, height * 0.15,
      centerX, 0,
    );
    
    eggPath.close();
    
    // Draw shadow
    canvas.save();
    canvas.translate(1, 1);
    canvas.drawPath(eggPath, shadowPaint);
    canvas.restore();
    
    // Draw egg
    canvas.drawPath(eggPath, eggPaint);
    
    // Highlight
    final highlightPaint = Paint()
      ..color = eggHighlight
      ..style = PaintingStyle.fill;
    
    canvas.drawOval(
      Rect.fromCenter(
        center: Offset(centerX - width * 0.15, height * 0.3),
        width: width * 0.25,
        height: height * 0.15,
      ),
      highlightPaint,
    );
    
    // Small spot decorations (speckled egg)
    final speckPaint = Paint()
      ..color = const Color(0xFFDEB887).withOpacity(0.4)
      ..style = PaintingStyle.fill;
    
    canvas.drawCircle(Offset(centerX + 3, height * 0.4), 1.5, speckPaint);
    canvas.drawCircle(Offset(centerX - 2, height * 0.55), 1, speckPaint);
    canvas.drawCircle(Offset(centerX + 1, height * 0.65), 1.2, speckPaint);
    canvas.drawCircle(Offset(centerX - 3, height * 0.35), 0.8, speckPaint);
    
    canvas.restore();
  }
}
