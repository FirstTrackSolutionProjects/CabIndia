// cabindia-mobile/src/screens/CaptainApplicationScreen.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { COLORS, SIZES, FONTS, GLOBAL_STYLES } from '../styles/theme';
import api from '../utils/api';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

// ============================================
// STEP CONFIGURATION
// ============================================
const STEPS = [
  { id: 1, label: 'Personal', icon: 'person-outline' },
  { id: 2, label: 'Address', icon: 'location-outline' },
  { id: 3, label: 'KYC & Bank', icon: 'card-outline' },
  { id: 4, label: 'Vehicle', icon: 'car-outline' },
  { id: 5, label: 'Documents', icon: 'document-text-outline' },
];

const QUALIFICATIONS = ['10th Pass', '12th Pass', 'Graduate', 'Post Graduate', 'Other'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const VEHICLE_TYPES = ['Auto', 'Bike', 'Mini', 'Sedan', 'SUV', 'Parcel'];

export default function CaptainApplicationScreen({ navigation }) {
  const { userData } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ============================================
  // FORM STATE
  // ============================================
  const [form, setForm] = useState({
    // Step 1: Personal Info
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dob: '',
    gender: '',
    qualification: '',

    // Step 2: Address
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    sameAsPresent: true,
    permanentAddress: '',
    permanentLandmark: '',
    permanentCity: '',
    permanentState: '',
    permanentPincode: '',

    // Step 3: KYC & Bank
    aadhaar: '',
    pan: '',
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',

    // Step 4: Vehicle
    vehicleType: 'Sedan',
    vehicleModel: '',
    vehicleNumber: '',
    rcNumber: '',
    chassisNumber: '',
    dlNumber: '',
    pollutionValid: 'Yes',
    insuranceValid: 'Yes',

    // Step 5: Documents (file URIs)
    selfie: null,
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    drivingLicense: null,
    vehicleRC: null,
    insurance: null,
    pollution: null,
    bankPassbook: null,
  });

  // ============================================
  // HELPERS
  // ============================================
  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const goToStep = (step) => {
    if (step >= 1 && step <= STEPS.length) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // ============================================
  // VALIDATION
  // ============================================
  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!form.fullName.trim()) {
          Alert.alert('📝 Missing Info', 'Please enter your full name.');
          return false;
        }
        if (!form.email.trim() || !form.email.includes('@')) {
          Alert.alert('📧 Invalid Email', 'Please enter a valid email address.');
          return false;
        }
        if (!form.phone.trim() || form.phone.length < 10) {
          Alert.alert('📱 Invalid Phone', 'Please enter a valid 10-digit phone number.');
          return false;
        }
        if (!form.password || form.password.length < 8) {
          Alert.alert('🔒 Password Too Short', 'Password must be at least 8 characters.');
          return false;
        }
        if (form.password !== form.confirmPassword) {
          Alert.alert('🔑 Password Mismatch', 'Passwords do not match.');
          return false;
        }
        if (!form.dob) {
          Alert.alert('📅 Date of Birth', 'Please enter your date of birth.');
          return false;
        }
        return true;

      case 2:
        if (!form.address.trim()) {
          Alert.alert('📍 Missing Address', 'Please enter your street address.');
          return false;
        }
        if (!form.city.trim()) {
          Alert.alert('📍 Missing City', 'Please enter your city.');
          return false;
        }
        if (!form.state.trim()) {
          Alert.alert('📍 Missing State', 'Please enter your state.');
          return false;
        }
        if (!form.pincode.trim() || form.pincode.length < 6) {
          Alert.alert('📍 Invalid Pincode', 'Please enter a valid 6-digit pincode.');
          return false;
        }
        if (!form.sameAsPresent) {
          if (!form.permanentAddress.trim() || !form.permanentCity.trim() ||
              !form.permanentState.trim() || !form.permanentPincode.trim()) {
            Alert.alert('📍 Missing Permanent Address', 'Please fill all permanent address fields.');
            return false;
          }
        }
        return true;

      case 3:
        if (!form.aadhaar.trim() || form.aadhaar.length < 12) {
          Alert.alert('🪪 Invalid Aadhaar', 'Please enter a valid 12-digit Aadhaar number.');
          return false;
        }
        if (!form.pan.trim() || form.pan.length < 10) {
          Alert.alert('🪪 Invalid PAN', 'Please enter a valid 10-digit PAN number.');
          return false;
        }
        if (!form.accountHolderName.trim()) {
          Alert.alert('🏦 Missing Bank Name', 'Please enter account holder name.');
          return false;
        }
        if (!form.accountNumber.trim()) {
          Alert.alert('🏦 Missing Account', 'Please enter account number.');
          return false;
        }
        if (!form.ifsc.trim() || form.ifsc.length < 11) {
          Alert.alert('🏦 Invalid IFSC', 'Please enter a valid 11-character IFSC code.');
          return false;
        }
        if (!form.bankName.trim()) {
          Alert.alert('🏦 Missing Bank', 'Please enter your bank name.');
          return false;
        }
        return true;

      case 4:
        if (!form.vehicleModel.trim()) {
          Alert.alert('🚗 Missing Model', 'Please enter vehicle model.');
          return false;
        }
        if (!form.vehicleNumber.trim()) {
          Alert.alert('🚗 Missing Number', 'Please enter vehicle registration number.');
          return false;
        }
        if (!form.rcNumber.trim()) {
          Alert.alert('📄 Missing RC', 'Please enter RC number.');
          return false;
        }
        if (!form.chassisNumber.trim()) {
          Alert.alert('🔢 Missing Chassis', 'Please enter chassis number.');
          return false;
        }
        if (!form.dlNumber.trim()) {
          Alert.alert('🪪 Missing License', 'Please enter driving license number.');
          return false;
        }
        return true;

      case 5:
        const requiredDocs = ['selfie', 'aadhaarFront', 'panCard', 'drivingLicense', 'vehicleRC', 'bankPassbook'];
        const missing = requiredDocs.filter(doc => !form[doc]);
        if (missing.length > 0) {
          Alert.alert(
            '📎 Missing Documents',
            `Please upload: ${missing.join(', ')}`
          );
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // ============================================
  // FILE PICKERS
  // ============================================
  const pickImage = async (field) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permission to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        updateForm(field, result.assets[0].uri);
        Alert.alert('✅ Uploaded', `${field} uploaded successfully!`);
      }
    } catch (error) {
      console.error('Image pick error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const pickDocument = async (field) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      if (result.assets && result.assets[0]) {
        updateForm(field, result.assets[0].uri);
        Alert.alert('✅ Uploaded', `${field} uploaded successfully!`);
      }
    } catch (error) {
      console.error('Document pick error:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  // ============================================
  // SUBMIT APPLICATION
  // ============================================
  const handleSubmit = async () => {
    if (!userData?.id) {
      Alert.alert('❌ Not Logged In', 'Please login and try again.');
      return;
    }

    setLoading(true);
    try {
      // Prepare data for API
      const applicationData = {
        userId: userData.id,
        ...form,
      };

      const response = await api.post('/api/drivers/apply', applicationData);

      if (response.data.success) {
        setSubmitted(true);
        Alert.alert(
          '🎉 Application Submitted!',
          'We will review your documents and get back to you within 48 hours.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('❌ Error', response.data.message || 'Failed to submit application.');
      }
    } catch (error) {
      console.error('Application error:', error);
      Alert.alert(
        '❌ Error',
        error.response?.data?.message || 'Failed to submit application. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER HELPERS
  // ============================================
  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((step) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        return (
          <TouchableOpacity
            key={step.id}
            style={styles.stepItem}
            onPress={() => goToStep(step.id)}
            disabled={!isCompleted && !isActive}
          >
            <View style={[
              styles.stepCircle,
              isActive && styles.stepCircleActive,
              isCompleted && styles.stepCircleCompleted,
            ]}>
              {isCompleted ? (
                <Ionicons name="checkmark" size={16} color={COLORS.background} />
              ) : (
                <Ionicons name={step.icon} size={16} color={isActive ? COLORS.background : COLORS.textMuted} />
              )}
            </View>
            <Text style={[
              styles.stepLabel,
              isActive && styles.stepLabelActive,
              isCompleted && styles.stepLabelCompleted,
            ]}>
              {step.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ============================================
  // STEP RENDERERS
  // ============================================
  const renderPersonalInfo = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about yourself</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor={COLORS.textMuted}
          value={form.fullName}
          onChangeText={(text) => updateForm('fullName', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="you@email.com"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(text) => updateForm('email', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="98765 43210"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="phone-pad"
          maxLength={10}
          value={form.phone}
          onChangeText={(text) => updateForm('phone', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Create Password <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Min 8 characters"
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry
          value={form.password}
          onChangeText={(text) => updateForm('password', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm Password <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm your password"
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry
          value={form.confirmPassword}
          onChangeText={(text) => updateForm('confirmPassword', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date of Birth <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={COLORS.textMuted}
          value={form.dob}
          onChangeText={(text) => updateForm('dob', text)}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfInput]}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.selectContainer}>
            <TextInput
              style={styles.input}
              placeholder="Select gender"
              placeholderTextColor={COLORS.textMuted}
              value={form.gender}
              onChangeText={(text) => updateForm('gender', text)}
            />
          </View>
        </View>
        <View style={[styles.inputGroup, styles.halfInput]}>
          <Text style={styles.label}>Qualification</Text>
          <View style={styles.selectContainer}>
            <TextInput
              style={styles.input}
              placeholder="Select qualification"
              placeholderTextColor={COLORS.textMuted}
              value={form.qualification}
              onChangeText={(text) => updateForm('qualification', text)}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderAddress = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Present Address</Text>
      <Text style={styles.stepSubtitle}>Where do you currently live?</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Street Address <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Plot no, Street name"
          placeholderTextColor={COLORS.textMuted}
          value={form.address}
          onChangeText={(text) => updateForm('address', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Landmark</Text>
        <TextInput
          style={styles.input}
          placeholder="Near school, temple..."
          placeholderTextColor={COLORS.textMuted}
          value={form.landmark}
          onChangeText={(text) => updateForm('landmark', text)}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfInput]}>
          <Text style={styles.label}>City <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Bhubaneswar"
            placeholderTextColor={COLORS.textMuted}
            value={form.city}
            onChangeText={(text) => updateForm('city', text)}
          />
        </View>
        <View style={[styles.inputGroup, styles.halfInput]}>
          <Text style={styles.label}>State <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Odisha"
            placeholderTextColor={COLORS.textMuted}
            value={form.state}
            onChangeText={(text) => updateForm('state', text)}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pincode <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="751001"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="numeric"
          maxLength={6}
          value={form.pincode}
          onChangeText={(text) => updateForm('pincode', text)}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Same as Present Address</Text>
        <Switch
          value={form.sameAsPresent}
          onValueChange={(value) => updateForm('sameAsPresent', value)}
          trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
          thumbColor={form.sameAsPresent ? COLORS.background : '#fff'}
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
              onChangeText={(text) => updateForm('permanentAddress', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Landmark</Text>
            <TextInput
              style={styles.input}
              placeholder="Near school, temple..."
              placeholderTextColor={COLORS.textMuted}
              value={form.permanentLandmark}
              onChangeText={(text) => updateForm('permanentLandmark', text)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor={COLORS.textMuted}
                value={form.permanentCity}
                onChangeText={(text) => updateForm('permanentCity', text)}
              />
            </View>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                placeholder="State"
                placeholderTextColor={COLORS.textMuted}
                value={form.permanentState}
                onChangeText={(text) => updateForm('permanentState', text)}
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
              maxLength={6}
              value={form.permanentPincode}
              onChangeText={(text) => updateForm('permanentPincode', text)}
            />
          </View>
        </View>
      )}
    </View>
  );

  const renderKYC = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>KYC Details</Text>
      <Text style={styles.stepSubtitle}>Verify your identity</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Aadhaar Number <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="XXXX XXXX XXXX"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="numeric"
          maxLength={14}
          value={form.aadhaar}
          onChangeText={(text) => updateForm('aadhaar', text.replace(/\s/g, ''))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>PAN Number <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="ABCDE1234F"
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="characters"
          maxLength={10}
          value={form.pan}
          onChangeText={(text) => updateForm('pan', text)}
        />
      </View>

      <Text style={styles.sectionTitle}>Bank Details</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Holder Name <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="As per bank records"
          placeholderTextColor={COLORS.textMuted}
          value={form.accountHolderName}
          onChangeText={(text) => updateForm('accountHolderName', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Number <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Enter account number"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="numeric"
          value={form.accountNumber}
          onChangeText={(text) => updateForm('accountNumber', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>IFSC Code <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="SBIN0001234"
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="characters"
          maxLength={11}
          value={form.ifsc}
          onChangeText={(text) => updateForm('ifsc', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bank Name <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="State Bank of India"
          placeholderTextColor={COLORS.textMuted}
          value={form.bankName}
          onChangeText={(text) => updateForm('bankName', text)}
        />
      </View>
    </View>
  );

  const renderVehicle = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Vehicle Details</Text>
      <Text style={styles.stepSubtitle}>Tell us about your vehicle</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Type</Text>
        <View style={styles.typeContainer}>
          {VEHICLE_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                form.vehicleType === type && styles.typeButtonActive,
              ]}
              onPress={() => updateForm('vehicleType', type)}
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
        <Text style={styles.label}>Vehicle Model <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Honda Activa / Maruti Suzuki Swift"
          placeholderTextColor={COLORS.textMuted}
          value={form.vehicleModel}
          onChangeText={(text) => updateForm('vehicleModel', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Number <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="OD 01 AB 1234"
          placeholderTextColor={COLORS.textMuted}
          value={form.vehicleNumber}
          onChangeText={(text) => updateForm('vehicleNumber', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>RC Number <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Registration certificate number"
          placeholderTextColor={COLORS.textMuted}
          value={form.rcNumber}
          onChangeText={(text) => updateForm('rcNumber', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Chassis Number <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Vehicle chassis number"
          placeholderTextColor={COLORS.textMuted}
          value={form.chassisNumber}
          onChangeText={(text) => updateForm('chassisNumber', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Driving License Number <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your DL number"
          placeholderTextColor={COLORS.textMuted}
          value={form.dlNumber}
          onChangeText={(text) => updateForm('dlNumber', text)}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfInput]}>
          <Text style={styles.label}>Pollution Certificate Valid?</Text>
          <View style={styles.radioContainer}>
            {['Yes', 'No'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.radioButton,
                  form.pollutionValid === option && styles.radioButtonActive,
                ]}
                onPress={() => updateForm('pollutionValid', option)}
              >
                <Text style={[
                  styles.radioText,
                  form.pollutionValid === option && styles.radioTextActive,
                ]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={[styles.inputGroup, styles.halfInput]}>
          <Text style={styles.label}>Insurance Valid?</Text>
          <View style={styles.radioContainer}>
            {['Yes', 'No'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.radioButton,
                  form.insuranceValid === option && styles.radioButtonActive,
                ]}
                onPress={() => updateForm('insuranceValid', option)}
              >
                <Text style={[
                  styles.radioText,
                  form.insuranceValid === option && styles.radioTextActive,
                ]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderDocuments = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Upload Documents</Text>
      <Text style={styles.stepSubtitle}>
        Upload clear photos or scans. Accepted: JPG, PNG, PDF (max 5MB each)
      </Text>

      <View style={styles.docGrid}>
        {[
          { key: 'selfie', label: 'Selfie Photo', icon: 'camera', required: true },
          { key: 'aadhaarFront', label: 'Aadhaar Front', icon: 'id-card', required: true },
          { key: 'aadhaarBack', label: 'Aadhaar Back', icon: 'id-card', required: false },
          { key: 'panCard', label: 'PAN Card', icon: 'card', required: true },
          { key: 'drivingLicense', label: 'Driving License', icon: 'car', required: true },
          { key: 'vehicleRC', label: 'Vehicle RC', icon: 'document', required: true },
          { key: 'insurance', label: 'Insurance', icon: 'shield', required: false },
          { key: 'pollution', label: 'Pollution Certificate', icon: 'leaf', required: false },
          { key: 'bankPassbook', label: 'Bank Passbook', icon: 'book', required: true },
        ].map((doc) => (
          <TouchableOpacity
            key={doc.key}
            style={[
              styles.docButton,
              form[doc.key] && styles.docButtonUploaded,
            ]}
            onPress={() => pickImage(doc.key)}
          >
            <Ionicons
              name={form[doc.key] ? 'checkmark-circle' : doc.icon}
              size={28}
              color={form[doc.key] ? '#22c55e' : COLORS.primary}
            />
            <Text style={styles.docLabel}>{doc.label}</Text>
            {doc.required && <Text style={styles.docRequired}>*</Text>}
            {form[doc.key] && (
              <Text style={styles.docUploadedText}>Uploaded ✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.noteBox}>
        <Ionicons name="information-circle" size={20} color={COLORS.primary} />
        <Text style={styles.noteText}>
          All documents will be verified by our team within 48 hours.
          Ensure all uploads are legible and not expired.
        </Text>
      </View>
    </View>
  );

  // ============================================
  // MAIN RENDER
  // ============================================
  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={60} color={COLORS.primary} />
        </View>
        <Text style={styles.successTitle}>Application Submitted! 🎉</Text>
        <Text style={styles.successSubtitle}>
          Thanks for joining CabIndia! Our team will review your application
          and contact you within 48 hours.
        </Text>
        <TouchableOpacity
          style={styles.successButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.successButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🚗 Become a Captain</Text>
          <Text style={styles.headerSubtitle}>Join CabIndia's driver network</Text>
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <View style={styles.card}>
          {currentStep === 1 && renderPersonalInfo()}
          {currentStep === 2 && renderAddress()}
          {currentStep === 3 && renderKYC()}
          {currentStep === 4 && renderVehicle()}
          {currentStep === 5 && renderDocuments()}
        </View>

        {/* Navigation */}
        <View style={styles.navButtons}>
          <TouchableOpacity
            style={[styles.navButton, currentStep === 1 && styles.navButtonDisabled]}
            onPress={prevStep}
            disabled={currentStep === 1}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={currentStep === 1 ? COLORS.textMuted : COLORS.text}
            />
            <Text style={[styles.navButtonText, currentStep === 1 && styles.navButtonTextDisabled]}>
              Back
            </Text>
          </TouchableOpacity>

          <Text style={styles.stepCounter}>
            {currentStep} / {STEPS.length}
          </Text>

          <TouchableOpacity
            style={styles.navButtonPrimary}
            onPress={nextStep}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.background} size="small" />
            ) : (
              <>
                <Text style={styles.navButtonPrimaryText}>
                  {currentStep === STEPS.length ? 'Submit' : 'Next'}
                </Text>
                <Ionicons
                  name={currentStep === STEPS.length ? 'checkmark' : 'chevron-forward'}
                  size={20}
                  color={COLORS.background}
                />
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          ⚡ All documents will be verified. You'll receive a confirmation within 48 hours.
        </Text>
      </ScrollView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.margin * 2,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  headerSubtitle: {
    fontSize: SIZES.medium,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Step Indicator
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
    borderColor: COLORS.borderColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  stepCircleActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  stepCircleCompleted: {
    borderColor: '#22c55e',
    backgroundColor: '#22c55e',
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
  stepLabelCompleted: {
    color: '#22c55e',
  },

  // Card
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius * 2,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin * 2,
  },

  // Step Content
  stepContent: {
    gap: SIZES.margin * 1.5,
  },
  stepTitle: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 2,
  },
  stepSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    marginBottom: SIZES.margin,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginTop: SIZES.margin,
    marginBottom: SIZES.margin,
  },
  sectionSubtitle: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.semibold,
    color: COLORS.textMuted,
    marginBottom: SIZES.margin,
    marginTop: SIZES.margin,
  },

  // Inputs
  inputGroup: {
    marginBottom: SIZES.margin * 1.5,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
    color: COLORS.textMuted,
    marginBottom: SIZES.margin / 2,
  },
  required: {
    color: COLORS.error,
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
    gap: SIZES.margin,
  },

  // Select / Radio
  selectContainer: {
    flexDirection: 'row',
  },
  radioContainer: {
    flexDirection: 'row',
    gap: SIZES.margin,
    marginTop: 4,
  },
  radioButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    backgroundColor: COLORS.inputBackground,
  },
  radioButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}1A`,
  },
  radioText: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
  },
  radioTextActive: {
    color: COLORS.primary,
  },

  // Switch
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.margin,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    marginTop: SIZES.margin,
  },
  switchLabel: {
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },

  // Permanent Address
  permanentAddress: {
    marginTop: SIZES.margin,
    paddingTop: SIZES.margin,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
  },

  // Vehicle Type
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

  // Documents
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
    padding: SIZES.padding * 0.8,
    alignItems: 'center',
    gap: 4,
    minHeight: 70,
  },
  docButtonUploaded: {
    borderColor: '#22c55e',
    backgroundColor: `${COLORS.primary}0A`,
  },
  docLabel: {
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
    textAlign: 'center',
  },
  docRequired: {
    color: COLORS.error,
    fontSize: SIZES.small,
    fontFamily: FONTS.bold,
  },
  docUploadedText: {
    fontSize: 10,
    color: '#22c55e',
    fontFamily: FONTS.bold,
  },

  // Note Box
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: `${COLORS.primary}0A`,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
    padding: SIZES.padding,
    marginTop: SIZES.margin,
  },
  noteText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    lineHeight: 18,
  },

  // Navigation
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

  // Success Screen
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 3,
    backgroundColor: COLORS.background,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}1A`,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.margin * 2,
  },
  successTitle: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.margin,
  },
  successSubtitle: {
    fontSize: SIZES.medium,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SIZES.margin * 3,
  },
  successButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 3,
    paddingVertical: SIZES.padding * 1.2,
    borderRadius: SIZES.radius,
  },
  successButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
});