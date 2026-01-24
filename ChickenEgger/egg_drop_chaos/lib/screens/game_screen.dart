import 'package:flame/game.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/app_config.dart';
import '../game/egg_drop_game.dart';
import '../services/game_state_service.dart';
import '../services/audio_service.dart';
import '../services/ad_service.dart';
import '../widgets/game_hud.dart';
import '../widgets/game_over_overlay.dart';
import '../widgets/pause_overlay.dart';

class GameScreen extends StatefulWidget {
  const GameScreen({super.key});

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> with WidgetsBindingObserver {
  late EggDropGame _game;
  bool _showGameOver = false;
  bool _showPause = false;
  int _finalScore = 0;
  bool _isNewHighScore = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initGame();
  }

  void _initGame() {
    final gameStateService = Provider.of<GameStateService>(context, listen: false);
    final audioService = Provider.of<AudioService>(context, listen: false);
    
    _game = EggDropGame(
      gameStateService: gameStateService,
      audioService: audioService,
      onGameOver: _handleGameOver,
    );
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    
    if (state == AppLifecycleState.paused) {
      if (_game.gameState == GameState.playing) {
        _pauseGame();
      }
    }
  }

  void _handleGameOver(int score, bool isNewHighScore) {
    setState(() {
      _showGameOver = true;
      _finalScore = score;
      _isNewHighScore = isNewHighScore;
    });
    
    // Show interstitial ad
    if (!AppConfig.isPaidVersion) {
      final adService = Provider.of<AdService>(context, listen: false);
      adService.showInterstitialAdIfReady();
    }
  }

  void _pauseGame() {
    if (_game.gameState == GameState.playing) {
      setState(() {
        _showPause = true;
      });
      Provider.of<AudioService>(context, listen: false).pauseMusic();
    }
  }

  void _resumeGame() {
    setState(() {
      _showPause = false;
    });
    Provider.of<AudioService>(context, listen: false).resumeMusic();
  }

  void _restartGame() {
    setState(() {
      _showGameOver = false;
      _showPause = false;
    });
    _game.restart();
  }

  void _exitToMenu() {
    Provider.of<AudioService>(context, listen: false).stopMusic();
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final gameState = Provider.of<GameStateService>(context);
    final adService = Provider.of<AdService>(context);
    
    return Scaffold(
      body: Stack(
        children: [
          // Game
          GameWidget(
            game: _game,
            loadingBuilder: (context) => const Center(
              child: CircularProgressIndicator(
                color: AppConfig.primaryColor,
              ),
            ),
          ),
          
          // HUD
          if (!_showGameOver && !_showPause)
            GameHUD(
              score: gameState.currentScore,
              combo: gameState.currentCombo,
              onPause: _pauseGame,
            ),
          
          // Pause overlay
          if (_showPause)
            PauseOverlay(
              onResume: _resumeGame,
              onRestart: _restartGame,
              onExit: _exitToMenu,
            ),
          
          // Game over overlay
          if (_showGameOver)
            GameOverOverlay(
              score: _finalScore,
              isNewHighScore: _isNewHighScore,
              onRestart: _restartGame,
              onExit: _exitToMenu,
            ),
          
          // Banner ad at bottom (free version only)
          if (!AppConfig.isPaidVersion && 
              adService.isBannerAdLoaded && 
              !_showGameOver)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                alignment: Alignment.center,
                width: adService.bannerAd!.size.width.toDouble(),
                height: adService.bannerAd!.size.height.toDouble(),
                child: const SizedBox(), // Ad widget would go here
              ),
            ),
        ],
      ),
    );
  }
}
