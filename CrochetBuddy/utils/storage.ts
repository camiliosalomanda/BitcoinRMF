import AsyncStorage from '@react-native-async-storage/async-storage';
import { PatternData, UserProgress, Achievement } from '../constants/Types';

const STORAGE_KEYS = {
  USER_PROGRESS: '@crochet_buddy_progress',
  SAVED_PATTERNS: '@crochet_buddy_patterns',
};

// Default achievements
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_pattern',
    title: 'First Steps!',
    description: 'Complete your first pattern',
    emoji: '🎉',
    unlocked: false,
    requirement: { type: 'patterns_completed', count: 1 },
  },
  {
    id: 'five_patterns',
    title: 'Pattern Pro!',
    description: 'Complete 5 patterns',
    emoji: '🌟',
    unlocked: false,
    requirement: { type: 'patterns_completed', count: 5 },
  },
  {
    id: 'ten_patterns',
    title: 'Crochet Champion!',
    description: 'Complete 10 patterns',
    emoji: '🏆',
    unlocked: false,
    requirement: { type: 'patterns_completed', count: 10 },
  },
  {
    id: 'fifty_stars',
    title: 'Star Collector!',
    description: 'Earn 50 stars',
    emoji: '⭐',
    unlocked: false,
    requirement: { type: 'stars_earned', count: 50 },
  },
  {
    id: 'hundred_stars',
    title: 'Superstar!',
    description: 'Earn 100 stars',
    emoji: '🌠',
    unlocked: false,
    requirement: { type: 'stars_earned', count: 100 },
  },
];

// Default user progress
const DEFAULT_PROGRESS: UserProgress = {
  totalStars: 0,
  patternsCompleted: 0,
  stepsCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  achievements: DEFAULT_ACHIEVEMENTS,
  savedPatterns: [],
};

// Get user progress
export const getUserProgress = async (): Promise<UserProgress> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    if (data) {
      const parsed = JSON.parse(data);
      return { ...DEFAULT_PROGRESS, ...parsed };
    }
    return DEFAULT_PROGRESS;
  } catch (error) {
    console.error('Error loading progress:', error);
    return DEFAULT_PROGRESS;
  }
};

// Save user progress
export const saveUserProgress = async (progress: UserProgress): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};

// Get saved patterns
export const getSavedPatterns = async (): Promise<PatternData[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_PATTERNS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading patterns:', error);
    return [];
  }
};

// Save a pattern
export const savePattern = async (pattern: PatternData): Promise<void> => {
  try {
    const patterns = await getSavedPatterns();
    const existingIndex = patterns.findIndex(p => p.id === pattern.id);
    
    if (existingIndex >= 0) {
      patterns[existingIndex] = pattern;
    } else {
      patterns.unshift(pattern);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_PATTERNS, JSON.stringify(patterns));
  } catch (error) {
    console.error('Error saving pattern:', error);
  }
};

// Delete a pattern
export const deletePattern = async (patternId: string): Promise<void> => {
  try {
    const patterns = await getSavedPatterns();
    const filtered = patterns.filter(p => p.id !== patternId);
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_PATTERNS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting pattern:', error);
  }
};

// Add stars and check achievements
export const addStars = async (count: number): Promise<Achievement[]> => {
  try {
    const progress = await getUserProgress();
    progress.totalStars += count;
    
    const newlyUnlocked: Achievement[] = [];
    
    progress.achievements = progress.achievements.map(achievement => {
      if (achievement.unlocked) return achievement;
      
      let shouldUnlock = false;
      
      if (achievement.requirement.type === 'stars_earned') {
        shouldUnlock = progress.totalStars >= achievement.requirement.count;
      } else if (achievement.requirement.type === 'patterns_completed') {
        shouldUnlock = progress.patternsCompleted >= achievement.requirement.count;
      }
      
      if (shouldUnlock) {
        const unlocked = { ...achievement, unlocked: true, unlockedAt: new Date().toISOString() };
        newlyUnlocked.push(unlocked);
        return unlocked;
      }
      
      return achievement;
    });
    
    await saveUserProgress(progress);
    return newlyUnlocked;
  } catch (error) {
    console.error('Error adding stars:', error);
    return [];
  }
};

// Mark pattern as complete
export const completePattern = async (patternId: string): Promise<Achievement[]> => {
  try {
    const progress = await getUserProgress();
    progress.patternsCompleted += 1;
    
    const newlyUnlocked: Achievement[] = [];
    
    progress.achievements = progress.achievements.map(achievement => {
      if (achievement.unlocked) return achievement;
      
      if (
        achievement.requirement.type === 'patterns_completed' &&
        progress.patternsCompleted >= achievement.requirement.count
      ) {
        const unlocked = { ...achievement, unlocked: true, unlockedAt: new Date().toISOString() };
        newlyUnlocked.push(unlocked);
        return unlocked;
      }
      
      return achievement;
    });
    
    await saveUserProgress(progress);
    return newlyUnlocked;
  } catch (error) {
    console.error('Error completing pattern:', error);
    return [];
  }
};

// Clear all data
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_PROGRESS,
      STORAGE_KEYS.SAVED_PATTERNS,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};
