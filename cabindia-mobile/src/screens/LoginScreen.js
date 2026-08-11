// cabindia-mobile/src/screens/LoginScreen.js
import React, { useState, useContext } from 'react';
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
import { AuthContext } from '../context/AuthContext';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import api from '../utils/api';
import Constants from 'expo-constants';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Only import GoogleSignin if NOT in Expo Go
let GoogleSignin, statusCodes;
if (!isExpoGo) {
  const GoogleSigninModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = GoogleSigninModule.GoogleSignin;
  statusCodes = GoogleSigninModule.statusCodes;
}

// ============================================
// USER-FRIENDLY ERROR MESSAGES
// ============================================
const USER_FRIENDLY_ERRORS = {
  'Invalid credentials': 'Oops! That email/password combination doesn\'t work. Please double-check and try again.',
  'User not found': 'We couldn\'t find an account with that email. Would you like to create one?',
  'Wrong password': 'The password you entered is incorrect. Please try again or click "Forgot Password".',
  'Email and Password are required': 'Please enter both your email and password to sign in.',
  'Network error': 'Having trouble connecting to our servers. Please check your internet connection.',
  'Token is not valid': 'Your session has expired. Please log in again.',
  'No token, authorization denied': 'Please log in to continue using CabIndia.',
  'Server error': 'Something went wrong on our end. Our team is working on it. Please try again later.',
  'default': 'Hmm, something went wrong. Please try again or contact support if the issue persists.'
};

const getFriendlyErrorMessage = (serverMessage) => {
  if (!serverMessage) return USER_FRIENDLY_ERRORS.default;
  
  // Check for exact matches
  if (USER_FRIENDLY_ERRORS[serverMessage]) {
    return USER_FRIENDLY_ERRORS[serverMessage];
  }
  
  // Check for partial matches
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  // Configure Google Sign-In (only if not in Expo Go)
  React.useEffect(() => {
    if (!isExpoGo && GoogleSignin) {
      GoogleSignin.configure({
        webClientId: Constants.expoConfig?.extra?.googleClientId || '79474403137-kf7plivtq1cgkkeapit16a45oskepvtb.apps.googleusercontent.com',
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
      });
    }
  }, []);

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
      console.log('Attempting login with:', form.credential);
      const response = await api.post('/api/auth/login', {
        email: form.credential,
        password: form.password,
      });

      console.log('Login response:', response.data);

      if (response.data.success) {
        Alert.alert(
          '🎉 Welcome Back!',
          `Great to see you again, ${response.data.user?.name || 'CabIndia rider'}! Ready for your next ride?`
        );
        await login(response.data.token, response.data.user);
      } else {
        const friendlyMsg = getFriendlyErrorMessage(response.data.message);
        setError(friendlyMsg);
        Alert.alert('🔑 Login Issue', friendlyMsg);
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.message || 'Network error. Please try again.';
      const friendlyMsg = getFriendlyErrorMessage(errorMsg);
      setError(friendlyMsg);
      Alert.alert('🔑 Login Issue', friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isExpoGo) {
      Alert.alert(
        '🔧 Google Sign-In',
        'Google Sign-In is not available in Expo Go. Please use email/password login or build a development version.\n\n📱 Tip: Create a development build with "eas build --platform android --profile development"'
      );
      return;
    }

    if (!GoogleSignin) {
      Alert.alert('❌ Error', 'Google Sign-In is not available.');
      return;
    }

    try {
      setGoogleLoading(true);
      
      await GoogleSignin.hasPlayServices();
      
      const userInfo = await GoogleSignin.signIn();
      console.log('Google user info:', userInfo);
      
      const { idToken, user } = userInfo;
      
      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      const response = await api.post('/api/auth/google', {
        idToken: idToken,
        email: user.email,
        name: user.name,
        picture: user.photo,
      });

      console.log('Google login response:', response.data);

      if (response.data.success) {
        Alert.alert(
          '🌟 Welcome!',
          `Great to have you onboard, ${response.data.user?.name || 'CabIndia rider'}! Let's find you a ride.`
        );
        await login(response.data.token, response.data.user);
      } else {
        const friendlyMsg = getFriendlyErrorMessage(response.data.message);
        Alert.alert('🔑 Login Issue', friendlyMsg);
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      
      if (error.code === statusCodes?.SIGN_IN_CANCELLED) {
        Alert.alert('⏹️ Cancelled', 'Google sign-in was cancelled. You can try again or use email/password.');
      } else if (error.code === statusCodes?.IN_PROGRESS) {
        Alert.alert('⏳ In Progress', 'Google sign-in is already in progress. Please wait.');
      } else if (error.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('📱 Google Play Services', 'Please update Google Play Services on your device to use Google Sign-In.');
      } else {
        Alert.alert('❌ Error', 'Failed to login with Google. Please try again or use email/password.');
      }
    } finally {
      setGoogleLoading(false);
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
            <Text style={styles.brandSubtitle}>CabIndia</Text>
            <Text style={styles.title}>
              Welcome <Text style={styles.titleHighlight}>Back</Text>
            </Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
          </View>

          <View style={styles.divider} />

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

          <View style={styles.dividerWithText}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, googleLoading && { opacity: 0.7 }]}
            onPress={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color={COLORS.text} size="small" />
            ) : (
              <>
                <FontAwesome5 name="google" size={20} color={COLORS.text} />
                <Text style={styles.googleButtonText}>
                  {isExpoGo ? 'Google (Dev Only)' : 'Continue with Google'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.registerText}>
            Don't have an account?{' '}
            <Text
              style={styles.registerLink}
              onPress={() => navigation.navigate('RegisterCustomer')}
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