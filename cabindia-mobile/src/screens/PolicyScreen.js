// cabindia-mobile/src/screens/PolicyScreen.js
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { COLORS, GLOBAL_STYLES, SIZES, FONTS } from '../styles/theme';
import { Feather } from '@expo/vector-icons/Feather';

const PolicyScreen = ({ route }) => {
  const { title, sections } = route.params;

  return (
    <ScrollView style={GLOBAL_STYLES.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.accent} />
      </View>
      <View style={styles.content}>
        {sections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="check-circle" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <Text style={styles.sectionText}>{section.content}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: { padding: 40, alignItems: 'center', backgroundColor: COLORS.cardBackground },
  title: { fontSize: SIZES.h2, fontFamily: FONTS.bold, color: COLORS.primary },
  accent: { height: 3, width: 40, backgroundColor: COLORS.primary, marginTop: 10 },
  content: { padding: 20 },
  section: { marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  sectionTitle: { fontSize: SIZES.body, fontFamily: FONTS.bold, color: COLORS.text },
  sectionText: { fontSize: SIZES.small, color: COLORS.textMuted, lineHeight: 20 },
});

export default PolicyScreen;
