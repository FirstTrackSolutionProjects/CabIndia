// cabindia-captain/src/screens/ForgotPasswordScreen.js
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
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import api from '../utils/api';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      if (response.data.success) {
        setSent(true);
        Alert.alert(
          '✅ Reset Link Sent',
          'A password reset link has been sent to your email. Please check your inbox and spam folder.'
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send reset link.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
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
                  <Feather name="lock" size={28} color={COLORS.primary} />
                </View>
                <Text style={styles.brandSubtitle}>CabIndia</Text>
                <Text style={styles.title}>
                  Forgot <Text style={styles.titleHighlight}>Password</Text>
                </Text>
                <Text style={styles.subtitle}>
                  Enter your email and we'll send you a link to reset your password.
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.form}>
                <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@email.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!sent}
                />

                {sent && (
                  <View style={styles.successBox}>
                    <Feather name="check-circle" size={20} color="#22c55e" />
                    <Text style={styles.successText}>
                      Reset link sent successfully! Please check your email.
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[styles.submitButton, (loading || sent) && { opacity: 0.7 }]}
                  disabled={loading || sent}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.background} />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {sent ? '✅ Link Sent' : 'Send Reset Link'}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
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
    lineHeight: 20,
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