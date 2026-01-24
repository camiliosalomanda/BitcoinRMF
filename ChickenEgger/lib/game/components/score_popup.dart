import 'package:flame/components.dart';
import 'package:flutter/material.dart';

class ScorePopup extends PositionComponent {
  final int score;
  final bool isCombo;
  final bool isMiss;
  double _lifetime = 0;
  static const double _maxLifetime = 1.0;
  
  ScorePopup({
    required this.score,
    required Vector2 position,
    this.isCombo = false,
    this.isMiss = false,
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
    
    // Determine color and text based on type
    Color textColor;
    String displayText;
    
    if (isMiss) {
      textColor = const Color(0xFFFF4444); // Red for miss
      displayText = 'MISS!';
    } else if (isCombo) {
      textColor = const Color(0xFFFFD700); // Gold for combo
      displayText = '+$score!';
    } else {
      textColor = const Color(0xFFFFFFFF); // White for normal
      displayText = '+$score';
    }
    
    // Text style
    final textStyle = TextStyle(
      fontFamily: 'GameFont',
      fontSize: isMiss ? 18 : (isCombo ? 16 : 14),
      fontWeight: FontWeight.bold,
      color: textColor.withOpacity(opacity),
      shadows: [
        Shadow(
          blurRadius: 4,
          color: Colors.black.withOpacity(opacity * 0.8),
          offset: const Offset(2, 2),
        ),
        if (isMiss)
          Shadow(
            blurRadius: 8,
            color: Colors.red.withOpacity(opacity * 0.5),
            offset: const Offset(0, 0),
          ),
      ],
    );
    
    final textSpan = TextSpan(
      text: displayText,
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
