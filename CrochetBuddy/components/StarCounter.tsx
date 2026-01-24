import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface StarCounterProps {
  count: number;
}

export default function StarCounter({ count }: StarCounterProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.starEmoji}>⭐</Text>
      <Text style={styles.countText}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.yellow,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  starEmoji: {
    fontSize: 24,
    marginRight: 6,
  },
  countText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
});
