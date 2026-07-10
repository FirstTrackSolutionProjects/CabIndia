// cabindia-mobile/src/screens/ProfileScreen.js
// Please create this new file.
// This is a placeholder for the User Profile screen.

import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Feather } from '@expo/vector-icons';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { userData, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: async () => {
            await logout();
            // Navigation to AuthStack is handled by AuthContext in App.js
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
        <Text style={GLOBAL_STYLES.text}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={GLOBAL_STYLES.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>
      
      <View style={styles.profileCard}>
        <Feather name="user" size={SIZES.h1 * 1.5} color={COLORS.primary} style={styles.profileIcon} />
        <Text style={styles.name}>{userData.name || 'User Name'}</Text>
        <Text style={styles.email}>{userData.email || 'user@example.com'}</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <Feather name="edit" size={SIZES.large} color={COLORS.textMuted} />
          <Text style={styles.menuText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Feather name="credit-card" size={SIZES.large} color={COLORS.textMuted} />
          <Text style={styles.menuText}>Payment Methods</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleApplyAsCaptain}>
          <Feather name="briefcase" size={SIZES.large} color={COLORS.textMuted} />
          <Text style={styles.menuText}>Apply as Captain</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
          <Feather name="log-out" size={SIZES.large} color={COLORS.error} />
          <Text style={[styles.menuText, { color: COLORS.error }]}>Logout</Text>
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
    marginTop: SIZES.padding * 3,
  },
  profileIcon: {
    marginBottom: SIZES.margin,
  },
  name: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
  },
  email: {
    fontSize: SIZES.medium,
    color: COLORS.textMuted,
    marginBottom: SIZES.margin * 2,
  },
  menuContainer: {
    paddingHorizontal: SIZES.padding,
    marginTop: SIZES.margin * 2,
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
    gap: SIZES.margin,
  },
  menuText: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.body,
    fontFamily: FONTS.semibold,
    flex: 1,
  },
  logoutButton: {
    marginTop: SIZES.margin * 3,
    borderColor: COLORS.error,
  }
});