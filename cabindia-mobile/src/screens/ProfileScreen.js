// cabindia-mobile/src/screens/ProfileScreen.js
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import Constants from 'expo-constants';

// ✅ FIXED SOCKET URL
const SOCKET_URL = Constants.expoConfig?.extra?.apiUrl || 'https://cabindia-mobile.onrender.com';
const socket = io(SOCKET_URL, { 
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5
});

import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Feather } from '@expo/vector-icons';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { userData, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Join drivers room for testing
    socket.emit('join_drivers');

    socket.on('new_ride_request', (data) => {
      Alert.alert(
        "🚗 New Ride Request!",
        `Pickup: ${data.pickupAddress}\nPrice: ₹${data.estimatedPrice}`,
        [
          { text: "Ignore", style: "cancel" },
          { 
            text: "Accept", 
            onPress: () => {
              Alert.alert("Accepted", "You accepted ride " + data.rideId);
              // Navigate to ride details
              navigation.navigate('Map', { rideId: data.rideId });
            }
          }
        ]
      );
    });

    return () => {
      socket.off('new_ride_request');
    };
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          onPress: async () => {
            setLoading(true);
            await logout();
            setLoading(false);
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleApplyAsCaptain = () => {
    navigation.navigate('CaptainApplication');
  };

  if (!userData) {
    return (
      <View style={[GLOBAL_STYLES.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={GLOBAL_STYLES.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>
      
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Feather name="user" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.name}>{userData.name || 'User Name'}</Text>
        <Text style={styles.email}>{userData.email || 'user@example.com'}</Text>
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Customer</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <Feather name="edit" size={20} color={COLORS.textMuted} />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Feather name="chevron-right" size={16} color={COLORS.textMuted} style={styles.menuArrow} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Feather name="credit-card" size={20} color={COLORS.textMuted} />
          <Text style={styles.menuText}>Payment Methods</Text>
          <Feather name="chevron-right" size={16} color={COLORS.textMuted} style={styles.menuArrow} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleApplyAsCaptain}>
          <Feather name="briefcase" size={20} color={COLORS.textMuted} />
          <Text style={styles.menuText}>Apply as Captain</Text>
          <Feather name="chevron-right" size={16} color={COLORS.textMuted} style={styles.menuArrow} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Feather name="settings" size={20} color={COLORS.textMuted} />
          <Text style={styles.menuText}>Settings</Text>
          <Feather name="chevron-right" size={16} color={COLORS.textMuted} style={styles.menuArrow} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutButton]} 
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.error} />
          ) : (
            <>
              <Feather name="log-out" size={20} color={COLORS.error} />
              <Text style={[styles.menuText, { color: COLORS.error }]}>Logout</Text>
              <Feather name="chevron-right" size={16} color={COLORS.textMuted} style={styles.menuArrow} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textMuted,
    marginTop: SIZES.margin,
  },
  header: {
    paddingVertical: SIZES.padding * 2,
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: COLORS.borderColor,
  },
  headerTitle: {
    ...GLOBAL_STYLES.heading1,
    color: COLORS.primary,
  },
  profileCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius * 2,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    padding: SIZES.padding * 2,
    margin: SIZES.padding,
    alignItems: 'center',
    marginTop: SIZES.padding * 2,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}1A`,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.margin,
  },
  name: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  email: {
    fontSize: SIZES.medium,
    color: COLORS.textMuted,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: SIZES.margin,
  },
  badge: {
    backgroundColor: `${COLORS.primary}1A`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: SIZES.small,
    fontFamily: FONTS.bold,
  },
  menuContainer: {
    paddingHorizontal: SIZES.padding,
    marginTop: SIZES.margin,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin,
  },
  menuText: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.body,
    fontFamily: FONTS.semibold,
    flex: 1,
    marginLeft: SIZES.margin,
  },
  menuArrow: {
    marginLeft: 'auto',
  },
  logoutButton: {
    marginTop: SIZES.margin * 2,
    borderColor: COLORS.error,
  },
});