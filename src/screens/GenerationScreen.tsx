import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { ResultCard } from '../components/ResultCard';
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
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save images.');
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('ClipArt AI', asset, false);
      Alert.alert('Saved!', 'Image saved to your gallery in "ClipArt AI" album.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save image.');
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
          {results.map((result) => (
            <ResultCard
              key={result.styleId}
              result={result}
              onDownload={handleDownload}
              onShare={handleShare}
              onRetry={handleRetry}
            />
          ))}
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
