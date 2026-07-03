// cabindia-mobile/src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5, Feather } from '@expo/vector-icons'; // Or other icon libraries
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { COLORS, SIZES, GLOBAL_STYLES } from '../styles/theme'; // Import your theme

const LoginScreen = () => {
  const navigation = useNavigation();
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ credential: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace with your actual backend IP or domain
      const backendUrl = 'http://YOUR_BACKEND_IP_ADDRESS:5000/api/auth/login'; // IMPORTANT: Use your local IP for development
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.credential, // Assuming credential is email
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', data.message);
        // Store token using AsyncStorage
        await AsyncStorage.setItem('userToken', data.token);
        // Also save user data if needed
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        navigation.navigate('Home'); // Navigate to your main app screen
      } else {
        setError(data.message || 'Login failed');
        Alert.alert('Login Failed', data.message || 'Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      Alert.alert('Error', 'Could not connect to the server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.yellowAccentTop} /> {/* Top accent */}
        <View style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="user-circle" size={26} color={COLORS.primary} />
            </View>
            <Text style={styles.brandSubtitle}>CabIndia</Text>
            <Text style={styles.title}>
              Welcome <Text style={styles.titleHighlight}>Back</Text>
            </Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
          </View>

          <View style={styles.divider} />

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Email or Phone Number <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="you@email.com or 98765 43210"
              placeholderTextColor={COLORS.textMuted}
              value={form.credential}
              onChangeText={(text) => setForm((f) => ({ ...f, credential: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.textMuted}
                value={form.password}
                onChangeText={(text) => setForm((f) => ({ ...f, password: text }))}
                secureTextEntry={!showPwd}
              />
              <TouchableOpacity onPress={() => setShowPwd((v) => !v)} style={styles.eyeIcon}>
                <Feather name={showPwd ? 'eye-off' : 'eye'} size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.loginButton, loading && { opacity: 0.7 }]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <Text style={styles.loginButtonText}>
                  Login <Feather name="arrow-right" size={15} color={COLORS.background} />
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.dividerWithText}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => Alert.alert('Google Login', 'Google login not yet implemented.')}
          >
            <FontAwesome5 name="google" size={20} color={COLORS.text} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <Text style={styles.registerText}>
            Don't have an account?{' '}
            <Text
              style={styles.registerLink}
              onPress={() => navigation.navigate('RegisterCustomer')} // Assuming this route exists
            >
              Register here
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...GLOBAL_STYLES.container,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius * 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  yellowAccentTop: {
    height: 4,
    width: '100%',
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
  },
  cardContent: {
    padding: SIZES.padding * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.margin * 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: SIZES.radius,
    backgroundColor: `${COLORS.primary}1A`, // Primary with 10% opacity
    borderWidth: 1,
    borderColor: `${COLORS.primary}40`, // Primary with 25% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  brandSubtitle: {
    fontSize: SIZES.small - 1,
    fontFamily: FONTS.bold,
    letterSpacing: 2,
    color: `${COLORS.primary}99`, // Primary with 60% opacity
    textTransform: 'uppercase',
    marginBottom: SIZES.margin / 2,
  },
  title: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  titleHighlight: {
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  subtitle: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.small,
    marginTop: SIZES.margin / 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderColor,
    marginVertical: SIZES.margin * 2,
  },
  form: {
    width: '100%',
    gap: SIZES.margin * 1.5,
  },
  label: {
    fontSize: SIZES.small - 1,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
    color: COLORS.text,
    textTransform: 'uppercase',
  },
  required: {
    color: COLORS.primary,
  },
  input: {
    height: 48,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    color: COLORS.text,
    fontSize: SIZES.body - 2,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    height: 48,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    color: COLORS.text,
    fontSize: SIZES.body - 2,
  },
  eyeIcon: {
    padding: SIZES.padding / 2,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.small,
    marginTop: -SIZES.margin,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding * 0.9,
    marginTop: SIZES.margin,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SIZES.margin / 2,
  },
  loginButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
  dividerWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.margin * 2,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderColor,
  },
  orText: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.small - 1,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginHorizontal: SIZES.margin,
  },
  googleButton: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SIZES.margin,
  },
  googleButtonText: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.medium - 1,
    fontFamily: FONTS.semibold,
  },
  registerText: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.small,
    textAlign: 'center',
    marginTop: SIZES.margin * 2,
  },
  registerLink: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
});

export default LoginScreen;
