import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/theme';
import { CLIPART_STYLES } from '../constants/styles';
import { StyleCard } from '../components/StyleCard';
import { GradientButton } from '../components/GradientButton';

interface Props {
  navigation: any;
  route: any;
}

export function StyleSelectionScreen({ navigation, route }: Props) {
  const { imageUri } = route.params;
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    CLIPART_STYLES.map((s) => s.id) // All selected by default for batch generation
  );

  const toggleStyle = (styleId: string) => {
    setSelectedStyles((prev) =>
      prev.includes(styleId)
        ? prev.filter((id) => id !== styleId)
        : [...prev, styleId]
    );
  };

  const selectAll = () => {
    setSelectedStyles(CLIPART_STYLES.map((s) => s.id));
  };

  const handleGenerate = () => {
    if (selectedStyles.length === 0) return;
    navigation.navigate('Generation', { imageUri, selectedStyles });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with source image */}
          <View style={styles.header}>
            <Image source={{ uri: imageUri }} style={styles.sourceImage} />
            <View style={styles.headerText}>
              <Text style={styles.title}>Choose Styles</Text>
              <Text style={styles.subtitle}>
                Select one or more styles to generate
              </Text>
            </View>
          </View>

          {/* Select All */}
          <View style={styles.selectAllRow}>
            <Text style={styles.selectedCount}>
              {selectedStyles.length} of {CLIPART_STYLES.length} selected
            </Text>
            {selectedStyles.length < CLIPART_STYLES.length && (
              <GradientButton
                title="Select All"
                onPress={selectAll}
                size="small"
                variant="secondary"
              />
            )}
          </View>

          {/* Style Grid */}
          <View style={styles.grid}>
            {CLIPART_STYLES.map((artStyle) => (
              <StyleCard
                key={artStyle.id}
                style={artStyle}
                selected={selectedStyles.includes(artStyle.id)}
                onPress={() => toggleStyle(artStyle.id)}
              />
            ))}
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.bottomAction}>
          <GradientButton
            title={
              selectedStyles.length === CLIPART_STYLES.length
                ? 'Generate All Styles'
                : `Generate ${selectedStyles.length} Style${selectedStyles.length !== 1 ? 's' : ''}`
            }
            onPress={handleGenerate}
            disabled={selectedStyles.length === 0}
            size="large"
            icon="⚡"
          />
        </View>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  sourceImage: {
    width: 70,
    height: 70,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceLight,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    ...FONTS.bold,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    ...FONTS.regular,
  },
  selectAllRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  selectedCount: {
    color: COLORS.textSecondary,
    fontSize: 14,
    ...FONTS.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.background + 'F0',
  },
});
