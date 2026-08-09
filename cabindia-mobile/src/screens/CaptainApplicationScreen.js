// cabindia-captain/src/screens/CaptainApplicationScreen.js
import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Alert, ActivityIndicator, Switch 
} from 'react-native';
import api from '../utils/api';
import { AuthContext } from '../../App';
import { COLORS, SIZES, FONTS } from '../styles/theme';
import { Feather } from '@expo/vector-icons';

const CaptainApplicationScreen = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    // Personal Info
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dob: '',
    gender: '',
    qualification: '',
    
    // Address
    address: '',
    city: '',
    state: '',
    pincode: '',
    permanentAddress: '',
    permanentCity: '',
    permanentState: '',
    permanentPincode: '',
    sameAsPresent: true,
    
    // KYC
    aadhaar: '',
    pan: '',
    bankAccount: '',
    ifsc: '',
    bankName: '',
    
    // Vehicle
    vehicleType: 'Sedan',
    vehicleModel: '',
    licensePlate: '',
    licenseNumber: '',
    experience: '',
    vehicleColor: '',
    rcNumber: '',
    chassisNumber: '',
    pollutionValid: true,
    insuranceValid: true,
  });

  const [documents, setDocuments] = useState({
    selfie: null,
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    drivingLicense: null,
    rc: null,
    insurance: null,
    pollution: null,
    bankPassbook: null,
  });

  const totalSteps = 5;
  const stepTitles = ['Personal', 'Address', 'KYC & Bank', 'Vehicle', 'Documents'];

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleDocumentSelect = (key, value) => {
    setDocuments({ ...documents, [key]: value });
  };

  const validateStep = () => {
    switch(step) {
      case 1:
        if (!form.fullName || !form.email || !form.phone || !form.password || !form.dob) {
          Alert.alert('Error', 'Please fill all required fields.');
          return false;
        }
        if (form.password !== form.confirmPassword) {
          Alert.alert('Error', 'Passwords do not match.');
          return false;
        }
        if (form.password.length < 8) {
          Alert.alert('Error', 'Password must be at least 8 characters.');
          return false;
        }
        return true;
      case 2:
        if (!form.address || !form.city || !form.state || !form.pincode) {
          Alert.alert('Error', 'Please fill all address fields.');
          return false;
        }
        if (!form.sameAsPresent && (!form.permanentAddress || !form.permanentCity || !form.permanentState || !form.permanentPincode)) {
          Alert.alert('Error', 'Please fill permanent address fields.');
          return false;
        }
        return true;
      case 3:
        if (!form.aadhaar || !form.pan || !form.bankAccount || !form.ifsc || !form.bankName) {
          Alert.alert('Error', 'Please fill all KYC and bank details.');
          return false;
        }
        if (form.aadhaar.length < 12) {
          Alert.alert('Error', 'Please enter a valid 12-digit Aadhaar number.');
          return false;
        }
        return true;
      case 4:
        if (!form.vehicleModel || !form.licensePlate || !form.licenseNumber) {
          Alert.alert('Error', 'Please fill all vehicle details.');
          return false;
        }
        return true;
      case 5:
        // Check if documents are uploaded
        const requiredDocs = ['selfie', 'aadhaarFront', 'panCard', 'drivingLicense', 'rc', 'bankPassbook'];
        const missing = requiredDocs.filter(doc => !documents[doc]);
        if (missing.length > 0) {
          Alert.alert('Error', `Please upload: ${missing.join(', ')}`);
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const goToNextStep = () => {
    if (validateStep()) {
      if (step < totalSteps) {
        setStep(step + 1);
        // Scroll to top of the view
        ScrollView.scrollTo({ y: 0, animated: true });
      } else {
        handleSubmitApplication();
      }
    }
  };

  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmitApplication = async () => {
    if (!userData?.id) {
      Alert.alert('Error', 'User not logged in. Please login and try again.');
      return;
    }

    setLoading(true);
    try {
      // Prepare data for API
      const applicationData = {
        userId: userData.id,
        ...form,
        // File uploads would be handled separately (multipart/form-data)
      };

      const response = await api.post('/drivers/apply', applicationData);

      if (response.data.success) {
        Alert.alert(
          '✅ Application Submitted!',
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

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicator}>
        {stepTitles.map((title, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              index + 1 <= step ? styles.stepCircleActive : styles.stepCircleInactive,
              index + 1 === step && styles.stepCircleCurrent,
            ]}>
              <Text style={[
                styles.stepNumber,
                index + 1 <= step && styles.stepNumberActive,
              ]}>
                {index + 1}
              </Text>
            </View>
            <Text style={[
              styles.stepLabel,
              index + 1 <= step && styles.stepLabelActive,
            ]}>
              {title}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPersonalInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor={COLORS.textMuted}
          value={form.fullName}
          onChangeText={(text) => handleChange('fullName', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          placeholder="you@email.com"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(text) => handleChange('email', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="98765 43210"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(text) => handleChange('phone', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Create Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="Min 8 characters"
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry
          value={form.password}
          onChangeText={(text) => handleChange('password', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm your password"
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry
          value={form.confirmPassword}
          onChangeText={(text) => handleChange('confirmPassword', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date of Birth *</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={COLORS.textMuted}
          value={form.dob}
          onChangeText={(text) => handleChange('dob', text)}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Gender</Text>
          <TextInput
            style={styles.input}
            placeholder="Male/Female/Other"
            placeholderTextColor={COLORS.textMuted}
            value={form.gender}
            onChangeText={(text) => handleChange('gender', text)}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Qualification</Text>
          <TextInput
            style={styles.input}
            placeholder="10th/12th/Graduate..."
            placeholderTextColor={COLORS.textMuted}
            value={form.qualification}
            onChangeText={(text) => handleChange('qualification', text)}
          />
        </View>
      </View>
    </View>
  );

  const renderAddress = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Present Address</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Street Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="Plot no, Street name"
          placeholderTextColor={COLORS.textMuted}
          value={form.address}
          onChangeText={(text) => handleChange('address', text)}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            placeholder="City"
            placeholderTextColor={COLORS.textMuted}
            value={form.city}
            onChangeText={(text) => handleChange('city', text)}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>State *</Text>
          <TextInput
            style={styles.input}
            placeholder="State"
            placeholderTextColor={COLORS.textMuted}
            value={form.state}
            onChangeText={(text) => handleChange('state', text)}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pincode *</Text>
        <TextInput
          style={styles.input}
          placeholder="751001"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="numeric"
          value={form.pincode}
          onChangeText={(text) => handleChange('pincode', text)}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Same as Present Address</Text>
        <Switch
          value={form.sameAsPresent}
          onValueChange={(value) => handleChange('sameAsPresent', value)}
          trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
          thumbColor={form.sameAsPresent ? '#000' : '#fff'}
        />
      </View>

      {!form.sameAsPresent && (
        <View style={styles.permanentAddress}>
          <Text style={styles.sectionSubtitle}>Permanent Address</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Street Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Plot no, Street name"
              placeholderTextColor={COLORS.textMuted}
              value={form.permanentAddress}
              onChangeText={(text) => handleChange('permanentAddress', text)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor={COLORS.textMuted}
                value={form.permanentCity}
                onChangeText={(text) => handleChange('permanentCity', text)}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                placeholder="State"
                placeholderTextColor={COLORS.textMuted}
                value={form.permanentState}
                onChangeText={(text) => handleChange('permanentState', text)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pincode</Text>
            <TextInput
              style={styles.input}
              placeholder="751001"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              value={form.permanentPincode}
              onChangeText={(text) => handleChange('permanentPincode', text)}
            />
          </View>
        </View>
      )}
    </View>
  );

  const renderKYC = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>KYC Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Aadhaar Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="XXXX XXXX XXXX"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="numeric"
          value={form.aadhaar}
          onChangeText={(text) => handleChange('aadhaar', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>PAN Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="ABCDE1234F"
          placeholderTextColor={COLORS.textMuted}
          value={form.pan}
          onChangeText={(text) => handleChange('pan', text)}
        />
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Bank Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Holder Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="As per bank records"
          placeholderTextColor={COLORS.textMuted}
          value={form.bankName}
          onChangeText={(text) => handleChange('bankName', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter account number"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="numeric"
          value={form.bankAccount}
          onChangeText={(text) => handleChange('bankAccount', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>IFSC Code *</Text>
        <TextInput
          style={styles.input}
          placeholder="SBIN0001234"
          placeholderTextColor={COLORS.textMuted}
          value={form.ifsc}
          onChangeText={(text) => handleChange('ifsc', text)}
        />
      </View>
    </View>
  );

  const renderVehicle = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Vehicle Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Type *</Text>
        <View style={styles.typeContainer}>
          {['Auto', 'Bike', 'Mini', 'Sedan', 'SUV', 'Parcel'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                form.vehicleType === type && styles.typeButtonActive,
              ]}
              onPress={() => handleChange('vehicleType', type)}
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
          onChangeText={(text) => handleChange('vehicleModel', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Color</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. White, Red"
          placeholderTextColor={COLORS.textMuted}
          value={form.vehicleColor}
          onChangeText={(text) => handleChange('vehicleColor', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>License Plate Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="OD 01 AB 1234"
          placeholderTextColor={COLORS.textMuted}
          value={form.licensePlate}
          onChangeText={(text) => handleChange('licensePlate', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Driving License Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your DL number"
          placeholderTextColor={COLORS.textMuted}
          value={form.licenseNumber}
          onChangeText={(text) => handleChange('licenseNumber', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>RC Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Registration certificate no."
          placeholderTextColor={COLORS.textMuted}
          value={form.rcNumber}
          onChangeText={(text) => handleChange('rcNumber', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Chassis Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Vehicle chassis number"
          placeholderTextColor={COLORS.textMuted}
          value={form.chassisNumber}
          onChangeText={(text) => handleChange('chassisNumber', text)}
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
          onChangeText={(text) => handleChange('experience', text)}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Pollution Certificate Valid</Text>
        <Switch
          value={form.pollutionValid}
          onValueChange={(value) => handleChange('pollutionValid', value)}
          trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
          thumbColor={form.pollutionValid ? '#000' : '#fff'}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Insurance Valid</Text>
        <Switch
          value={form.insuranceValid}
          onValueChange={(value) => handleChange('insuranceValid', value)}
          trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
          thumbColor={form.insuranceValid ? '#000' : '#fff'}
        />
      </View>
    </View>
  );

  const renderDocuments = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Upload Documents</Text>
      
      <Text style={styles.note}>
        Upload clear photos or scans. Accepted: JPG, PNG, PDF (max 5MB each)
      </Text>

      <View style={styles.docGrid}>
        <TouchableOpacity 
          style={styles.docButton}
          onPress={() => Alert.alert('Upload', 'Upload Selfie Photo')}
        >
          <Feather name="camera" size={24} color={COLORS.primary} />
          <Text style={styles.docLabel}>Selfie Photo *</Text>
          {documents.selfie && <Feather name="check-circle" size={16} color="#22c55e" />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.docButton}
          onPress={() => Alert.alert('Upload', 'Upload Aadhaar Front')}
        >
          <Feather name="file-text" size={24} color={COLORS.primary} />
          <Text style={styles.docLabel}>Aadhaar Front *</Text>
          {documents.aadhaarFront && <Feather name="check-circle" size={16} color="#22c55e" />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.docButton}
          onPress={() => Alert.alert('Upload', 'Upload Aadhaar Back')}
        >
          <Feather name="file-text" size={24} color={COLORS.primary} />
          <Text style={styles.docLabel}>Aadhaar Back</Text>
          {documents.aadhaarBack && <Feather name="check-circle" size={16} color="#22c55e" />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.docButton}
          onPress={() => Alert.alert('Upload', 'Upload PAN Card')}
        >
          <Feather name="credit-card" size={24} color={COLORS.primary} />
          <Text style={styles.docLabel}>PAN Card *</Text>
          {documents.panCard && <Feather name="check-circle" size={16} color="#22c55e" />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.docButton}
          onPress={() => Alert.alert('Upload', 'Upload Driving License')}
        >
          <Feather name="award" size={24} color={COLORS.primary} />
          <Text style={styles.docLabel}>Driving License *</Text>
          {documents.drivingLicense && <Feather name="check-circle" size={16} color="#22c55e" />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.docButton}
          onPress={() => Alert.alert('Upload', 'Upload Vehicle RC')}
        >
          <Feather name="file" size={24} color={COLORS.primary} />
          <Text style={styles.docLabel}>Vehicle RC *</Text>
          {documents.rc && <Feather name="check-circle" size={16} color="#22c55e" />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.docButton}
          onPress={() => Alert.alert('Upload', 'Upload Insurance')}
        >
          <Feather name="shield" size={24} color={COLORS.primary} />
          <Text style={styles.docLabel}>Insurance</Text>
          {documents.insurance && <Feather name="check-circle" size={16} color="#22c55e" />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.docButton}
          onPress={() => Alert.alert('Upload', 'Upload Pollution Certificate')}
        >
          <Feather name="droplet" size={24} color={COLORS.primary} />
          <Text style={styles.docLabel}>Pollution</Text>
          {documents.pollution && <Feather name="check-circle" size={16} color="#22c55e" />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.docButton}
          onPress={() => Alert.alert('Upload', 'Upload Bank Passbook')}
        >
          <Feather name="book" size={24} color={COLORS.primary} />
          <Text style={styles.docLabel}>Bank Passbook *</Text>
          {documents.bankPassbook && <Feather name="check-circle" size={16} color="#22c55e" />}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch(step) {
      case 1: return renderPersonalInfo();
      case 2: return renderAddress();
      case 3: return renderKYC();
      case 4: return renderVehicle();
      case 5: return renderDocuments();
      default: return null;
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      ref={(ref) => { ScrollView = ref; }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🚗 Become a Captain</Text>
        <Text style={styles.subtitle}>Join CabIndia's driver network</Text>
      </View>

      {renderStepIndicator()}

      <View style={styles.card}>
        {renderCurrentStep()}
      </View>

      <View style={styles.navButtons}>
        <TouchableOpacity
          style={[styles.navButton, step === 1 && styles.navButtonDisabled]}
          onPress={goToPreviousStep}
          disabled={step === 1}
        >
          <Feather name="chevron-left" size={20} color={step === 1 ? COLORS.textMuted : COLORS.text} />
          <Text style={[styles.navButtonText, step === 1 && styles.navButtonTextDisabled]}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.stepCounter}>{step} / {totalSteps}</Text>

        <TouchableOpacity
          style={styles.navButtonPrimary}
          onPress={goToNextStep}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.background} size="small" />
          ) : (
            <>
              <Text style={styles.navButtonPrimaryText}>
                {step === totalSteps ? 'Submit' : 'Next'}
              </Text>
              <Feather name="chevron-right" size={20} color={COLORS.background} />
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.footerNote}>
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
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.margin * 2,
    paddingHorizontal: 4,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  stepCircleInactive: {
    borderColor: COLORS.borderColor,
    backgroundColor: 'transparent',
  },
  stepCircleCurrent: {
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  stepNumber: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
  },
  stepNumberActive: {
    color: COLORS.background,
  },
  stepLabel: {
    fontSize: 9,
    fontFamily: FONTS.semibold,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: COLORS.primary,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius * 2,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin * 2,
  },
  section: {
    gap: SIZES.margin * 1.5,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.margin,
  },
  sectionSubtitle: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.semibold,
    color: COLORS.textMuted,
    marginBottom: SIZES.margin,
    marginTop: SIZES.margin,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.margin,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  switchLabel: {
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  permanentAddress: {
    marginTop: SIZES.margin,
    paddingTop: SIZES.margin,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
  },
  note: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    marginBottom: SIZES.margin,
    lineHeight: 20,
  },
  docGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  docButton: {
    width: '48%',
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    padding: SIZES.padding,
    alignItems: 'center',
    gap: 4,
  },
  docLabel: {
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
    textAlign: 'center',
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
    marginLeft: 4,
  },
  navButtonTextDisabled: {
    color: COLORS.textMuted,
  },
  navButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 1.5,
    paddingVertical: SIZES.padding * 0.8,
    borderRadius: SIZES.radius,
    gap: 4,
  },
  navButtonPrimaryText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.bold,
    color: COLORS.background,
  },
  stepCounter: {
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
    color: COLORS.textMuted,
  },
  footerNote: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    lineHeight: 20,
  },
});

export default CaptainApplicationScreen;