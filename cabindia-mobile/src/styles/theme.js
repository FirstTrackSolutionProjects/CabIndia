// cabindia-mobile/src/styles/theme.js
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: '#facc15',
  secondary: '#f97316', // Orange for "IN"
  tertiary: '#22c55e',   // Green for "DIA"
  background: '#0a0a0a',
  cardBackground: '#111111',
  text: '#ffffff',
  textMuted: '#a1a1aa',
  inputBackground: '#1f2937',
  borderColor: '#374151',
  error: '#ef4444',
  white: '#ffffff',
};

export const BRAND_COLORS = {
  cab: '#ffffff',      // White
  in: '#f97316',       // Orange
  dia: '#22c55e',      // Green
};

export const SIZES = {
  tiny: 8,
  small: 12,
  medium: 13,
  large: 16,
  extraLarge: 20,
  h1: 28,
  h2: 22,
  h3: 18,
  body: 14,
  padding: 14,
  margin: 8,
  radius: 10,
  windowWidth: width,
  windowHeight: height,
};

export const FONTS = {
  bold: 'System-Bold',
  semibold: 'System-Semibold',
  medium: 'System-Medium',
  regular: 'System-Regular',
};

export const GLOBAL_STYLES = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  text: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: SIZES.body,
  },
  heading1: {
    fontSize: SIZES.h1,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});