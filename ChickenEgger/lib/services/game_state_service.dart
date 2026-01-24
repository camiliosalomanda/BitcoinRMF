import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class GameStateService extends ChangeNotifier {
  final SharedPreferences _prefs;
  
  static const String _highScoreKey = 'high_score';
  static const String _totalScoreKey = 'total_score';
  static const String _totalEggsDroppedKey = 'total_eggs_dropped';
  static const String _totalTargetsHitKey = 'total_targets_hit';
  static const String _totalGamesPlayedKey = 'total_games_played';
  static const String _maxComboKey = 'max_combo';
  static const String _soundEnabledKey = 'sound_enabled';
  static const String _musicEnabledKey = 'music_enabled';
  static const String _adsRemovedKey = 'ads_removed';
  static const String _unlockedChickensKey = 'unlocked_chickens';
  static const String _selectedChickenKey = 'selected_chicken';
  
  int _highScore = 0;
  int _totalScore = 0;
  int _totalEggsDropped = 0;
  int _totalTargetsHit = 0;
  int _totalGamesPlayed = 0;
  int _maxCombo = 0;
  bool _soundEnabled = true;
  bool _musicEnabled = true;
  bool _adsRemoved = false;
  List<String> _unlockedChickens = ['default'];
  String _selectedChicken = 'default';
  
  // Current game state
  int _currentScore = 0;
  int _currentCombo = 0;
  int _currentEggsDropped = 0;
  int _currentHits = 0;
  int _currentLives = 5; // NEW: Lives system
  int _currentMisses = 0; // NEW: Track misses
  
  GameStateService(this._prefs) {
    _loadFromPrefs();
  }
  
  // Getters
  int get highScore => _highScore;
  int get totalScore => _totalScore;
  int get totalEggsDropped => _totalEggsDropped;
  int get totalTargetsHit => _totalTargetsHit;
  int get totalGamesPlayed => _totalGamesPlayed;
  int get maxCombo => _maxCombo;
  bool get soundEnabled => _soundEnabled;
  bool get musicEnabled => _musicEnabled;
  bool get adsRemoved => _adsRemoved;
  List<String> get unlockedChickens => _unlockedChickens;
  String get selectedChicken => _selectedChicken;
  
  int get currentScore => _currentScore;
  int get currentCombo => _currentCombo;
  int get currentEggsDropped => _currentEggsDropped;
  int get currentHits => _currentHits;
  int get currentLives => _currentLives; // NEW
  int get currentMisses => _currentMisses; // NEW
  bool get isGameOver => _currentLives <= 0; // NEW
  
  double get accuracy {
    if (_currentEggsDropped == 0) return 0;
    return (_currentHits / _currentEggsDropped) * 100;
  }
  
  void _loadFromPrefs() {
    _highScore = _prefs.getInt(_highScoreKey) ?? 0;
    _totalScore = _prefs.getInt(_totalScoreKey) ?? 0;
    _totalEggsDropped = _prefs.getInt(_totalEggsDroppedKey) ?? 0;
    _totalTargetsHit = _prefs.getInt(_totalTargetsHitKey) ?? 0;
    _totalGamesPlayed = _prefs.getInt(_totalGamesPlayedKey) ?? 0;
    _maxCombo = _prefs.getInt(_maxComboKey) ?? 0;
    _soundEnabled = _prefs.getBool(_soundEnabledKey) ?? true;
    _musicEnabled = _prefs.getBool(_musicEnabledKey) ?? true;
    _adsRemoved = _prefs.getBool(_adsRemovedKey) ?? false;
    _unlockedChickens = _prefs.getStringList(_unlockedChickensKey) ?? ['default'];
    _selectedChicken = _prefs.getString(_selectedChickenKey) ?? 'default';
    notifyListeners();
  }
  
  Future<void> _saveToPrefs() async {
    await _prefs.setInt(_highScoreKey, _highScore);
    await _prefs.setInt(_totalScoreKey, _totalScore);
    await _prefs.setInt(_totalEggsDroppedKey, _totalEggsDropped);
    await _prefs.setInt(_totalTargetsHitKey, _totalTargetsHit);
    await _prefs.setInt(_totalGamesPlayedKey, _totalGamesPlayed);
    await _prefs.setInt(_maxComboKey, _maxCombo);
    await _prefs.setBool(_soundEnabledKey, _soundEnabled);
    await _prefs.setBool(_musicEnabledKey, _musicEnabled);
    await _prefs.setBool(_adsRemovedKey, _adsRemoved);
    await _prefs.setStringList(_unlockedChickensKey, _unlockedChickens);
    await _prefs.setString(_selectedChickenKey, _selectedChicken);
  }
  
  void startNewGame() {
    _currentScore = 0;
    _currentCombo = 0;
    _currentEggsDropped = 0;
    _currentHits = 0;
    _currentLives = 5; // Start with 5 lives
    _currentMisses = 0;
    notifyListeners();
  }
  
  void addScore(int points) {
    _currentScore += points;
    if (_currentScore < 0) _currentScore = 0;
    notifyListeners();
  }
  
  void incrementCombo() {
    _currentCombo++;
    if (_currentCombo > _maxCombo) {
      _maxCombo = _currentCombo;
    }
    notifyListeners();
  }
  
  void resetCombo() {
    _currentCombo = 0;
    notifyListeners();
  }
  
  void recordEggDrop() {
    _currentEggsDropped++;
    _totalEggsDropped++;
    notifyListeners();
  }
  
  void recordHit() {
    _currentHits++;
    _totalTargetsHit++;
    notifyListeners();
  }
  
  // NEW: Called when an egg misses (hits ground without hitting target)
  void recordMiss() {
    _currentMisses++;
    _currentLives--;
    resetCombo();
    notifyListeners();
  }
  
  // NEW: Add a life (bonus)
  void addLife() {
    _currentLives++;
    notifyListeners();
  }
  
  Future<bool> endGame() async {
    _totalGamesPlayed++;
    _totalScore += _currentScore;
    bool isNewHighScore = _currentScore > _highScore;
    
    if (isNewHighScore) {
      _highScore = _currentScore;
    }
    
    await _saveToPrefs();
    notifyListeners();
    
    return isNewHighScore;
  }
  
  void toggleSound() {
    _soundEnabled = !_soundEnabled;
    _saveToPrefs();
    notifyListeners();
  }
  
  void toggleMusic() {
    _musicEnabled = !_musicEnabled;
    _saveToPrefs();
    notifyListeners();
  }
  
  void setAdsRemoved(bool removed) {
    _adsRemoved = removed;
    _saveToPrefs();
    notifyListeners();
  }
  
  void unlockChicken(String chickenId) {
    if (!_unlockedChickens.contains(chickenId)) {
      _unlockedChickens.add(chickenId);
      _saveToPrefs();
      notifyListeners();
    }
  }
  
  void selectChicken(String chickenId) {
    if (_unlockedChickens.contains(chickenId)) {
      _selectedChicken = chickenId;
      _saveToPrefs();
      notifyListeners();
    }
  }
  
  Future<void> resetAllData() async {
    _highScore = 0;
    _totalScore = 0;
    _totalEggsDropped = 0;
    _totalTargetsHit = 0;
    _totalGamesPlayed = 0;
    _maxCombo = 0;
    _unlockedChickens = ['default'];
    _selectedChicken = 'default';
    await _saveToPrefs();
    notifyListeners();
  }
}
