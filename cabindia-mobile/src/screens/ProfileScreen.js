// cabindia-mobile/src/screens/ProfileScreen.js
import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { userData, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

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

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing will be available soon.');
  };

  const handlePaymentMethods = () => {
    Alert.alert('Payment Methods', 'Payment methods will be available soon.');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Settings will be available soon.');
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
    <ScrollView 
      style={GLOBAL_STYLES.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={40} color={COLORS.primary} />
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
        <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
          <View style={styles.menuIconWrapper}>
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={styles.menuArrow} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handlePaymentMethods}>
          <View style={styles.menuIconWrapper}>
            <Ionicons name="card-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.menuText}>Payment Methods</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={styles.menuArrow} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleApplyAsCaptain}>
          <View style={styles.menuIconWrapper}>
            <Ionicons name="car-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.menuText}>Apply as Captain</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={styles.menuArrow} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
          <View style={styles.menuIconWrapper}>
            <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={styles.menuArrow} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutButton]}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.error} />
          ) : (
            <>
              <View style={[styles.menuIconWrapper, styles.logoutIconWrapper]}>
                <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              </View>
              <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={styles.menuArrow} />
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>CabIndia v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.textMuted,
    marginTop: SIZES.margin,
    fontSize: SIZES.medium,
  },
  header: {
    paddingVertical: SIZES.padding * 2,
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: COLORS.borderColor,
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontFamily: FONTS.bold,
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
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.margin,
  },
  menuText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
    flex: 1,
  },
  menuArrow: {
    marginLeft: 'auto',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderColor,
    marginVertical: SIZES.margin,
  },
  logoutButton: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  logoutIconWrapper: {
    backgroundColor: `${COLORS.error}1A`,
  },
  logoutText: {
    color: COLORS.error,
  },
  footer: {
    padding: SIZES.padding,
    alignItems: 'center',
    marginTop: SIZES.margin * 2,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
  },
});