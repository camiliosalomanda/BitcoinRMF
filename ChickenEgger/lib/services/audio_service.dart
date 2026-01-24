import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flame_audio/flame_audio.dart';

class AudioService extends ChangeNotifier {
  bool _soundEnabled = true;
  bool _musicEnabled = true;
  bool _isMusicPlaying = false;
  bool _audioAvailable = false;
  
  bool get soundEnabled => _soundEnabled;
  bool get musicEnabled => _musicEnabled;
  bool get isMusicPlaying => _isMusicPlaying;
  
  // Check if on mobile platform where audio works well
  bool get _isMobilePlatform {
    try {
      return Platform.isAndroid || Platform.isIOS;
    } catch (e) {
      return false;
    }
  }
  
  AudioService() {
    // Only enable audio on mobile platforms for now
    _audioAvailable = _isMobilePlatform;
  }
  
  void setSoundEnabled(bool enabled) {
    _soundEnabled = enabled;
    notifyListeners();
  }
  
  void setMusicEnabled(bool enabled) {
    _musicEnabled = enabled;
    if (!enabled && _isMusicPlaying) {
      stopMusic();
    } else if (enabled && !_isMusicPlaying) {
      playBackgroundMusic();
    }
    notifyListeners();
  }
  
  void playSound(String soundFile) {
    if (!_audioAvailable || !_soundEnabled) return;
    
    try {
      FlameAudio.play(soundFile);
    } catch (e) {
      debugPrint('Error playing sound: $e');
    }
  }
  
  void playFlap() => playSound('flap.wav');
  void playEggDrop() => playSound('egg_drop.wav');
  void playHit() => playSound('hit.wav');
  void playMiss() => playSound('miss.wav');
  void playPowerup() => playSound('powerup.wav');
  void playGameOver() => playSound('game_over.wav');
  
  void playBackgroundMusic() {
    if (!_audioAvailable || !_musicEnabled || _isMusicPlaying) return;
    
    try {
      FlameAudio.bgm.play('background_music.mp3', volume: 0.5);
      _isMusicPlaying = true;
      notifyListeners();
    } catch (e) {
      debugPrint('Error playing background music: $e');
    }
  }
  
  void stopMusic() {
    if (!_isMusicPlaying) return;
    
    try {
      FlameAudio.bgm.stop();
      _isMusicPlaying = false;
      notifyListeners();
    } catch (e) {
      debugPrint('Error stopping music: $e');
    }
  }
  
  void pauseMusic() {
    if (!_isMusicPlaying) return;
    
    try {
      FlameAudio.bgm.pause();
    } catch (e) {
      debugPrint('Error pausing music: $e');
    }
  }
  
  void resumeMusic() {
    if (!_isMusicPlaying || !_musicEnabled) return;
    
    try {
      FlameAudio.bgm.resume();
    } catch (e) {
      debugPrint('Error resuming music: $e');
    }
  }
  
  @override
  void dispose() {
    stopMusic();
    super.dispose();
  }
}
