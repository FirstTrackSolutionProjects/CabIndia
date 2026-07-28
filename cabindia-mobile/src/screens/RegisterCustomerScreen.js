// cabindia-mobile/src/screens/RegisterCustomerScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';

const RegisterCustomerScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    // Basic validation
    if (!name || !email || !mobile || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Note: /api is added here because apiUrl doesn't include it
      const response = await fetch(`${Constants.expoConfig.extra.apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          mobile,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', data.message);
        navigation.navigate('Login');
      } else {
        setError(data.message || 'Registration failed');
        Alert.alert('Registration Failed', data.message || 'Please try again.');
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
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.yellowAccentTop} />
          <View style={styles.cardContent}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="user-plus" size={26} color={COLORS.primary} />
              </View>
              <Text style={styles.brandSubtitle}>CabIndia</Text>
              <Text style={styles.title}>
                Join <Text style={styles.titleHighlight}>Us</Text>
              </Text>
              <Text style={styles.subtitle}>Create your account to start your journey</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.form}>
              <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="you@email.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.label}>Mobile Number <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="98765 43210"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
              />

              <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPwd}
                />
                <TouchableOpacity onPress={() => setShowPwd((v) => !v)} style={styles.eyeIcon}>
                  <Feather name={showPwd ? 'eye-off' : 'eye'} size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirm Password <Text style={styles.required}>*</Text></Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm your password"
                  placeholderTextColor={COLORS.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPwd}
                />
                <TouchableOpacity onPress={() => setShowConfirmPwd((v) => !v)} style={styles.eyeIcon}>
                  <Feather name={showConfirmPwd ? 'eye-off' : 'eye'} size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                onPress={handleRegister}
                style={[styles.registerButton, loading && { opacity: 0.7 }]}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.background} />
                ) : (
                  <Text style={styles.registerButtonText}>
                    Sign Up <Feather name="arrow-right" size={15} color={COLORS.background} />
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
              onPress={() => Alert.alert('Google Login', 'Google registration not yet implemented.')}
            >
              <FontAwesome5 name="google" size={20} color={COLORS.text} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
              >
                Login here
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: SIZES.padding * 2,
  },
  container: {
    flex: 1,
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
    backgroundColor: `${COLORS.primary}1A`,
    borderWidth: 1,
    borderColor: `${COLORS.primary}40`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  brandSubtitle: {
    fontSize: SIZES.small - 1,
    fontFamily: FONTS.bold,
    letterSpacing: 2,
    color: `${COLORS.primary}99`,
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
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding * 0.9,
    marginTop: SIZES.margin,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SIZES.margin / 2,
  },
  registerButtonText: {
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
  loginText: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.small,
    textAlign: 'center',
    marginTop: SIZES.margin * 2,
  },
  loginLink: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
});

export default RegisterCustomerScreen;