import 'dart:math';
import 'package:flame/game.dart';
import 'package:flame/events.dart';
import 'package:flame/components.dart';
import 'package:flutter/material.dart';
import '../config/app_config.dart';
import '../services/game_state_service.dart';
import '../services/audio_service.dart';
import 'components/chicken.dart';
import 'components/egg.dart';
import 'components/target.dart';
import 'components/background.dart';
import 'components/ground.dart';
import 'components/cloud.dart';
import 'components/house.dart';
import 'components/score_popup.dart';

enum GameState { ready, playing, gameOver }

class EggDropGame extends FlameGame with TapCallbacks, HasCollisionDetection {
  final GameStateService gameStateService;
  final AudioService audioService;
  final Function(int score, bool isNewHighScore) onGameOver;
  
  late Chicken chicken;
  late Ground ground;
  late GameBackground background;
  
  final Random _random = Random();
  
  GameState _gameState = GameState.ready;
  double _gameSpeed = AppConfig.gameSpeed;
  double _targetSpawnTimer = 0;
  double _cloudSpawnTimer = 0;
  double _houseSpawnTimer = 0;
  double _eggCooldown = 0;
  
  final List<Target> _targets = [];
  final List<Egg> _eggs = [];
  final List<Cloud> _clouds = [];
  final List<House> _houses = [];
  
  GameState get gameState => _gameState;
  double get gameSpeed => _gameSpeed;
  
  // Ground level for chicken to land on
  double get groundLevel => size.y - ground.groundHeight - 20;
  
  EggDropGame({
    required this.gameStateService,
    required this.audioService,
    required this.onGameOver,
  });
  
  @override
  Future<void> onLoad() async {
    await super.onLoad();
    
    // Add background
    background = GameBackground();
    add(background);
    
    // Add initial clouds
    for (int i = 0; i < 5; i++) {
      final cloud = Cloud(
        position: Vector2(
          _random.nextDouble() * size.x,
          _random.nextDouble() * size.y * 0.4,
        ),
        speed: 20 + _random.nextDouble() * 30,
      );
      _clouds.add(cloud);
      add(cloud);
    }
    
    // Add ground
    ground = Ground(gameSpeed: _gameSpeed);
    add(ground);
    
    // Add initial houses
    double houseX = 0;
    while (houseX < size.x + 200) {
      final house = House(
        position: Vector2(houseX, size.y - ground.groundHeight - 80),
      );
      _houses.add(house);
      add(house);
      houseX += 150 + _random.nextDouble() * 100;
    }
    
    // Add chicken
    chicken = Chicken(
      position: Vector2(size.x * 0.25, size.y * 0.3),
    );
    add(chicken);
    
    // Add tap to start text
    _addStartText();
  }
  
  void _addStartText() {
    final textPaint = TextPaint(
      style: const TextStyle(
        fontFamily: 'GameFont',
        fontSize: 16,
        color: Colors.white,
        shadows: [
          Shadow(
            blurRadius: 4,
            color: Colors.black,
            offset: Offset(2, 2),
          ),
        ],
      ),
    );
    
    add(
      TextComponent(
        text: 'TAP TO START',
        textRenderer: textPaint,
        position: Vector2(size.x / 2, size.y / 2),
        anchor: Anchor.center,
      )..add(
        TimerComponent(
          period: 0.5,
          repeat: true,
          onTick: () {
            // Blink effect handled by parent
          },
        ),
      ),
    );
  }
  
  @override
  void update(double dt) {
    super.update(dt);
    
    if (_gameState != GameState.playing) return;
    
    // Check for game over (out of lives)
    if (gameStateService.isGameOver) {
      _triggerGameOver();
      return;
    }
    
    // Update cooldown
    if (_eggCooldown > 0) {
      _eggCooldown -= dt;
    }
    
    // Spawn targets - more frequently!
    _targetSpawnTimer += dt;
    if (_targetSpawnTimer >= _getTargetSpawnInterval()) {
      _spawnTarget();
      _targetSpawnTimer = 0;
    }
    
    // Spawn clouds
    _cloudSpawnTimer += dt;
    if (_cloudSpawnTimer >= 3.0) {
      _spawnCloud();
      _cloudSpawnTimer = 0;
    }
    
    // Spawn houses
    _houseSpawnTimer += dt;
    if (_houseSpawnTimer >= _getHouseSpawnInterval()) {
      _spawnHouse();
      _houseSpawnTimer = 0;
    }
    
    // Update game speed based on score
    _gameSpeed = (AppConfig.gameSpeed + 
        gameStateService.currentScore * AppConfig.speedIncreasePerPoint)
        .clamp(AppConfig.gameSpeed, AppConfig.maxGameSpeed);
    
    // Update ground speed
    ground.gameSpeed = _gameSpeed;
    
    // Update and clean up targets
    _updateTargets(dt);
    
    // Update and clean up eggs
    _updateEggs(dt);
    
    // Update houses
    _updateHouses(dt);
    
    // Keep chicken above ground - just land, don't game over
    if (chicken.position.y > groundLevel) {
      chicken.position.y = groundLevel;
      chicken.landOnGround();
    }
  }
  
  double _getTargetSpawnInterval() {
    // Spawn fast! Between 0.4 and 1.0 seconds
    return (1.0 - (_gameSpeed - AppConfig.gameSpeed) / 200).clamp(0.4, 1.0);
  }
  
  double _getHouseSpawnInterval() {
    return (3.0 - (_gameSpeed - AppConfig.gameSpeed) / 300).clamp(1.5, 3.0);
  }
  
  void _spawnTarget() {
    final targetType = _getRandomTargetType();
    final targetSize = AppConfig.targetSizes[targetType]!;
    
    final target = Target(
      targetType: targetType,
      position: Vector2(
        size.x + targetSize[0],
        size.y - ground.groundHeight - targetSize[1],
      ),
      gameSpeed: _gameSpeed,
    );
    
    _targets.add(target);
    add(target);
  }
  
  String _getRandomTargetType() {
    final roll = _random.nextDouble();
    double cumulative = 0;
    
    for (final entry in AppConfig.targetSpawnRates.entries) {
      cumulative += entry.value;
      if (roll <= cumulative) {
        return entry.key;
      }
    }
    
    return 'car'; // Default fallback
  }
  
  void _spawnCloud() {
    final cloud = Cloud(
      position: Vector2(
        size.x + 100,
        _random.nextDouble() * size.y * 0.35,
      ),
      speed: 20 + _random.nextDouble() * 30,
    );
    _clouds.add(cloud);
    add(cloud);
  }
  
  void _spawnHouse() {
    final house = House(
      position: Vector2(
        size.x + 100,
        size.y - ground.groundHeight - 80,
      ),
    );
    _houses.add(house);
    add(house);
  }
  
  void _updateTargets(double dt) {
    final toRemove = <Target>[];
    
    for (final target in _targets) {
      target.gameSpeed = _gameSpeed;
      
      if (target.position.x < -target.size.x) {
        toRemove.add(target);
      }
    }
    
    for (final target in toRemove) {
      _targets.remove(target);
      target.removeFromParent();
    }
  }
  
  void _updateEggs(double dt) {
    final toRemove = <Egg>[];
    
    for (final egg in _eggs) {
      // Check if egg hit the ground
      if (egg.position.y > size.y - ground.groundHeight - 10) {
        if (!egg.hasHit) {
          // MISS! Lose a life!
          audioService.playMiss();
          gameStateService.recordMiss(); // This decrements lives
          
          // Show miss indicator
          add(ScorePopup(
            score: -1,
            position: egg.position.clone(),
            isCombo: false,
            isMiss: true,
          ));
        }
        toRemove.add(egg);
        continue;
      }
      
      // Check collision with targets
      if (!egg.hasHit) {
        for (final target in _targets) {
          if (!target.isHit && _checkCollision(egg, target)) {
            _handleHit(egg, target);
            break;
          }
        }
      }
      
      // Remove off-screen eggs
      if (egg.position.x < -50 || egg.position.y > size.y) {
        toRemove.add(egg);
      }
    }
    
    for (final egg in toRemove) {
      _eggs.remove(egg);
      egg.removeFromParent();
    }
  }
  
  void _updateHouses(double dt) {
    final toRemove = <House>[];
    
    for (final house in _houses) {
      house.position.x -= _gameSpeed * dt;
      
      if (house.position.x < -house.size.x) {
        toRemove.add(house);
      }
    }
    
    for (final house in toRemove) {
      _houses.remove(house);
      house.removeFromParent();
    }
  }
  
  bool _checkCollision(Egg egg, Target target) {
    final eggRect = Rect.fromCenter(
      center: Offset(egg.position.x, egg.position.y),
      width: egg.size.x,
      height: egg.size.y,
    );
    
    final targetRect = Rect.fromLTWH(
      target.position.x,
      target.position.y,
      target.size.x,
      target.size.y,
    );
    
    return eggRect.overlaps(targetRect);
  }
  
  void _handleHit(Egg egg, Target target) {
    egg.hasHit = true;
    target.hit();
    
    audioService.playHit();
    gameStateService.recordHit();
    gameStateService.incrementCombo();
    
    // Calculate points with combo bonus
    final basePoints = AppConfig.targetPoints[target.targetType] ?? 10;
    final comboBonus = gameStateService.currentCombo > 1 
        ? AppConfig.bonusPointsCombo * (gameStateService.currentCombo - 1)
        : 0;
    final totalPoints = basePoints + comboBonus;
    
    gameStateService.addScore(totalPoints);
    
    // Show score popup
    add(ScorePopup(
      score: totalPoints,
      position: target.position.clone(),
      isCombo: gameStateService.currentCombo > 1,
    ));
  }
  
  // PUBLIC: Called from game_screen when drop button is pressed
  void dropEgg() {
    if (_gameState != GameState.playing) return;
    if (_eggCooldown > 0) return;
    if (_eggs.length >= AppConfig.maxEggsOnScreen) return;
    
    final egg = Egg(
      position: Vector2(
        chicken.position.x,
        chicken.position.y + chicken.size.y / 2,
      ),
    );
    
    _eggs.add(egg);
    add(egg);
    
    audioService.playEggDrop();
    gameStateService.recordEggDrop();
    
    _eggCooldown = AppConfig.eggDropInterval;
  }
  
  // PUBLIC: Called from game_screen when screen is tapped (flap only)
  void flapChicken() {
    if (_gameState != GameState.playing) return;
    chicken.flap();
    audioService.playFlap();
  }
  
  @override
  void onTapDown(TapDownEvent event) {
    super.onTapDown(event);
    
    switch (_gameState) {
      case GameState.ready:
        _startGame();
        break;
      case GameState.playing:
        // Just flap - don't drop egg (that's handled by the button now)
        flapChicken();
        break;
      case GameState.gameOver:
        // Handled by UI overlay
        break;
    }
  }
  
  void _startGame() {
    _gameState = GameState.playing;
    gameStateService.startNewGame();
    audioService.playBackgroundMusic();
    
    // Remove start text
    children.whereType<TextComponent>().forEach((c) => c.removeFromParent());
  }
  
  void _triggerGameOver() async {
    if (_gameState == GameState.gameOver) return;
    
    _gameState = GameState.gameOver;
    audioService.playGameOver();
    audioService.stopMusic();
    
    final isNewHighScore = await gameStateService.endGame();
    onGameOver(gameStateService.currentScore, isNewHighScore);
  }
  
  void restart() {
    // Clear all game objects
    for (final target in _targets) {
      target.removeFromParent();
    }
    _targets.clear();
    
    for (final egg in _eggs) {
      egg.removeFromParent();
    }
    _eggs.clear();
    
    // Reset chicken position
    chicken.reset(Vector2(size.x * 0.25, size.y * 0.3));
    
    // Reset game state
    _gameSpeed = AppConfig.gameSpeed;
    _targetSpawnTimer = 0;
    _eggCooldown = 0;
    
    // Start fresh game
    _gameState = GameState.playing;
    gameStateService.startNewGame();
    audioService.playBackgroundMusic();
  }
  
  @override
  Color backgroundColor() => const Color(0xFF87CEEB);
}
