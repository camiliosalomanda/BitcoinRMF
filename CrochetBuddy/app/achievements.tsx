import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Achievement, UserProgress } from '../constants/Types';
import { getUserProgress } from '../utils/storage';

export default function AchievementsScreen() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const data = await getUserProgress();
    setProgress(data);
  };

  const getProgressForAchievement = (achievement: Achievement): number => {
    if (!progress) return 0;
    
    let current = 0;
    switch (achievement.requirement.type) {
      case 'patterns_completed':
        current = progress.patternsCompleted;
        break;
      case 'stars_earned':
        current = progress.totalStars;
        break;
      case 'streak_days':
        current = progress.currentStreak;
        break;
      case 'steps_completed':
        current = progress.stepsCompleted;
        break;
    }
    
    return Math.min(current / achievement.requirement.count, 1);
  };

  if (!progress) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading achievements...</Text>
      </View>
    );
  }

  const unlockedCount = progress.achievements.filter(a => a.unlocked).length;
  const totalCount = progress.achievements.length;

  return (
    <LinearGradient
      colors={['#FFF5F8', '#FFE5EC']}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats header */}
        <View style={styles.statsCard}>
          <View style={styles.mainStat}>
            <Text style={styles.mainStatNumber}>
              {unlockedCount}/{totalCount}
            </Text>
            <Text style={styles.mainStatLabel}>Achievements Unlocked</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>⭐</Text>
              <Text style={styles.statNumber}>{progress.totalStars}</Text>
              <Text style={styles.statLabel}>Stars</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>🧶</Text>
              <Text style={styles.statNumber}>{progress.patternsCompleted}</Text>
              <Text style={styles.statLabel}>Patterns</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statNumber}>{progress.currentStreak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </View>

        {/* Achievements list */}
        <Text style={styles.sectionTitle}>🏆 All Achievements</Text>
        
        {progress.achievements.map((achievement) => {
          const progressPercent = getProgressForAchievement(achievement);
          const isUnlocked = achievement.unlocked;
          
          return (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                isUnlocked && styles.achievementUnlocked,
              ]}
            >
              <View style={styles.achievementIcon}>
                <Text style={[
                  styles.achievementEmoji,
                  !isUnlocked && styles.achievementLocked,
                ]}>
                  {isUnlocked ? achievement.emoji : '🔒'}
                </Text>
              </View>
              
              <View style={styles.achievementContent}>
                <Text style={[
                  styles.achievementTitle,
                  !isUnlocked && styles.achievementTitleLocked,
                ]}>
                  {achievement.title}
                </Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
                
                {!isUnlocked && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill,
                          { width: `${progressPercent * 100}%` }
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.round(progressPercent * 100)}%
                    </Text>
                  </View>
                )}
                
                {isUnlocked && (
                  <Text style={styles.unlockedDate}>
                    ✨ Unlocked!
                  </Text>
                )}
              </View>
            </View>
          );
        })}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statsCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mainStat: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainStatNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  mainStatLabel: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    opacity: 0.7,
  },
  achievementUnlocked: {
    opacity: 1,
    borderWidth: 2,
    borderColor: Colors.yellow,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementEmoji: {
    fontSize: 32,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: Colors.textMuted,
  },
  achievementDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.cream,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.green,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textMuted,
    minWidth: 40,
    textAlign: 'right',
  },
  unlockedDate: {
    fontSize: 12,
    color: Colors.yellow,
    fontWeight: '500',
  },
});
