import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING, FONTS } from '../constants/theme';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'accent';
  icon?: string;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
}

export function GradientButton({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  icon,
  style,
  size = 'medium',
}: Props) {
  const gradients = {
    primary: COLORS.gradient.primary as [string, string],
    secondary: COLORS.gradient.secondary as [string, string],
    accent: COLORS.gradient.accent as [string, string],
  };

  const sizes = {
    small: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14 },
    medium: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16 },
    large: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 18 },
  };

  const sizeStyle = sizes[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.container, style]}
    >
      <LinearGradient
        colors={disabled ? ['#444', '#333'] : gradients[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          {
            paddingVertical: sizeStyle.paddingVertical,
            paddingHorizontal: sizeStyle.paddingHorizontal,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Text
            style={[
              styles.text,
              { fontSize: sizeStyle.fontSize },
              disabled && styles.disabledText,
            ]}
          >
            {icon ? `${icon}  ${title}` : title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
  },
  text: {
    color: '#FFF',
    ...FONTS.bold,
    letterSpacing: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});
