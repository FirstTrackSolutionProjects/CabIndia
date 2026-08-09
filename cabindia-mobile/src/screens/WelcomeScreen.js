// cabindia-mobile/src/screens/WelcomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Feather } from '@expo/vector-icons/Feather';
import BrandText from '../components/BrandText';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={GLOBAL_STYLES.container}>
      <View style={styles.hero}>
        <Image 
          source={require('../../assets/icon.png')} 
          style={styles.logo}
          defaultSource={require('../../assets/icon.png')}
        />
        <BrandText style={styles.brandTitle} />
        <Text style={styles.subtitle}>AUTO • BIKES • CARS</Text>

        <View style={styles.authButtons}>
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('RegisterCustomer')}>
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.chatFab} 
        onPress={() => navigation.navigate('Chat')}
      >
        <Feather name="message-circle" size={24} color={COLORS.background} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding * 2 },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: SIZES.margin * 3,
  },
  brandTitle: {
    fontSize: SIZES.h1,
    marginBottom: SIZES.margin,
  },
  subtitle: { color: COLORS.textMuted, marginTop: SIZES.margin, letterSpacing: 2, fontSize: SIZES.small },
  
  authButtons: {
    marginTop: SIZES.margin * 5,
    width: '100%',
    gap: SIZES.margin * 1.5,
    maxWidth: 300,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding * 1.2,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  loginButtonText: {
    fontWeight: 'bold',
    fontSize: SIZES.medium,
    color: COLORS.background,
    fontFamily: FONTS.bold,
  },
  registerButton: {
    backgroundColor: COLORS.cardBackground,
    padding: SIZES.padding * 1.2,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  registerButtonText: {
    fontWeight: 'bold',
    fontSize: SIZES.medium,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },

  chatFab: { 
    position: 'absolute', 
    bottom: SIZES.padding * 2, 
    right: SIZES.padding * 1.5, 
    backgroundColor: COLORS.primary, 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  }
});