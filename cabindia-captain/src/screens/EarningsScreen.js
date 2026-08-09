// cabindia-captain/src/screens/EarningsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';

export default function EarningsScreen() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayRides: 0,
    todayEarnings: 0,
    totalRides: 0,
  });

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/drivers/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load earnings.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={GLOBAL_STYLES.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>
      </View>

      <View style={styles.earningsCard}>
        <Text style={styles.earningsLabel}>Today's Earnings</Text>
        <Text style={styles.earningsAmount}>₹{stats.todayEarnings}</Text>
        <Text style={styles.ridesCount}>{stats.todayRides} rides completed</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
          <Text style={styles.statValue}>{stats.todayRides}</Text>
          <Text style={styles.statLabel}>Today's Rides</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="stats-chart-outline" size={24} color={COLORS.primary} />
          <Text style={styles.statValue}>{stats.totalRides}</Text>
          <Text style={styles.statLabel}>Total Rides</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="star-outline" size={24} color={COLORS.primary} />
          <Text style={styles.statValue}>{stats.rating || 0}★</Text>
          <Text style={styles.statLabel}>Your Rating</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingVertical: SIZES.padding * 2,
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: COLORS.borderColor,
    marginBottom: SIZES.margin * 2,
  },
  headerTitle: {
    ...GLOBAL_STYLES.heading1,
    color: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  earningsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius * 2,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    padding: SIZES.padding * 2,
    margin: SIZES.padding,
    alignItems: 'center',
  },
  earningsLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
  },
  earningsAmount: {
    color: COLORS.primary,
    fontSize: SIZES.h1,
    fontFamily: FONTS.bold,
    marginVertical: SIZES.margin,
  },
  ridesCount: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SIZES.padding,
  },
  statCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    padding: SIZES.padding,
    alignItems: 'center',
    flex: 0.3,
  },
  statValue: {
    color: COLORS.text,
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    marginVertical: 4,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
  },
});