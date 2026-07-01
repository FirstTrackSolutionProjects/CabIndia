// cabindia-mobile/src/screens/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={GLOBAL_STYLES.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome to CabIndia!</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.greetingText}>Your journey starts here.</Text>
        <TouchableOpacity 
          style={styles.mapButton} 
          onPress={() => navigation.navigate('Map')}
        >
          <Text style={styles.mapButtonText}>Go to Map</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.fareButton} 
          onPress={() => navigation.navigate('FareDetails')}
        >
          <Text style={styles.fareButtonText}>Get Fare</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  headerText: {
    ...GLOBAL_STYLES.heading1,
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  greetingText: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.h2,
    marginBottom: SIZES.margin * 3,
  },
  mapButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 2,
    marginBottom: SIZES.margin * 2,
  },
  mapButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
  fareButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 2,
    marginBottom: SIZES.margin * 2,
  },
  fareButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
  logoutButton: {
    marginTop: SIZES.margin * 5,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 2,
  },
  logoutButtonText: {
    color: COLORS.error,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
});