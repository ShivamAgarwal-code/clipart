import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, RADIUS, SPACING, FONTS } from '../constants/theme';
import { ClipArtStyle } from '../constants/styles';

interface Props {
  style: ClipArtStyle;
  selected: boolean;
  onPress: () => void;
}

export function StyleCard({ style, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        selected && { borderColor: style.color, borderWidth: 2 },
      ]}
    >
      {selected && (
        <View style={[styles.selectedBadge, { backgroundColor: style.color }]}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      )}
      <Text style={styles.icon}>{style.icon}</Text>
      <Text style={styles.name}>{style.name}</Text>
      <Text style={styles.description}>{style.description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    width: '47%',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  checkmark: {
    color: '#FFF',
    fontSize: 14,
    ...FONTS.bold,
  },
  icon: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  name: {
    color: COLORS.text,
    fontSize: 16,
    ...FONTS.semibold,
    marginBottom: 2,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 12,
    ...FONTS.regular,
  },
});
