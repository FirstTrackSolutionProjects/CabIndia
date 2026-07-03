import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS, GLOBAL_STYLES, SIZES } from '../styles/theme';
import { Shield, MapPin, Phone } from '@expo/vector-icons';

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
               <Shield name={f.icon} size={24} color={COLORS.primary} />
            </View>
            <View>
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
  header: { padding: 40, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center' },
  content: { padding: 20 },
  card: { flexDirection: 'row', backgroundColor: '#111', padding: 20, borderRadius: 15, marginBottom: 15, alignItems: 'center', borderWeight: 1, borderColor: '#222' },
  iconBox: { marginRight: 15 },
  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  cardDesc: { color: '#888', fontSize: 14 }
});
