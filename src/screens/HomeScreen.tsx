import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { GradientButton } from '../components/GradientButton';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { useImagePicker } from '../hooks/useImagePicker';

interface Props {
  navigation: any;
}

export function HomeScreen({ navigation }: Props) {
  const { image, isLoading, pickFromGallery, pickFromCamera, clearImage } =
    useImagePicker();

  const handleContinue = () => {
    if (image) {
      navigation.navigate('StyleSelection', { imageUri: image });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={[COLORS.background, '#16162A']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>✨ ClipArt AI</Text>
            <Text style={styles.subtitle}>
              Transform your photos into stunning clipart
            </Text>
          </View>

          {/* Upload Area */}
          <View style={styles.uploadSection}>
            {isLoading ? (
              <View style={styles.previewContainer}>
                <SkeletonLoader
                  width={280}
                  height={280}
                  borderRadius={RADIUS.xl}
                />
              </View>
            ) : image ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: image }} style={styles.preview} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={clearImage}
                  activeOpacity={0.7}
                >
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
                <View style={styles.previewBadge}>
                  <Text style={styles.previewBadgeText}>Ready to transform</Text>
                </View>
              </View>
            ) : (
              <View style={styles.uploadArea}>
                <View style={styles.uploadIconContainer}>
                  <Text style={styles.uploadIcon}>📷</Text>
                </View>
                <Text style={styles.uploadTitle}>Upload Your Photo</Text>
                <Text style={styles.uploadHint}>
                  Choose a clear photo of yourself for best results
                </Text>

                <View style={styles.uploadButtons}>
                  <TouchableOpacity
                    style={styles.uploadOption}
                    onPress={pickFromCamera}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.optionIcon}>📸</Text>
                    <Text style={styles.optionText}>Camera</Text>
                  </TouchableOpacity>

                  <View style={styles.divider} />

                  <TouchableOpacity
                    style={styles.uploadOption}
                    onPress={pickFromGallery}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.optionIcon}>🖼️</Text>
                    <Text style={styles.optionText}>Gallery</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Continue Button */}
          {image && (
            <View style={styles.continueSection}>
              <GradientButton
                title="Choose Styles"
                onPress={handleContinue}
                size="large"
                icon="🎨"
              />

              <View style={styles.changePhotoRow}>
                <TouchableOpacity onPress={pickFromGallery} activeOpacity={0.7}>
                  <Text style={styles.changePhotoText}>Change photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Features */}
          {!image && (
            <View style={styles.features}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎨</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>5 Unique Styles</Text>
                  <Text style={styles.featureDesc}>
                    Cartoon, Anime, Flat Art, Pixel Art, Sketch
                  </Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>⚡</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Batch Generation</Text>
                  <Text style={styles.featureDesc}>
                    Generate all styles at once
                  </Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>💾</Text>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Save & Share</Text>
                  <Text style={styles.featureDesc}>
                    Download PNG or share instantly
                  </Text>
                </View>
              </View>
            </View>
          )}
        </LinearGradient>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  logo: {
    fontSize: 32,
    color: COLORS.text,
    ...FONTS.bold,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    ...FONTS.regular,
    textAlign: 'center',
  },
  uploadSection: {
    flex: 1,
    justifyContent: 'center',
  },
  uploadArea: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surfaceLight,
    borderStyle: 'dashed',
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  uploadIcon: {
    fontSize: 36,
  },
  uploadTitle: {
    color: COLORS.text,
    fontSize: 20,
    ...FONTS.bold,
    marginBottom: SPACING.xs,
  },
  uploadHint: {
    color: COLORS.textSecondary,
    fontSize: 14,
    ...FONTS.regular,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  uploadButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  uploadOption: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceHighlight,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  optionIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  optionText: {
    color: COLORS.text,
    fontSize: 14,
    ...FONTS.medium,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.surfaceLight,
  },
  previewContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  preview: {
    width: 280,
    height: 280,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surfaceLight,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: 30,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  removeText: {
    color: '#FFF',
    fontSize: 16,
    ...FONTS.bold,
  },
  previewBadge: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
  },
  previewBadgeText: {
    color: COLORS.success,
    fontSize: 14,
    ...FONTS.medium,
  },
  continueSection: {
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  changePhotoRow: {
    alignItems: 'center',
  },
  changePhotoText: {
    color: COLORS.primaryLight,
    fontSize: 14,
    ...FONTS.medium,
  },
  features: {
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: COLORS.text,
    fontSize: 16,
    ...FONTS.semibold,
  },
  featureDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    ...FONTS.regular,
  },
});
