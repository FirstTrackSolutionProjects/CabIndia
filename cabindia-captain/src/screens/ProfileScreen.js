// cabindia-captain/src/screens/ProfileScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../../App';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const { userData, logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing will be available soon.');
  };

  const handleVehicleDetails = () => {
    Alert.alert('Vehicle Details', 'Vehicle details will be available soon.');
  };

  const handlePaymentSettings = () => {
    Alert.alert('Payment Settings', 'Payment settings will be available soon.');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Settings will be available soon.');
  };

  return (
    <ScrollView style={GLOBAL_STYLES.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.name}>{userData?.name || 'Captain'}</Text>
        <Text style={styles.email}>{userData?.email || 'captain@cabindia.in'}</Text>
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Captain</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
          <Ionicons name="create-outline" size={20} color={COLORS.textMuted} />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleVehicleDetails}>
          <Ionicons name="car-outline" size={20} color={COLORS.textMuted} />
          <Text style={styles.menuText}>Vehicle Details</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handlePaymentSettings}>
          <Ionicons name="card-outline" size={20} color={COLORS.textMuted} />
          <Text style={styles.menuText}>Payment Settings</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
          <Ionicons name="settings-outline" size={20} color={COLORS.textMuted} />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={[styles.menuText, { color: COLORS.error }]}>Logout</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
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
  logoutButton: {
    marginTop: SIZES.margin * 2,
    borderColor: COLORS.error,
  },
});