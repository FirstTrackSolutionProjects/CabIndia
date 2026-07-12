// cabindia-mobile/src/styles/theme.js
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: '#facc15', // Yellow-400
  secondary: '#f97316', // Orange-400
  tertiary: '#22c55e', // Green-400
  background: '#0a0a0a', // Gray-950
  cardBackground: '#111111', // Gray-900
  text: '#ffffff',
  textMuted: '#a1a1aa', // Gray-400
  inputBackground: '#1f2937', // Gray-800
  borderColor: '#374151', // Gray-700
  error: '#ef4444', // Red-500
};

// Slightly reduced sizes for a cleaner, less "blobby" look
export const SIZES = {
  tiny: 8,
  small: 12,
  medium: 13, // Adjusted from 14
  large: 16,  // Adjusted from 18
  extraLarge: 20, // Adjusted from 24
  h1: 28,     // Adjusted from 32
  h2: 22,     // Adjusted from 24
  h3: 18,     // Adjusted from 20
  body: 14,   // Adjusted from 16
  padding: 14, // Adjusted from 16
  margin: 8,   // Adjusted from 10
  radius: 10,  // Adjusted from 12
  windowWidth: width,
  windowHeight: height,
};

export const FONTS = {
  bold: 'System-Bold', // Use custom fonts or system defaults
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
    fontSize: SIZES.body, // Default text size
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
