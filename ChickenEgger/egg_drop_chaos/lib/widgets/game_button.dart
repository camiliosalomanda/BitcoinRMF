import 'package:flutter/material.dart';
import '../config/app_config.dart';

class GameButton extends StatefulWidget {
  final String text;
  final VoidCallback onPressed;
  final Color? backgroundColor;
  final Color? textColor;
  final double? width;
  final double? height;
  final IconData? icon;
  final bool enabled;

  const GameButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.backgroundColor,
    this.textColor,
    this.width,
    this.height,
    this.icon,
    this.enabled = true,
  });

  @override
  State<GameButton> createState() => _GameButtonState();
}

class _GameButtonState extends State<GameButton> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final bgColor = widget.backgroundColor ?? AppColors.buttonPrimary;
    final txtColor = widget.textColor ?? Colors.white;

    return GestureDetector(
      onTapDown: widget.enabled ? (_) => setState(() => _isPressed = true) : null,
      onTapUp: widget.enabled ? (_) => setState(() => _isPressed = false) : null,
      onTapCancel: widget.enabled ? () => setState(() => _isPressed = false) : null,
      onTap: widget.enabled ? widget.onPressed : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 100),
        width: widget.width ?? 200,
        height: widget.height ?? 56,
        transform: Matrix4.identity()
          ..translate(0.0, _isPressed ? 4.0 : 0.0),
        child: Stack(
          children: [
            // Shadow/3D effect layer
            Positioned(
              top: 4,
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                decoration: BoxDecoration(
                  color: _darkenColor(bgColor, 0.3),
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            // Main button layer
            Positioned(
              top: _isPressed ? 4 : 0,
              left: 0,
              right: 0,
              child: Container(
                height: (widget.height ?? 56) - 4,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: widget.enabled
                        ? [
                            _lightenColor(bgColor, 0.1),
                            bgColor,
                            _darkenColor(bgColor, 0.1),
                          ]
                        : [
                            Colors.grey.shade400,
                            Colors.grey.shade500,
                            Colors.grey.shade600,
                          ],
                  ),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: _darkenColor(bgColor, 0.2),
                    width: 2,
                  ),
                  boxShadow: _isPressed
                      ? []
                      : [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.2),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (widget.icon != null) ...[
                      Icon(
                        widget.icon,
                        color: txtColor,
                        size: 24,
                      ),
                      const SizedBox(width: 8),
                    ],
                    Text(
                      widget.text,
                      style: TextStyle(
                        fontFamily: AppConfig.gameFont,
                        fontSize: 16,
                        color: widget.enabled ? txtColor : Colors.grey.shade300,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1,
                        shadows: [
                          Shadow(
                            color: Colors.black.withValues(alpha: 0.3),
                            offset: const Offset(1, 1),
                            blurRadius: 2,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _lightenColor(Color color, double amount) {
    return Color.fromARGB(
      color.alpha,
      (color.red + ((255 - color.red) * amount)).round().clamp(0, 255),
      (color.green + ((255 - color.green) * amount)).round().clamp(0, 255),
      (color.blue + ((255 - color.blue) * amount)).round().clamp(0, 255),
    );
  }

  Color _darkenColor(Color color, double amount) {
    return Color.fromARGB(
      color.alpha,
      (color.red * (1 - amount)).round().clamp(0, 255),
      (color.green * (1 - amount)).round().clamp(0, 255),
      (color.blue * (1 - amount)).round().clamp(0, 255),
    );
  }
}

class GameIconButton extends StatefulWidget {
  final IconData icon;
  final VoidCallback onPressed;
  final Color? backgroundColor;
  final Color? iconColor;
  final double size;

  const GameIconButton({
    super.key,
    required this.icon,
    required this.onPressed,
    this.backgroundColor,
    this.iconColor,
    this.size = 48,
  });

  @override
  State<GameIconButton> createState() => _GameIconButtonState();
}

class _GameIconButtonState extends State<GameIconButton> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final bgColor = widget.backgroundColor ?? AppColors.buttonPrimary;
    final icnColor = widget.iconColor ?? Colors.white;

    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: widget.onPressed,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 100),
        width: widget.size,
        height: widget.size,
        transform: Matrix4.identity()
          ..translate(0.0, _isPressed ? 2.0 : 0.0),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              _lightenColor(bgColor, 0.1),
              bgColor,
              _darkenColor(bgColor, 0.1),
            ],
          ),
          shape: BoxShape.circle,
          border: Border.all(
            color: _darkenColor(bgColor, 0.2),
            width: 2,
          ),
          boxShadow: _isPressed
              ? []
              : [
                  BoxShadow(
                    color: _darkenColor(bgColor, 0.4),
                    offset: const Offset(0, 3),
                  ),
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.2),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: Icon(
          widget.icon,
          color: icnColor,
          size: widget.size * 0.5,
        ),
      ),
    );
  }

  Color _lightenColor(Color color, double amount) {
    return Color.fromARGB(
      color.alpha,
      (color.red + ((255 - color.red) * amount)).round().clamp(0, 255),
      (color.green + ((255 - color.green) * amount)).round().clamp(0, 255),
      (color.blue + ((255 - color.blue) * amount)).round().clamp(0, 255),
    );
  }

  Color _darkenColor(Color color, double amount) {
    return Color.fromARGB(
      color.alpha,
      (color.red * (1 - amount)).round().clamp(0, 255),
      (color.green * (1 - amount)).round().clamp(0, 255),
      (color.blue * (1 - amount)).round().clamp(0, 255),
    );
  }
}
