import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';
import { PatternData } from '../constants/Types';
import { getSavedPatterns, deletePattern } from '../utils/storage';
import WoollyMascot from '../components/WoollyMascot';

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'Easy Peasy': return Colors.green;
    case 'A Little Tricky': return Colors.yellow;
    case 'Challenge Mode': return Colors.orange;
    default: return Colors.blue;
  }
};

const getProgressPercent = (pattern: PatternData): number => {
  if (pattern.steps.length === 0) return 0;
  return Math.round((pattern.completedSteps / pattern.steps.length) * 100);
};

const PatternCard = React.memo(function PatternCard({
  pattern,
  onPress,
  onLongPress,
}: {
  pattern: PatternData;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const progress = getProgressPercent(pattern);
  const diffColor = getDifficultyColor(pattern.difficulty);

  return (
    <TouchableOpacity
      style={styles.patternCard}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.patternTitle} numberOfLines={1}>
          {pattern.title}
        </Text>
        {pattern.isComplete && (
          <Text style={styles.completeEmoji}>✅</Text>
        )}
      </View>

      <Text style={styles.patternDescription} numberOfLines={2}>
        {pattern.description}
      </Text>

      <View style={styles.cardMeta}>
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: diffColor + '30' }
          ]}
        >
          <Text style={[styles.difficultyText, { color: diffColor }]}>
            {pattern.difficulty}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.stepsText}>
          {pattern.completedSteps}/{pattern.steps.length} steps
        </Text>
        <Text style={styles.starsText}>⭐ {pattern.totalStars}</Text>
      </View>
    </TouchableOpacity>
  );
});

export default function MyPatternsScreen() {
  const [patterns, setPatterns] = useState<PatternData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    const saved = await getSavedPatterns();
    setPatterns(saved);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPatterns();
    setRefreshing(false);
  }, []);

  const handlePatternPress = useCallback((pattern: PatternData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/pattern',
      params: { patternId: pattern.id },
    });
  }, []);

  const handleDeletePattern = useCallback((pattern: PatternData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Pattern?',
      `Are you sure you want to delete "${pattern.title}"?`,
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePattern(pattern.id);
            await loadPatterns();
          },
        },
      ]
    );
  }, []);

  const renderPattern = useCallback(({ item }: { item: PatternData }) => (
    <PatternCard
      pattern={item}
      onPress={() => handlePatternPress(item)}
      onLongPress={() => handleDeletePattern(item)}
    />
  ), [handlePatternPress, handleDeletePattern]);

  const keyExtractor = useCallback((item: PatternData) => item.id, []);

  if (patterns.length === 0) {
    return (
      <LinearGradient
        colors={['#FFF5F8', '#FFE5EC']}
        style={styles.emptyContainer}
      >
        <WoollyMascot
          message="You haven't made any patterns yet! Let's create your first one! 🧶"
          emotion="thinking"
          size="large"
        />
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/create')}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.createButtonGradient}
          >
            <Text style={styles.createButtonText}>✨ Create First Pattern ✨</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const ListHeader = (
    <View style={styles.statsHeader}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{patterns.length}</Text>
        <Text style={styles.statLabel}>Patterns</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {patterns.filter(p => p.isComplete).length}
        </Text>
        <Text style={styles.statLabel}>Completed</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {patterns.reduce((sum, p) => sum + p.totalStars, 0)}
        </Text>
        <Text style={styles.statLabel}>⭐ Stars</Text>
      </View>
    </View>
  );

  const ListFooter = (
    <View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/create')}
      >
        <Text style={styles.addButtonText}>+ Create New Pattern</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </View>
  );

  return (
    <LinearGradient
      colors={['#FFF5F8', '#FFE5EC']}
      style={styles.container}
    >
      <FlatList
        data={patterns}
        renderItem={renderPattern}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.scrollContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  scrollContent: {
    padding: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.cream,
    marginHorizontal: 8,
  },
  patternCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  patternTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  completeEmoji: {
    fontSize: 24,
    marginLeft: 8,
  },
  patternDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.cream,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.green,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textLight,
    minWidth: 40,
    textAlign: 'right',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepsText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  starsText: {
    fontSize: 14,
    color: Colors.yellow,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: Colors.cream,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '600',
  },
  createButton: {
    marginTop: 32,
    borderRadius: 30,
    overflow: 'hidden',
  },
  createButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
