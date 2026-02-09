import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/Colors';
import { generatePattern, generatePatternFromImage, getFallbackPattern } from '../utils/api';
import { savePattern } from '../utils/storage';
import { usePro } from '../hooks/usePro';
import WoollyMascot from '../components/WoollyMascot';
import AdBanner from '../components/AdBanner';
import UpgradeModal from '../components/UpgradeModal';

// Image quality for picker (0-1). Lower = smaller upload, faster API calls.
// 0.3 balances quality for AI pattern recognition vs. memory usage.
const IMAGE_PICKER_QUALITY = 0.3;

// Milliseconds between rotating loading messages during pattern generation
const LOADING_MESSAGE_INTERVAL_MS = 2000;

const IDEA_SUGGESTIONS = [
  { emoji: '🐻', text: 'A cute teddy bear' },
  { emoji: '🌸', text: 'A flower for mom' },
  { emoji: '🦋', text: 'A colorful butterfly' },
  { emoji: '🐙', text: 'A silly octopus' },
  { emoji: '🧣', text: 'A cozy scarf' },
  { emoji: '🎀', text: 'A pretty bow' },
];

export default function CreateScreen() {
  const { isPro } = usePro();
  const [idea, setIdea] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleSuggestionPress = (suggestion: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIdea(suggestion);
    setSelectedImage(null);
    setImageBase64(null);
  };

  const handleProFeaturePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowUpgradeModal(true);
  };

  const pickImage = async () => {
    if (!isPro) {
      handleProFeaturePress();
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos to upload an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: IMAGE_PICKER_QUALITY,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || null);
      setIdea('');
    }
  };

  const takePhoto = async () => {
    if (!isPro) {
      handleProFeaturePress();
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: IMAGE_PICKER_QUALITY,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || null);
      setIdea('');
    }
  };

  const clearImage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedImage(null);
    setImageBase64(null);
  };

  const handleGenerate = async () => {
    if (!idea.trim() && !imageBase64) {
      Alert.alert('Oops!', 'Please tell me what you want to make! 🧶');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    
    const messages = [
      "Woolly is thinking really hard... 🤔",
      "Looking at the details... 👀",
      "Counting all the stitches... 🧮",
      "Picking the best colors... 🎨",
      "Almost ready! ✨",
    ];
    
    let messageIndex = 0;
    setLoadingMessage(messages[0]);
    
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, LOADING_MESSAGE_INTERVAL_MS);

    try {
      let pattern;

      if (imageBase64 && isPro) {
        pattern = await generatePatternFromImage(imageBase64, idea);
      } else {
        pattern = await generatePattern(idea);
      }

      await savePattern(pattern);

      setIsLoading(false);

      router.replace({
        pathname: '/pattern',
        params: { patternId: pattern.id },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Pattern generation error:', message);

      Alert.alert(
        'Hmm...',
        'Woolly had trouble connecting. Want to use a practice pattern instead?',
        [
          {
            text: 'Yes please!',
            onPress: async () => {
              const fallbackPattern = getFallbackPattern(idea || 'My Project');
              await savePattern(fallbackPattern);
              setIsLoading(false);
              router.replace({
                pathname: '/pattern',
                params: { patternId: fallbackPattern.id },
              });
            },
          },
          {
            text: 'Try again',
            onPress: () => setIsLoading(false),
            style: 'cancel',
          },
        ]
      );
    } finally {
      clearInterval(messageInterval);
    }
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#FFF5F8', '#FFE5EC', '#FFD6E0']}
        style={styles.loadingContainer}
      >
        <Text style={styles.loadingEmoji}>🐑💭</Text>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{loadingMessage}</Text>
        <View style={styles.loadingYarn}>
          <Text style={styles.yarnEmoji}>🧶</Text>
          <Text style={styles.yarnEmoji}>🧶</Text>
          <Text style={styles.yarnEmoji}>🧶</Text>
        </View>
      </LinearGradient>
    );
  }

  const hasInput = idea.trim() || imageBase64;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#FFF5F8', '#FFE5EC']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Woolly helper */}
          <View style={styles.woollySection}>
            <WoollyMascot 
              message={selectedImage 
                ? "Ooh, nice picture! I'll create a pattern inspired by this! 📸" 
                : "What would you like to make? Type an idea below! 🎨"
              }
              emotion="excited"
              size="medium"
            />
          </View>

          {/* Pro Image buttons */}
          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity
              style={[styles.imageButton, !isPro && styles.imageButtonLocked]}
              onPress={takePhoto}
              activeOpacity={0.7}
            >
              <Text style={styles.imageButtonEmoji}>📷</Text>
              <Text style={styles.imageButtonText}>Take Photo</Text>
              {!isPro && (
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.imageButton, !isPro && styles.imageButtonLocked]}
              onPress={pickImage}
              activeOpacity={0.7}
            >
              <Text style={styles.imageButtonEmoji}>🖼️</Text>
              <Text style={styles.imageButtonText}>Upload Picture</Text>
              {!isPro && (
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Selected image preview (Pro only) */}
          {selectedImage && isPro && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={clearImage}>
                <Text style={styles.removeImageText}>✕ Remove</Text>
              </TouchableOpacity>
              
              <TextInput
                style={styles.imageDescriptionInput}
                placeholder="Add extra details (optional)..."
                placeholderTextColor={Colors.textMuted}
                value={idea}
                onChangeText={setIdea}
                maxLength={100}
              />
            </View>
          )}

          {/* Text input section */}
          {!selectedImage && (
            <>
              <View style={styles.orDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.orText}>type your idea</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>✨ My Crochet Idea ✨</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="I want to make..."
                  placeholderTextColor={Colors.textMuted}
                  value={idea}
                  onChangeText={setIdea}
                  multiline
                  maxLength={200}
                />
                <Text style={styles.charCount}>{idea.length}/200</Text>
              </View>

              {/* Suggestions */}
              <View style={styles.suggestionsSection}>
                <Text style={styles.suggestionsTitle}>💡 Need ideas? Try these!</Text>
                <View style={styles.suggestionsGrid}>
                  {IDEA_SUGGESTIONS.map((suggestion) => (
                    <TouchableOpacity
                      key={`${suggestion.emoji}-${suggestion.text}`}
                      style={styles.suggestionChip}
                      onPress={() => handleSuggestionPress(suggestion.text)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.suggestionEmoji}>{suggestion.emoji}</Text>
                      <Text style={styles.suggestionText}>{suggestion.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Generate button */}
          <TouchableOpacity
            style={[styles.generateButton, !hasInput && styles.generateButtonDisabled]}
            onPress={handleGenerate}
            disabled={!hasInput}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={hasInput ? [Colors.primary, Colors.primaryDark] : ['#ccc', '#aaa']}
              style={styles.generateButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.generateButtonText}>
                🪄 Create My Pattern! 🪄
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Inline ad for free users */}
          {!isPro && (
            <AdBanner 
              placement="inline" 
              onUpgradePress={() => setShowUpgradeModal(true)}
            />
          )}
        </ScrollView>

        {/* Upgrade Modal */}
        <UpgradeModal
          visible={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  loadingYarn: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  yarnEmoji: {
    fontSize: 32,
  },
  woollySection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  imageButton: {
    backgroundColor: Colors.white,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.blue,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    position: 'relative',
  },
  imageButtonLocked: {
    borderColor: Colors.textMuted,
    opacity: 0.8,
  },
  imageButtonEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  proBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.yellow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.text,
  },
  imagePreviewContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 12,
  },
  removeImageButton: {
    backgroundColor: Colors.error + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  removeImageText: {
    color: Colors.error,
    fontWeight: '600',
  },
  imageDescriptionInput: {
    width: '100%',
    backgroundColor: Colors.cream,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.primaryLight,
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  textInput: {
    fontSize: 18,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    padding: 16,
    backgroundColor: Colors.cream,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: 8,
  },
  suggestionsSection: {
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.blueLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  generateButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  generateButtonDisabled: {
    shadowOpacity: 0.1,
  },
  generateButtonGradient: {
    paddingVertical: 22,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  generateButtonText: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
});
