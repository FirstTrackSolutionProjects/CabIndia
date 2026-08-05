// cabindia-mobile/src/screens/CaptainApplicationScreen.js
import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { COLORS, SIZES, FONTS } from '../styles/theme';

const CaptainApplicationScreen = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    vehicleModel: '',
    licensePlate: '',
    vehicleType: 'Sedan',
    licenseNumber: '',
    experience: '',
  });

  const handleApply = async () => {
    if (!form.vehicleModel || !form.licensePlate || !form.licenseNumber) {
      Alert.alert('Error', 'Please fill in all required vehicle details.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/drivers/apply', {
        userId: userData?.id,
        ...form,
      });

      if (response.data.success) {
        Alert.alert(
          'Application Submitted!',
          'We will review your documents and get back to you within 48 hours.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to submit application.');
      }
    } catch (err) {
      console.error('Application error:', err);
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to submit application. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>🚗 Become a Captain</Text>
        <Text style={styles.subtitle}>Join CabIndia's driver network</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Vehicle Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vehicle Type *</Text>
          <View style={styles.typeContainer}>
            {['Auto', 'Bike', 'Mini', 'Sedan', 'SUV'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  form.vehicleType === type && styles.typeButtonActive,
                ]}
                onPress={() => setForm({ ...form, vehicleType: type })}
              >
                <Text style={[
                  styles.typeText,
                  form.vehicleType === type && styles.typeTextActive,
                ]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vehicle Model *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Maruti Suzuki Swift"
            placeholderTextColor={COLORS.textMuted}
            value={form.vehicleModel}
            onChangeText={(text) => setForm({ ...form, vehicleModel: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>License Plate Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. OD 01 AB 1234"
            placeholderTextColor={COLORS.textMuted}
            value={form.licensePlate}
            onChangeText={(text) => setForm({ ...form, licensePlate: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Driving License Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your DL number"
            placeholderTextColor={COLORS.textMuted}
            value={form.licenseNumber}
            onChangeText={(text) => setForm({ ...form, licenseNumber: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Years of Driving Experience</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 3"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numeric"
            value={form.experience}
            onChangeText={(text) => setForm({ ...form, experience: text })}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.applyButton}
        onPress={handleApply}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.background} />
        ) : (
          <Text style={styles.applyButtonText}>Submit Application</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.note}>
        ⚡ All documents will be verified. You'll receive a confirmation within 48 hours.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.margin * 2,
  },
  title: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: SIZES.medium,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius * 2,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin * 2,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.margin * 2,
  },
  inputGroup: {
    marginBottom: SIZES.margin * 1.5,
  },
  label: {
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
    color: COLORS.textMuted,
    marginBottom: SIZES.margin / 2,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.8,
    color: COLORS.text,
    fontSize: SIZES.body,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    backgroundColor: COLORS.inputBackground,
  },
  typeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}1A`,
  },
  typeText: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
  },
  typeTextActive: {
    color: COLORS.primary,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.margin,
  },
  applyButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
  note: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    lineHeight: 20,
  },
});

export default CaptainApplicationScreen;