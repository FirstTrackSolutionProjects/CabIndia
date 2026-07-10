// cabindia-mobile/src/screens/MoreScreen.js
// Please create this new file.
// This is a placeholder for the "More" or "Settings/Support" screen.

import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Feather } from '@expo/vector-icons';

export default function MoreScreen() {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

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

  const menuItems = [
    { 
      id: 'support', 
      title: 'Support / Help', 
      icon: 'message-circle', 
      action: () => navigation.navigate('Chat') 
    },
    { 
      id: 'safety', 
      title: 'Safety Features', 
      icon: 'shield', 
      action: () => navigation.navigate('SafetyScreen') 
    },
    { 
      id: 'privacy', 
      title: 'Privacy Policy', 
      icon: 'file-text', 
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
      icon: 'book', 
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
      icon: 'settings', 
      action: () => Alert.alert('Settings', 'App settings not yet implemented.') 
    },
  ];

  return (
    <ScrollView style={GLOBAL_STYLES.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More Options</Text>
      </View>
      
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.action}>
            <Feather name={item.icon} size={SIZES.large} color={COLORS.primary} />
            <Text style={styles.menuText}>{item.title}</Text>
            <Feather name="chevron-right" size={SIZES.medium} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
          <Feather name="log-out" size={SIZES.large} color={COLORS.error} />
          <Text style={[styles.menuText, { color: COLORS.error }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    flex: 1, // Allow text to take available space
  },
  logoutButton: {
    marginTop: SIZES.margin * 3,
    borderColor: COLORS.error,
  }
});