import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS, RADIUS, SPACING, FONTS } from '../constants/theme';
import { CLIPART_STYLES } from '../constants/styles';
import { GenerationResult } from '../types';
import { SkeletonLoader } from './SkeletonLoader';

interface Props {
  result: GenerationResult;
  onDownload: (uri: string) => void;
  onShare: (uri: string) => void;
  onRetry: (styleId: string) => void;
}

export function ResultCard({ result, onDownload, onShare, onRetry }: Props) {
  const style = CLIPART_STYLES.find((s) => s.id === result.styleId);
  if (!style) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{style.icon}</Text>
        <Text style={styles.title}>{style.name}</Text>
        {result.status === 'completed' && (
          <View style={[styles.statusBadge, { backgroundColor: COLORS.success }]}>
            <Text style={styles.statusText}>Done</Text>
          </View>
        )}
        {result.status === 'generating' && (
          <View style={[styles.statusBadge, { backgroundColor: COLORS.warning }]}>
            <Text style={styles.statusText}>Generating...</Text>
          </View>
        )}
        {result.status === 'error' && (
          <View style={[styles.statusBadge, { backgroundColor: COLORS.error }]}>
            <Text style={styles.statusText}>Failed</Text>
          </View>
        )}
      </View>

      {result.status === 'pending' || result.status === 'generating' ? (
        <View style={styles.imageContainer}>
          <SkeletonLoader height={280} borderRadius={RADIUS.md} />
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingEmoji}>
              {result.status === 'pending' ? '⏳' : '🎨'}
            </Text>
            <Text style={styles.loadingText}>
              {result.status === 'pending'
                ? 'Waiting in queue...'
                : 'Creating your clipart...'}
            </Text>
          </View>
        </View>
      ) : result.status === 'completed' && result.imageUrl ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: result.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDownload(result.imageUrl!)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>💾</Text>
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onShare(result.imageUrl!)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>😔</Text>
          <Text style={styles.errorText}>
            {result.error || 'Something went wrong'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => onRetry(result.styleId)}
            activeOpacity={0.7}
          >
            <Text style={styles.retryText}>🔄 Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  icon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    ...FONTS.semibold,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    ...FONTS.medium,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.surfaceLight,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    ...FONTS.medium,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.round,
    gap: SPACING.xs,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionText: {
    color: COLORS.text,
    fontSize: 14,
    ...FONTS.medium,
  },
  errorContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  errorText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.round,
  },
  retryText: {
    color: COLORS.text,
    fontSize: 14,
    ...FONTS.medium,
  },
});
