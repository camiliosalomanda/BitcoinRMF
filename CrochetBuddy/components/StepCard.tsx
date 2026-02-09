import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, StitchColors } from '../constants/Colors';
import { PatternStep } from '../constants/Types';

interface StepCardProps {
  step: PatternStep;
  stepNumber: number;
  isActive: boolean;
  isCompleted: boolean;
  onPress: () => void;
  onComplete: () => void;
}

export default function StepCard({
  step,
  stepNumber,
  isActive,
  isCompleted,
  onPress,
  onComplete,
}: StepCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View 
        style={[
          styles.container,
          isActive && styles.containerActive,
          isCompleted && styles.containerCompleted,
        ]}
      >
        {/* Step number badge */}
        <View style={[
          styles.stepBadge,
          isCompleted && styles.stepBadgeCompleted,
        ]}>
          {isCompleted ? (
            <Text style={styles.checkmark}>✓</Text>
          ) : (
            <Text style={styles.stepNumber}>{stepNumber}</Text>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[
            styles.title,
            isCompleted && styles.titleCompleted,
          ]}>
            {step.title}
          </Text>
          
          {isActive && (
            <>
              <Text style={styles.instruction}>
                {step.instruction}
              </Text>
              
              {/* Stitch tags */}
              {step.stitches.length > 0 && (
                <View style={styles.stitchesContainer}>
                  {step.stitches.map((stitch, index) => (
                    <View
                      key={`${stitch.abbreviation}-${index}`}
                      style={[
                        styles.stitchTag,
                        { backgroundColor: (StitchColors[stitch.fullName.replace(' ', '_')] || Colors.blue) + '30' }
                      ]}
                    >
                      <Text style={styles.stitchEmoji}>{stitch.emoji}</Text>
                      <Text style={styles.stitchName}>{stitch.kidName}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Stitch count */}
              {step.stitchCount && (
                <View style={styles.stitchCountContainer}>
                  <Text style={styles.stitchCountLabel}>Goal:</Text>
                  <Text style={styles.stitchCount}>{step.stitchCount}</Text>
                </View>
              )}
              
              {/* Visual tip */}
              {step.visualTip && (
                <View style={styles.visualTipContainer}>
                  <Text style={styles.visualTipLabel}>💡 Tip:</Text>
                  <Text style={styles.visualTip}>{step.visualTip}</Text>
                </View>
              )}
              
              {/* Complete button */}
              {!isCompleted && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={onComplete}
                  activeOpacity={0.8}
                >
                  <Text style={styles.completeButtonText}>
                    ✓ Done with this step!
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
          
          {!isActive && !isCompleted && (
            <Text style={styles.tapHint}>Tap to see instructions</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  containerActive: {
    borderWidth: 3,
    borderColor: Colors.primary,
    shadowOpacity: 0.15,
    elevation: 4,
  },
  containerCompleted: {
    backgroundColor: Colors.greenLight + '40',
    borderWidth: 2,
    borderColor: Colors.green,
  },
  stepBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepBadgeCompleted: {
    backgroundColor: Colors.green,
  },
  stepNumber: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  checkmark: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.green,
  },
  instruction: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  stitchesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  stitchTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  stitchEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  stitchName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  stitchCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cream,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  stitchCountLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginRight: 8,
  },
  stitchCount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  visualTipContainer: {
    backgroundColor: Colors.yellowLight + '50',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  visualTipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  visualTip: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  completeButton: {
    backgroundColor: Colors.green,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  completeButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  tapHint: {
    fontSize: 14,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
});
