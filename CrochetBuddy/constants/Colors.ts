// Kid-friendly color palette for Crochet Buddy
export const Colors = {
  // Primary colors
  primary: '#FF6B9D',
  primaryLight: '#FFB3CB',
  primaryDark: '#E84C7A',
  
  // Accent colors
  yellow: '#FFD93D',
  yellowLight: '#FFEB85',
  blue: '#6BC5E8',
  blueLight: '#A8DCF0',
  green: '#7ED957',
  greenLight: '#B5E89D',
  purple: '#B794F6',
  purpleLight: '#D4C4FA',
  orange: '#FFB347',
  
  // Neutrals
  cream: '#FFF9E6',
  background: '#FFF5F8',
  white: '#FFFFFF',
  text: '#4A4A4A',
  textLight: '#7A7A7A',
  textMuted: '#9A9A9A',
  
  // Semantic
  success: '#7ED957',
  error: '#FF6B6B',
  warning: '#FFB347',
};

// Stitch type colors
export const StitchColors: Record<string, string> = {
  chain: '#FFD93D',
  slip: '#B794F6',
  single: '#6BC5E8',
  half_double: '#7ED957',
  double: '#FF6B9D',
  treble: '#FFB347',
  magic_ring: '#FF6B6B',
  increase: '#7ED957',
  decrease: '#FF6B6B',
};

// Kid-friendly stitch names
export const StitchNames: Record<string, { kidName: string; emoji: string }> = {
  chain: { kidName: 'Loop Train', emoji: '🚂' },
  slip: { kidName: 'Sneak Stitch', emoji: '🐱' },
  single: { kidName: 'Simple Hug', emoji: '🤗' },
  half_double: { kidName: 'Medium Magic', emoji: '✨' },
  double: { kidName: 'Tall Tower', emoji: '🏰' },
  treble: { kidName: 'Super Tall', emoji: '🦒' },
  magic_ring: { kidName: 'Magic Circle', emoji: '🔮' },
  increase: { kidName: 'Growing Up', emoji: '📈' },
  decrease: { kidName: 'Shrinking Down', emoji: '📉' },
};

export default Colors;
