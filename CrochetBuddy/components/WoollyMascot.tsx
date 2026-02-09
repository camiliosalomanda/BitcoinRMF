import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';

interface WoollyMascotProps {
  message: string;
  emotion?: 'happy' | 'excited' | 'thinking' | 'celebrating';
  size?: 'small' | 'medium' | 'large';
}

const { width } = Dimensions.get('window');

// Horizontal padding subtracted from screen width per size variant
const BUBBLE_PADDING: Record<string, number> = {
  small: 120,  // Narrow bubble alongside small mascot
  medium: 80,
  large: 60,   // Wide bubble for prominent display
};

const EMOJI_SIZE: Record<string, number> = {
  small: 40,
  medium: 60,
  large: 80,
};

const EMOTION_EMOJI: Record<string, string> = {
  happy: '🐑',
  excited: '🐑✨',
  thinking: '🐑💭',
  celebrating: '🐑🎉',
};

export default function WoollyMascot({
  message,
  emotion = 'happy',
  size = 'medium'
}: WoollyMascotProps) {
  const emojiSize = EMOJI_SIZE[size] ?? EMOJI_SIZE.medium;
  const bubbleWidth = width - (BUBBLE_PADDING[size] ?? BUBBLE_PADDING.medium);
  const emoji = EMOTION_EMOJI[emotion] ?? EMOTION_EMOJI.happy;

  return (
    <View style={[styles.container, size === 'small' && styles.containerSmall]}>
      <View style={styles.woollyContainer}>
        <View style={styles.woollyBody}>
          <Text style={[styles.woollyEmoji, { fontSize: emojiSize }]}>
            {emoji}
          </Text>
        </View>
        <View style={styles.yarnDecor}>
          <Text style={styles.yarnEmoji}>🧶</Text>
        </View>
      </View>

      <View style={[styles.speechBubble, { maxWidth: bubbleWidth }]}>
        <View style={styles.bubbleArrow} />
        <Text style={[styles.messageText, size === 'large' && styles.messageLarge]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  containerSmall: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  woollyContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  woollyBody: {
    backgroundColor: Colors.cream,
    borderRadius: 100,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  woollyEmoji: {
    textAlign: 'center',
  },
  yarnDecor: {
    position: 'absolute',
    bottom: -5,
    right: -10,
  },
  yarnEmoji: {
    fontSize: 20,
  },
  speechBubble: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bubbleArrow: {
    position: 'absolute',
    top: -10,
    left: 30,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.white,
  },
  messageText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  messageLarge: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
  },
});
