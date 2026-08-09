// cabindia-mobile/src/components/BrandText.jsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES, BRAND_COLORS } from '../styles/theme';

export const BrandText = ({ style, ...props }) => {
  return (
    <Text style={[styles.brandText, style]} {...props}>
      <Text style={styles.cab}>CAB</Text>
      <Text style={styles.in}>IN</Text>
      <Text style={styles.dia}>DIA</Text>
    </Text>
  );
};

const styles = StyleSheet.create({
  brandText: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.h2,
    letterSpacing: 0.5,
  },
  cab: {
    color: BRAND_COLORS.cab,
  },
  in: {
    color: BRAND_COLORS.in,
  },
  dia: {
    color: BRAND_COLORS.dia,
  },
});

export default BrandText;