// cabindia-captain/src/screens/LoginScreen.js
import React, { useState, useContext, useEffect } from 'react';
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
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { AuthContext } from '../../App';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import api from '../utils/api';

// ============================================
// USER-FRIENDLY ERROR MESSAGES
// ============================================
const USER_FRIENDLY_ERRORS = {
  'Invalid credentials': '🔑 Oops! That email/password combination doesn\'t work. Please double-check and try again.',
  'User not found': '📧 We couldn\'t find an account with that email. Would you like to create one?',
  'Wrong password': '🔒 The password you entered is incorrect. Please try again or click "Forgot Password".',
  'Email and Password are required': '📝 Please enter both your email and password to sign in.',
  'Network error': '🌐 Having trouble connecting to our servers. Please check your internet connection.',
  'Token is not valid': '⏰ Your session has expired. Please log in again.',
  'No token, authorization denied': '🔐 Please log in to continue using CabIndia Captain.',
  'Server error': '⚠️ Something went wrong on our end. Our team is working on it. Please try again later.',
  'default': '🤔 Hmm, something went wrong. Please try again or contact support if the issue persists.'
};

const getFriendlyErrorMessage = (serverMessage) => {
  if (!serverMessage) return USER_FRIENDLY_ERRORS.default;
  
  if (USER_FRIENDLY_ERRORS[serverMessage]) {
    return USER_FRIENDLY_ERRORS[serverMessage];
  }
  
  const lowerMsg = serverMessage.toLowerCase();
  if (lowerMsg.includes('invalid') && lowerMsg.includes('credential')) {
    return USER_FRIENDLY_ERRORS['Invalid credentials'];
  }
  if (lowerMsg.includes('user') && lowerMsg.includes('not found')) {
    return USER_FRIENDLY_ERRORS['User not found'];
  }
  if (lowerMsg.includes('password') && lowerMsg.includes('incorrect')) {
    return USER_FRIENDLY_ERRORS['Wrong password'];
  }
  if (lowerMsg.includes('network') || lowerMsg.includes('connection')) {
    return USER_FRIENDLY_ERRORS['Network error'];
  }
  if (lowerMsg.includes('server') || lowerMsg.includes('internal')) {
    return USER_FRIENDLY_ERRORS['Server error'];
  }
  
  return serverMessage;
};

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ credential: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!form.credential || !form.password) {
      Alert.alert(
        '📝 Missing Information',
        'Please enter both your email and password to sign in.\n\nNeed an account? Tap "Register here" below!'
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/login', {
        email: form.credential,
        password: form.password,
      });

      if (response.data.success) {
        Alert.alert(
          '🎉 Welcome Back, Captain!',
          `Great to see you again, ${response.data.user?.name || 'Captain'}! Ready to start earning?`
        );
        await login(response.data.token, response.data.user);
      } else {
        const friendlyMsg = getFriendlyErrorMessage(response.data.message);
        setError(friendlyMsg);
        Alert.alert('🔑 Login Issue', friendlyMsg);
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Network error. Please try again.';
      const friendlyMsg = getFriendlyErrorMessage(errorMessage);
      setError(friendlyMsg);
      Alert.alert('🔑 Login Issue', friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.yellowAccentTop} />
        <View style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="user-circle" size={26} color={COLORS.primary} />
            </View>
            <Text style={styles.brandSubtitle}>CabIndia Captain</Text>
            <Text style={styles.title}>
              Welcome <Text style={styles.titleHighlight}>Back</Text>
            </Text>
            <Text style={styles.subtitle}>Sign in to start earning</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.form}>
            <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="you@email.com"
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

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>⚠️ {error}</Text>}

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

          <Text style={styles.registerText}>
            Don't have an account?{' '}
            <Text
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register')}
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -SIZES.margin,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.small,
    marginTop: -SIZES.margin,
    paddingHorizontal: SIZES.padding / 2,
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