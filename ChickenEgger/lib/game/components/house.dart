import 'dart:math';
import 'package:flame/components.dart';
import 'package:flutter/material.dart';

class House extends PositionComponent {
  final Color _wallColor;
  final Color _roofColor;
  final Color _doorColor;
  final int _houseType;
  final bool _hasChimney;
  final int _windowStyle;
  
  static final Random _random = Random();
  
  static final List<Color> _wallColors = [
    const Color(0xFFFFF8E1), // Cream
    const Color(0xFFE3F2FD), // Light blue
    const Color(0xFFFFECB3), // Light yellow
    const Color(0xFFF3E5F5), // Light purple
    const Color(0xFFE8F5E9), // Light green
    const Color(0xFFFFCDD2), // Light red
  ];
  
  static final List<Color> _roofColors = [
    const Color(0xFF5D4037), // Brown
    const Color(0xFF37474F), // Dark grey
    const Color(0xFF4E342E), // Dark brown
    const Color(0xFF1B5E20), // Dark green
    const Color(0xFF880E4F), // Dark pink
  ];
  
  static final List<Color> _doorColors = [
    const Color(0xFF6D4C41), // Brown
    const Color(0xFFD32F2F), // Red
    const Color(0xFF1565C0), // Blue
    const Color(0xFF2E7D32), // Green
    const Color(0xFF4527A0), // Purple
  ];
  
  House({
    required Vector2 position,
  }) : _wallColor = _wallColors[_random.nextInt(_wallColors.length)],
       _roofColor = _roofColors[_random.nextInt(_roofColors.length)],
       _doorColor = _doorColors[_random.nextInt(_doorColors.length)],
       _houseType = _random.nextInt(3),
       _hasChimney = _random.nextBool(),
       _windowStyle = _random.nextInt(2),
       super(
         position: position,
         size: Vector2(80 + _random.nextDouble() * 40, 80),
         anchor: Anchor.bottomLeft,
       );
  
  @override
  void render(Canvas canvas) {
    super.render(canvas);
    
    switch (_houseType) {
      case 0:
        _renderSimpleHouse(canvas);
        break;
      case 1:
        _renderTwoStoryHouse(canvas);
        break;
      case 2:
        _renderCottage(canvas);
        break;
    }
  }
  
  void _renderSimpleHouse(Canvas canvas) {
    final wallPaint = Paint()..color = _wallColor;
    final roofPaint = Paint()..color = _roofColor;
    final doorPaint = Paint()..color = _doorColor;
    final windowPaint = Paint()..color = const Color(0xFF90CAF9);
    final framePaint = Paint()..color = const Color(0xFFFFFFFF);
    final outlinePaint = Paint()
      ..color = const Color(0xFF424242)
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;
    
    final houseWidth = size.x;
    final houseHeight = size.y * 0.6;
    final roofHeight = size.y * 0.35;
    
    // Wall
    canvas.drawRect(
      Rect.fromLTWH(0, roofHeight, houseWidth, houseHeight),
      wallPaint,
    );
    canvas.drawRect(
      Rect.fromLTWH(0, roofHeight, houseWidth, houseHeight),
      outlinePaint,
    );
    
    // Roof
    final roofPath = Path();
    roofPath.moveTo(-5, roofHeight);
    roofPath.lineTo(houseWidth / 2, 0);
    roofPath.lineTo(houseWidth + 5, roofHeight);
    roofPath.close();
    canvas.drawPath(roofPath, roofPaint);
    canvas.drawPath(roofPath, outlinePaint);
    
    // Chimney
    if (_hasChimney) {
      canvas.drawRect(
        Rect.fromLTWH(houseWidth * 0.7, roofHeight * 0.3, 12, roofHeight * 0.5),
        Paint()..color = const Color(0xFF8D6E63),
      );
    }
    
    // Door
    final doorWidth = houseWidth * 0.2;
    final doorHeight = houseHeight * 0.5;
    canvas.drawRRect(
      RRect.fromRectAndCorners(
        Rect.fromLTWH(
          houseWidth / 2 - doorWidth / 2,
          size.y - doorHeight,
          doorWidth,
          doorHeight,
        ),
        topLeft: const Radius.circular(3),
        topRight: const Radius.circular(3),
      ),
      doorPaint,
    );
    
    // Door knob
    canvas.drawCircle(
      Offset(houseWidth / 2 + doorWidth * 0.3, size.y - doorHeight * 0.4),
      3,
      Paint()..color = const Color(0xFFFFD700),
    );
    
    // Windows
    _drawWindow(canvas, houseWidth * 0.15, roofHeight + houseHeight * 0.2, windowPaint, framePaint, outlinePaint);
    _drawWindow(canvas, houseWidth * 0.65, roofHeight + houseHeight * 0.2, windowPaint, framePaint, outlinePaint);
  }
  
  void _renderTwoStoryHouse(Canvas canvas) {
    final wallPaint = Paint()..color = _wallColor;
    final roofPaint = Paint()..color = _roofColor;
    final doorPaint = Paint()..color = _doorColor;
    final windowPaint = Paint()..color = const Color(0xFF90CAF9);
    final framePaint = Paint()..color = const Color(0xFFFFFFFF);
    final outlinePaint = Paint()
      ..color = const Color(0xFF424242)
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;
    
    final houseWidth = size.x;
    final houseHeight = size.y * 0.75;
    final roofHeight = size.y * 0.2;
    
    // Wall
    canvas.drawRect(
      Rect.fromLTWH(0, roofHeight, houseWidth, houseHeight),
      wallPaint,
    );
    canvas.drawRect(
      Rect.fromLTWH(0, roofHeight, houseWidth, houseHeight),
      outlinePaint,
    );
    
    // Roof
    final roofPath = Path();
    roofPath.moveTo(-5, roofHeight);
    roofPath.lineTo(houseWidth / 2, -5);
    roofPath.lineTo(houseWidth + 5, roofHeight);
    roofPath.close();
    canvas.drawPath(roofPath, roofPaint);
    canvas.drawPath(roofPath, outlinePaint);
    
    // Chimney
    if (_hasChimney) {
      canvas.drawRect(
        Rect.fromLTWH(houseWidth * 0.75, 0, 10, roofHeight * 0.8),
        Paint()..color = const Color(0xFF8D6E63),
      );
    }
    
    // Door
    final doorWidth = houseWidth * 0.18;
    final doorHeight = houseHeight * 0.35;
    canvas.drawRRect(
      RRect.fromRectAndCorners(
        Rect.fromLTWH(
          houseWidth / 2 - doorWidth / 2,
          size.y - doorHeight,
          doorWidth,
          doorHeight,
        ),
        topLeft: const Radius.circular(3),
        topRight: const Radius.circular(3),
      ),
      doorPaint,
    );
    
    // First floor windows
    _drawWindow(canvas, houseWidth * 0.1, roofHeight + houseHeight * 0.55, windowPaint, framePaint, outlinePaint);
    _drawWindow(canvas, houseWidth * 0.65, roofHeight + houseHeight * 0.55, windowPaint, framePaint, outlinePaint);
    
    // Second floor windows
    _drawWindow(canvas, houseWidth * 0.15, roofHeight + houseHeight * 0.1, windowPaint, framePaint, outlinePaint);
    _drawWindow(canvas, houseWidth * 0.55, roofHeight + houseHeight * 0.1, windowPaint, framePaint, outlinePaint);
  }
  
  void _renderCottage(Canvas canvas) {
    final wallPaint = Paint()..color = _wallColor;
    final roofPaint = Paint()..color = _roofColor;
    final doorPaint = Paint()..color = _doorColor;
    final windowPaint = Paint()..color = const Color(0xFF90CAF9);
    final framePaint = Paint()..color = const Color(0xFFFFFFFF);
    final outlinePaint = Paint()
      ..color = const Color(0xFF424242)
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;
    
    final houseWidth = size.x * 0.9;
    final houseHeight = size.y * 0.5;
    final roofHeight = size.y * 0.45;
    
    // Wall
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(size.x * 0.05, roofHeight, houseWidth, houseHeight),
        const Radius.circular(5),
      ),
      wallPaint,
    );
    
    // Thatched roof
    final roofPath = Path();
    roofPath.moveTo(-8, roofHeight + 5);
    roofPath.quadraticBezierTo(size.x / 2, -10, size.x + 8, roofHeight + 5);
    roofPath.close();
    canvas.drawPath(roofPath, roofPaint);
    
    // Roof texture lines
    final texturePaint = Paint()
      ..color = _darken(_roofColor, 0.1)
      ..strokeWidth = 1;
    for (double x = 0; x < size.x; x += 8) {
      final y = roofHeight - (20 * (1 - ((x - size.x / 2).abs() / (size.x / 2))));
      canvas.drawLine(Offset(x, y + 10), Offset(x + 2, roofHeight + 3), texturePaint);
    }
    
    // Round door
    canvas.drawCircle(
      Offset(size.x / 2, size.y - houseHeight * 0.35),
      houseHeight * 0.25,
      doorPaint,
    );
    
    // Round windows
    canvas.drawCircle(
      Offset(size.x * 0.25, roofHeight + houseHeight * 0.35),
      10,
      windowPaint,
    );
    canvas.drawCircle(
      Offset(size.x * 0.25, roofHeight + houseHeight * 0.35),
      10,
      outlinePaint,
    );
    canvas.drawCircle(
      Offset(size.x * 0.75, roofHeight + houseHeight * 0.35),
      10,
      windowPaint,
    );
    canvas.drawCircle(
      Offset(size.x * 0.75, roofHeight + houseHeight * 0.35),
      10,
      outlinePaint,
    );
  }
  
  void _drawWindow(Canvas canvas, double x, double y, Paint windowPaint, Paint framePaint, Paint outlinePaint) {
    final windowWidth = size.x * 0.18;
    final windowHeight = size.y * 0.2;
    
    if (_windowStyle == 0) {
      // Rectangle window with frame
      canvas.drawRect(
        Rect.fromLTWH(x, y, windowWidth, windowHeight),
        framePaint,
      );
      canvas.drawRect(
        Rect.fromLTWH(x + 2, y + 2, windowWidth - 4, windowHeight - 4),
        windowPaint,
      );
      // Cross bars
      canvas.drawLine(
        Offset(x + windowWidth / 2, y),
        Offset(x + windowWidth / 2, y + windowHeight),
        outlinePaint,
      );
      canvas.drawLine(
        Offset(x, y + windowHeight / 2),
        Offset(x + windowWidth, y + windowHeight / 2),
        outlinePaint,
      );
    } else {
      // Arched window
      final windowPath = Path();
      windowPath.moveTo(x, y + windowHeight);
      windowPath.lineTo(x, y + windowHeight * 0.3);
      windowPath.arcToPoint(
        Offset(x + windowWidth, y + windowHeight * 0.3),
        radius: Radius.circular(windowWidth / 2),
      );
      windowPath.lineTo(x + windowWidth, y + windowHeight);
      windowPath.close();
      
      canvas.drawPath(windowPath, framePaint);
      
      // Inner window
      canvas.save();
      canvas.translate(2, 2);
      canvas.scale(0.85);
      canvas.translate(-x * 0.85 + x, -y * 0.85 + y);
      canvas.drawPath(windowPath, windowPaint);
      canvas.restore();
    }
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
