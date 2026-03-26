import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { CLIPART_STYLES } from '../constants/styles';
import { ResultCard } from '../components/ResultCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { GradientButton } from '../components/GradientButton';
import { useGeneration } from '../hooks/useGeneration';

interface Props {
  navigation: any;
  route: any;
}

export function GenerationScreen({ navigation, route }: Props) {
  const { imageUri, selectedStyles } = route.params;
  const { results, isGenerating, generateAll, generateSingle, clearResults } =
    useGeneration();

  useEffect(() => {
    generateAll(imageUri, selectedStyles);
  }, []);

  const handleDownload = useCallback(async (uri: string) => {
    try {
      // Try MediaLibrary first (works in dev builds)
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save images.');
        return;
      }

      const filename = `clipart_${Date.now()}.png`;
      const destFile = new File(Paths.document, filename);
      const sourceFile = new File(uri);
      await sourceFile.copy(destFile);

      const asset = await MediaLibrary.createAssetAsync(destFile.uri);
      try {
        await MediaLibrary.createAlbumAsync('ClipArt AI', asset, false);
      } catch {}
      try { await destFile.delete(); } catch {}

      Alert.alert('Saved!', 'Image saved to your gallery.');
    } catch {
      // Fallback for Expo Go — use share sheet to let user save manually
      try {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Save your clipart',
        });
      } catch {
        Alert.alert('Error', 'Failed to save image.');
      }
    }
  }, []);

  const handleShare = useCallback(async (uri: string) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device.');
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your clipart',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share image.');
    }
  }, []);

  const handleRetry = useCallback(
    (styleId: string) => {
      generateSingle(imageUri, styleId);
    },
    [imageUri, generateSingle]
  );

  const completedCount = results.filter((r) => r.status === 'completed').length;
  const totalCount = results.length;

  const handleDownloadAll = async () => {
    const completed = results.filter(
      (r) => r.status === 'completed' && r.imageUrl
    );
    for (const result of completed) {
      await handleDownload(result.imageUrl!);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isGenerating ? 'Generating...' : 'Your Clipart'}
            </Text>
            <Text style={styles.subtitle}>
              {isGenerating
                ? `${completedCount} of ${totalCount} completed`
                : `${completedCount} clipart${completedCount !== 1 ? 's' : ''} generated`}
            </Text>

            {/* Progress bar */}
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                  },
                ]}
              />
            </View>
          </View>

          {/* Results */}
          {results.length > 0
            ? results.map((result) => (
                <ResultCard
                  key={result.styleId}
                  result={result}
                  onDownload={handleDownload}
                  onShare={handleShare}
                  onRetry={handleRetry}
                />
              ))
            : /* Initial skeleton placeholders before results populate */
              selectedStyles.map((styleId: string) => {
                const artStyle = CLIPART_STYLES.find((s) => s.id === styleId);
                return (
                  <View key={styleId} style={styles.skeletonCard}>
                    <View style={styles.skeletonHeader}>
                      <Text style={styles.skeletonIcon}>
                        {artStyle?.icon || '?'}
                      </Text>
                      <SkeletonLoader
                        width={100}
                        height={18}
                        borderRadius={RADIUS.sm}
                      />
                    </View>
                    <SkeletonLoader height={280} borderRadius={0} />
                  </View>
                );
              })}
        </ScrollView>

        {/* Bottom Actions */}
        {!isGenerating && completedCount > 0 && (
          <View style={styles.bottomActions}>
            <GradientButton
              title={`Save All (${completedCount})`}
              onPress={handleDownloadAll}
              size="medium"
              icon="💾"
              variant="secondary"
            />
            <GradientButton
              title="New Photo"
              onPress={() => {
                clearResults();
                navigation.popToTop();
              }}
              size="medium"
              icon="📷"
            />
          </View>
        )}
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
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 120,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    ...FONTS.bold,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    ...FONTS.regular,
    marginTop: SPACING.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 2,
    marginTop: SPACING.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 2,
  },
  skeletonCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
    gap: SPACING.sm,
  },
  skeletonIcon: {
    fontSize: 24,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.background + 'F0',
    flexDirection: 'row',
    gap: SPACING.md,
  },
});
