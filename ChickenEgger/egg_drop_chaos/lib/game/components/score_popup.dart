import 'package:flame/components.dart';
import 'package:flutter/material.dart';

class ScorePopup extends PositionComponent {
  final int score;
  final bool isCombo;
  double _lifetime = 0;
  static const double _maxLifetime = 1.0;
  
  ScorePopup({
    required this.score,
    required Vector2 position,
    this.isCombo = false,
  }) : super(
         position: position,
         size: Vector2(60, 30),
         anchor: Anchor.center,
       );
  
  @override
  void update(double dt) {
    super.update(dt);
    
    _lifetime += dt;
    
    // Float upward
    position.y -= 80 * dt;
    
    // Remove after lifetime
    if (_lifetime >= _maxLifetime) {
      removeFromParent();
    }
  }
  
  @override
  void render(Canvas canvas) {
    super.render(canvas);
    
    final opacity = (1 - _lifetime / _maxLifetime).clamp(0.0, 1.0);
    final scale = 1.0 + (_lifetime / _maxLifetime) * 0.3;
    
    canvas.save();
    canvas.translate(size.x / 2, size.y / 2);
    canvas.scale(scale);
    canvas.translate(-size.x / 2, -size.y / 2);
    
    // Text style
    final textStyle = TextStyle(
      fontFamily: 'GameFont',
      fontSize: isCombo ? 16 : 14,
      fontWeight: FontWeight.bold,
      color: isCombo 
          ? const Color(0xFFFFD700).withOpacity(opacity)
          : const Color(0xFFFFFFFF).withOpacity(opacity),
      shadows: [
        Shadow(
          blurRadius: 4,
          color: Colors.black.withOpacity(opacity * 0.8),
          offset: const Offset(2, 2),
        ),
      ],
    );
    
    final textSpan = TextSpan(
      text: '+$score${isCombo ? '!' : ''}',
      style: textStyle,
    );
    
    final textPainter = TextPainter(
      text: textSpan,
      textDirection: TextDirection.ltr,
    );
    
    textPainter.layout();
    textPainter.paint(
      canvas,
      Offset(
        (size.x - textPainter.width) / 2,
        (size.y - textPainter.height) / 2,
      ),
    );
    
    canvas.restore();
  }
}
