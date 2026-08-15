// cabindia-captain/src/screens/ResetPasswordScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import api from '../utils/api';

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = route.params || {};

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in both password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'The passwords you entered do not match.');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Password Too Short', 'Password must be at least 8 characters long.');
      return;
    }

    if (!token) {
      Alert.alert('Invalid Token', 'Reset token is missing. Please request a new reset link.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/auth/reset-password', {
        token,
        newPassword,
        confirmPassword,
      });

      if (response.data.success) {
        setResetComplete(true);
        Alert.alert(
          '✅ Password Reset Complete',
          'Your password has been reset successfully. You can now login with your new password.',
          [
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to reset password.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={GLOBAL_STYLES.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.yellowAccentTop} />
            <View style={styles.cardContent}>
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Feather name="key" size={28} color={COLORS.primary} />
                </View>
                <Text style={styles.brandSubtitle}>CabIndia</Text>
                <Text style={styles.title}>
                  Reset <Text style={styles.titleHighlight}>Password</Text>
                </Text>
                <Text style={styles.subtitle}>
                  Enter your new password below.
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.form}>
                <Text style={styles.label}>New Password <Text style={styles.required}>*</Text></Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Min 8 characters"
                    placeholderTextColor={COLORS.textMuted}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPwd}
                    editable={!resetComplete}
                  />
                  <TouchableOpacity onPress={() => setShowNewPwd((v) => !v)} style={styles.eyeIcon}>
                    <Feather name={showNewPwd ? 'eye-off' : 'eye'} size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Confirm Password <Text style={styles.required}>*</Text></Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm your new password"
                    placeholderTextColor={COLORS.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPwd}
                    editable={!resetComplete}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPwd((v) => !v)} style={styles.eyeIcon}>
                    <Feather name={showConfirmPwd ? 'eye-off' : 'eye'} size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>

                {resetComplete && (
                  <View style={styles.successBox}>
                    <Feather name="check-circle" size={20} color="#22c55e" />
                    <Text style={styles.successText}>
                      Password reset successfully!
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[styles.submitButton, (loading || resetComplete) && { opacity: 0.7 }]}
                  disabled={loading || resetComplete}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.background} />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {resetComplete ? '✅ Reset Complete' : 'Reset Password'}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Feather name="arrow-left" size={16} color={COLORS.primary} />
                  <Text style={styles.backText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
  },
  cardContent: {
    padding: SIZES.padding * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.margin * 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
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
    textAlign: 'center',
    color: COLORS.textMuted,
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
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.tertiary}1A`,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    gap: 10,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  successText: {
    flex: 1,
    color: '#22c55e',
    fontSize: SIZES.small,
    fontFamily: FONTS.medium,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding * 0.9,
    marginTop: SIZES.margin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding,
    gap: 8,
  },
  backText: {
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
    fontSize: SIZES.small,
  },
});