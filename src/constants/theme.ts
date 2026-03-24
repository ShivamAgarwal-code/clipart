export const COLORS = {
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#5A4BD1',
  secondary: '#00CEC9',
  accent: '#FD79A8',
  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceLight: '#252542',
  surfaceHighlight: '#2D2D4A',
  text: '#FFFFFF',
  textSecondary: '#B0B0CC',
  textMuted: '#6B6B8D',
  success: '#00B894',
  error: '#FF6B6B',
  warning: '#FDCB6E',
  gradient: {
    primary: ['#6C5CE7', '#A29BFE'],
    secondary: ['#00CEC9', '#55EFC4'],
    accent: ['#FD79A8', '#E84393'],
    dark: ['#1A1A2E', '#0F0F1A'],
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const FONTS = {
  regular: { fontWeight: '400' as const },
  medium: { fontWeight: '500' as const },
  semibold: { fontWeight: '600' as const },
  bold: { fontWeight: '700' as const },
};
