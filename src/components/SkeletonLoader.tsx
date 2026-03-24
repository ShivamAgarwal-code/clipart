import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';

interface Props {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({
  width = '100%',
  height = 200,
  borderRadius = RADIUS.md,
  style,
}: Props) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height: height as any,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.surfaceHighlight,
  },
});
