// cabindia-mobile/src/screens/RegisterCustomerScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, ActivityIndicator, ScrollView 
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
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
  'User Already Exists with this email': '📧 This email is already registered. Try logging in instead, or use a different email.',
  'Mobile number already registered': '📱 This phone number is already in use. If this is your number, please login. If not, use a different number.',
  'Password must be same in both fields': '🔑 The passwords you entered don\'t match. Please make sure both password fields are the same.',
  'Email and Password are required': '📝 Please fill in all fields to create your account.',
  'Network error': '🌐 Having trouble connecting. Please check your internet connection and try again.',
  'Server error': '⚠️ Something went wrong on our end. Our team is working on it. Please try again later.',
  'default': 'Hmm, something went wrong. Please check your information and try again.'
};

const getFriendlyErrorMessage = (serverMessage) => {
  if (!serverMessage) return USER_FRIENDLY_ERRORS.default;
  
  if (USER_FRIENDLY_ERRORS[serverMessage]) {
    return USER_FRIENDLY_ERRORS[serverMessage];
  }
  
  const lowerMsg = serverMessage.toLowerCase();
  if (lowerMsg.includes('email') && (lowerMsg.includes('exist') || lowerMsg.includes('already'))) {
    return USER_FRIENDLY_ERRORS['User Already Exists with this email'];
  }
  if (lowerMsg.includes('mobile') && (lowerMsg.includes('exist') || lowerMsg.includes('already'))) {
    return USER_FRIENDLY_ERRORS['Mobile number already registered'];
  }
  if (lowerMsg.includes('password') && lowerMsg.includes('match')) {
    return USER_FRIENDLY_ERRORS['Password must be same in both fields'];
  }
  if (lowerMsg.includes('network') || lowerMsg.includes('connection')) {
    return USER_FRIENDLY_ERRORS['Network error'];
  }
  if (lowerMsg.includes('server') || lowerMsg.includes('internal')) {
    return USER_FRIENDLY_ERRORS['Server error'];
  }
  
  return serverMessage;
};

const RegisterCustomerScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  // Configure Google Sign-In (only if not in Expo Go)
  useEffect(() => {
    if (!isExpoGo && GoogleSignin) {
      GoogleSignin.configure({
        webClientId: Constants.expoConfig?.extra?.googleClientId || '79474403137-kf7plivtq1cgkkeapit16a45oskepvtb.apps.googleusercontent.com',
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
      });
    }
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !mobile || !password || !confirmPassword) {
      Alert.alert(
        '📝 Missing Information',
        'Please fill in all fields to create your account. We need your name, email, phone number, and password.'
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(
        '🔑 Password Mismatch',
        'The passwords you entered don\'t match. Please make sure both password fields are the same.'
      );
      return;
    }
    if (password.length < 8) {
      Alert.alert(
        '🔒 Password Too Short',
        'For your security, your password needs to be at least 8 characters long. Add more characters and try again.'
      );
      return;
    }
    if (mobile.length !== 10) {
      Alert.alert(
        '📱 Invalid Phone Number',
        'Please enter a valid 10-digit Indian phone number. For example: 98765 43210'
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Attempting registration for:', email);
      const response = await api.post('/api/auth/register', {
        name,
        email,
        mobile,
        password,
        confirmPassword,
      });

      console.log('Registration response:', response.data);

      if (response.data.success) {
        Alert.alert(
          '🎉 Welcome to CabIndia!',
          `Great to have you onboard, ${name}! 🚗\n\nYour account has been created. Please login to start booking rides.`
        );
        navigation.navigate('Login');
      } else {
        const friendlyMsg = getFriendlyErrorMessage(response.data.message);
        setError(friendlyMsg);
        Alert.alert('📝 Registration Issue', friendlyMsg);
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || 'Network error. Please try again.';
      const friendlyMsg = getFriendlyErrorMessage(errorMessage);
      setError(friendlyMsg);
      Alert.alert('📝 Registration Issue', friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (isExpoGo) {
      Alert.alert(
        '🔧 Google Sign-In',
        'Google Sign-In is not available in Expo Go. Please use email/password registration or build a development version.\n\n📱 Tip: Create a development build with "eas build --platform android --profile development"'
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
        name: user.name || user.givenName || user.email.split('@')[0],
        picture: user.photo,
      });

      console.log('Google registration response:', response.data);

      if (response.data.success) {
        Alert.alert(
          '🌟 Welcome to CabIndia!',
          `Great to have you onboard, ${response.data.user?.name || 'CabIndia rider'}! 🚗\n\nYour account is ready. Let's find you a ride!`
        );
        // Navigate to the main app
        navigation.navigate('HomeTab');
      } else {
        const friendlyMsg = getFriendlyErrorMessage(response.data.message);
        Alert.alert('📝 Registration Issue', friendlyMsg);
      }
    } catch (error) {
      console.error('Google registration error:', error);
      
      if (error.code === statusCodes?.SIGN_IN_CANCELLED) {
        Alert.alert('⏹️ Cancelled', 'Google sign-in was cancelled. You can try again or use email/password.');
      } else if (error.code === statusCodes?.IN_PROGRESS) {
        Alert.alert('⏳ In Progress', 'Google sign-in is already in progress. Please wait.');
      } else if (error.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('📱 Google Play Services', 'Please update Google Play Services on your device to use Google Sign-In.');
      } else {
        Alert.alert('❌ Error', 'Failed to register with Google. Please try again or use email/password.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer} 
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
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
                maxLength={10}
                value={mobile}
                onChangeText={setMobile}
              />

              <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Min 8 characters"
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

              {error && <Text style={styles.errorText}>⚠️ {error}</Text>}

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
              style={[styles.googleButton, googleLoading && { opacity: 0.7 }]}
              onPress={handleGoogleRegister}
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
    paddingHorizontal: SIZES.padding / 2,
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