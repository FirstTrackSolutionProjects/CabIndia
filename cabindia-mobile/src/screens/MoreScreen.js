// cabindia-mobile/src/screens/MoreScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function MoreScreen() {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            await logout();
          },
          style: "destructive"
        }
      ]
    );
  };

  const menuItems = [
    {
      id: 'support',
      title: 'Support / Help',
      icon: 'chatbubble-outline',
      action: () => navigation.navigate('Chat')
    },
    {
      id: 'safety',
      title: 'Safety Features',
      icon: 'shield-outline',
      action: () => navigation.navigate('SafetyScreen')
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: 'document-text-outline',
      action: () => navigation.navigate('PolicyScreen', {
        title: 'Privacy Policy',
        sections: [
          { title: 'Data Collection', content: 'We collect your name, email, and location to provide services.' },
          { title: 'Data Usage', content: 'Your data is used to improve our services and personalize your experience.' }
        ]
      })
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      icon: 'book-outline',
      action: () => navigation.navigate('PolicyScreen', {
        title: 'Terms & Conditions',
        sections: [
          { title: 'Service Agreement', content: 'By using CabIndia, you agree to our terms of service.' },
          { title: 'User Conduct', content: 'Users must adhere to community guidelines and refrain from misuse.' }
        ]
      })
    },
    {
      id: 'settings',
      title: 'App Settings',
      icon: 'settings-outline',
      action: () => Alert.alert('Settings', 'App settings will be available soon.')
    },
  ];

  return (
    <ScrollView style={GLOBAL_STYLES.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More Options</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.action}>
            <Ionicons name={item.icon} size={SIZES.large} color={COLORS.primary} />
            <Text style={styles.menuText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={SIZES.medium} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={SIZES.large} color={COLORS.error} />
          <Text style={[styles.menuText, { color: COLORS.error }]}>Logout</Text>
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
  menuContainer: {
    padding: SIZES.padding,
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