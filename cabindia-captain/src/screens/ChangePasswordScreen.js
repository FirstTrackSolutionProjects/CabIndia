// cabindia-captain/src/screens/ChangePasswordScreen.js
import React, { useState, useContext } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { AuthContext } from '../../App';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import api from '../utils/api';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'The new passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Password Too Short', 'New password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (response.data.success) {
        Alert.alert(
          '✅ Password Changed',
          'Your password has been changed successfully.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
        // Clear fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to change password.');
      }
    } catch (error) {
      console.error('Change password error:', error);
      const errorMsg = error.response?.data?.message || 'Something went wrong. Please try again.';
      
      if (errorMsg.includes('incorrect') || errorMsg.includes('Current password')) {
        Alert.alert('Incorrect Password', 'The current password you entered is incorrect. Please try again.');
      } else {
        Alert.alert('Error', errorMsg);
      }
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
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Feather name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                  <View style={styles.iconContainer}>
                    <Feather name="shield" size={28} color={COLORS.primary} />
                  </View>
                  <Text style={styles.brandSubtitle}>CabIndia</Text>
                  <Text style={styles.title}>
                    Change <Text style={styles.titleHighlight}>Password</Text>
                  </Text>
                  <Text style={styles.subtitle}>
                    Update your account password.
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.form}>
                <Text style={styles.label}>Current Password <Text style={styles.required}>*</Text></Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your current password"
                    placeholderTextColor={COLORS.textMuted}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showCurrentPwd}
                  />
                  <TouchableOpacity onPress={() => setShowCurrentPwd((v) => !v)} style={styles.eyeIcon}>
                    <Feather name={showCurrentPwd ? 'eye-off' : 'eye'} size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>New Password <Text style={styles.required}>*</Text></Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Min 8 characters"
                    placeholderTextColor={COLORS.textMuted}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPwd}
                  />
                  <TouchableOpacity onPress={() => setShowNewPwd((v) => !v)} style={styles.eyeIcon}>
                    <Feather name={showNewPwd ? 'eye-off' : 'eye'} size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Confirm New Password <Text style={styles.required}>*</Text></Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm your new password"
                    placeholderTextColor={COLORS.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPwd}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPwd((v) => !v)} style={styles.eyeIcon}>
                    <Feather name={showConfirmPwd ? 'eye-off' : 'eye'} size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>

                <View style={styles.passwordRequirements}>
                  <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                  <View style={styles.requirementRow}>
                    <Feather name={newPassword.length >= 8 ? 'check-circle' : 'circle'} size={14} color={newPassword.length >= 8 ? '#22c55e' : COLORS.textMuted} />
                    <Text style={[styles.requirementText, newPassword.length >= 8 && { color: '#22c55e' }]}>
                      At least 8 characters
                    </Text>
                  </View>
                  <View style={styles.requirementRow}>
                    <Feather name={/[A-Z]/.test(newPassword) ? 'check-circle' : 'circle'} size={14} color={/[A-Z]/.test(newPassword) ? '#22c55e' : COLORS.textMuted} />
                    <Text style={[styles.requirementText, /[A-Z]/.test(newPassword) && { color: '#22c55e' }]}>
                      At least one uppercase letter
                    </Text>
                  </View>
                  <View style={styles.requirementRow}>
                    <Feather name={/[a-z]/.test(newPassword) ? 'check-circle' : 'circle'} size={14} color={/[a-z]/.test(newPassword) ? '#22c55e' : COLORS.textMuted} />
                    <Text style={[styles.requirementText, /[a-z]/.test(newPassword) && { color: '#22c55e' }]}>
                      At least one lowercase letter
                    </Text>
                  </View>
                  <View style={styles.requirementRow}>
                    <Feather name={/[0-9]/.test(newPassword) ? 'check-circle' : 'circle'} size={14} color={/[0-9]/.test(newPassword) ? '#22c55e' : COLORS.textMuted} />
                    <Text style={[styles.requirementText, /[0-9]/.test(newPassword) && { color: '#22c55e' }]}>
                      At least one number
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[styles.submitButton, loading && { opacity: 0.7 }]}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.background} />
                  ) : (
                    <Text style={styles.submitButtonText}>Update Password</Text>
                  )}
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
    marginBottom: SIZES.margin * 2,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    padding: 4,
  },
  headerContent: {
    alignItems: 'center',
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
  passwordRequirements: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  requirementsTitle: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
    marginBottom: SIZES.margin / 2,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  requirementText: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    fontFamily: FONTS.regular,
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
});