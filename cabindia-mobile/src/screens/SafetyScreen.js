import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS, GLOBAL_STYLES, SIZES, FONTS } from '../styles/theme'; // NEW: Import FONTS
import Feather from 'react-native-vector-icons/Feather';

export default function SafetyScreen() {
  const safetyFeatures = [
    { title: "Share Trip", desc: "Let loved ones track your ride.", icon: "map-pin" },
    { title: "SOS Button", desc: "Instant alert to our safety team.", icon: "alert-triangle" },
    { title: "Verified Captains", desc: "Background checked drivers.", icon: "user-check" }
  ];

  return (
    <ScrollView style={GLOBAL_STYLES.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Safety is our <Text style={{color: COLORS.primary}}>Priority</Text></Text>
      </View>
      <View style={styles.content}>
        {safetyFeatures.map((f, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.iconBox}>
               <Feather name={f.icon} size={SIZES.extraLarge} color={COLORS.primary} /> {/* Adjusted icon size */}
            </View>
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>{f.title}</Text>
              <Text style={styles.cardDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: SIZES.padding * 2, // Adjusted padding
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground, // Added background for consistency
    borderBottomWidth: 1,
    borderColor: COLORS.borderColor,
  },
  title: {
    fontSize: SIZES.h1, // Adjusted font size
    fontFamily: FONTS.bold, // Use theme font
    color: COLORS.text, // Use theme color
    textAlign: 'center',
    paddingHorizontal: SIZES.padding, // Added padding for title
  },
  content: {
    padding: SIZES.padding, // Adjusted padding
    marginTop: SIZES.margin * 2,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground, // Use theme color
    padding: SIZES.padding * 1.5, // Adjusted padding
    borderRadius: SIZES.radius * 2, // Adjusted radius
    marginBottom: SIZES.margin, // Adjusted margin
    alignItems: 'center',
    borderWidth: 1, // Changed from borderWeight to borderWidth
    borderColor: COLORS.borderColor, // Use theme color
  },
  iconBox: {
    marginRight: SIZES.margin * 1.5, // Adjusted margin
    width: SIZES.extraLarge * 1.5, // Ensure consistent icon box size
    height: SIZES.extraLarge * 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}1A`, // Light primary background
    borderRadius: SIZES.radius,
  },
  cardTextContent: {
    flex: 1, // Allow text to take remaining space
  },
  cardTitle: {
    color: COLORS.text, // Use theme color
    fontFamily: FONTS.bold, // Use theme font
    fontSize: SIZES.medium, // Adjusted font size
    marginBottom: SIZES.tiny, // Smaller margin
  },
  cardDesc: {
    color: COLORS.textMuted, // Use theme color
    fontSize: SIZES.small, // Adjusted font size
  },
});
