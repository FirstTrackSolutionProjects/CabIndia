// cabindia-captain/src/screens/ProfileScreen.js
import React, { useContext, useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, 
  ActivityIndicator, ScrollView, TextInput, Modal,
  Switch, KeyboardAvoidingView, Platform, Image 
} from 'react-native';
import { AuthContext } from '../../App';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../utils/api';

export default function ProfileScreen({ navigation }) {
  const { userData, logout, login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  
  // Edit Profile Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  
  // Vehicle Details Modal State
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [vehicleDetails, setVehicleDetails] = useState({
    vehicleType: 'Sedan',
    vehicleModel: '',
    licensePlate: '',
    vehicleColor: '',
    rcNumber: '',
    chassisNumber: '',
    pollutionValid: true,
    insuranceValid: true,
  });
  const [vehicleLoading, setVehicleLoading] = useState(false);
  
  // Bank Verification Modal State
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',
  });
  const [bankLoading, setBankLoading] = useState(false);
  
  // Payment Settings Modal State
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'cash', name: 'Cash', icon: 'cash-outline', enabled: true, default: true },
    { id: 'upi', name: 'UPI', icon: 'phone-portrait-outline', enabled: true, default: false },
    { id: 'card', name: 'Credit/Debit Card', icon: 'card-outline', enabled: false, default: false },
    { id: 'wallet', name: 'Wallet', icon: 'wallet-outline', enabled: false, default: false },
  ]);
  const [defaultPayment, setDefaultPayment] = useState('cash');
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // Settings Modal State
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    locationTracking: true,
    shareData: false,
    autoAccept: false,
    soundEffects: true,
    vibration: true,
    language: 'English',
    measurementUnit: 'km',
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Load user profile data
  useEffect(() => {
    if (userData) {
      setUserProfile(userData);
      setEditName(userData.name || '');
      setEditEmail(userData.email || '');
      setEditMobile(userData.mobile || '');
      setProfileImage(userData.profileImage || null);
    }
    fetchVehicleDetails();
    fetchPaymentMethods();
    fetchSettings();
    fetchBankDetails();
  }, [userData]);

  const fetchVehicleDetails = async () => {
    try {
      const response = await api.get('/api/drivers/vehicle');
      if (response.data.success) {
        setVehicleDetails(response.data.vehicle);
      }
    } catch (error) {
      console.log('Vehicle fetch error:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await api.get('/api/user/payment-methods');
      if (response.data.success) {
        setPaymentMethods(response.data.methods);
        setDefaultPayment(response.data.defaultMethod);
      }
    } catch (error) {
      console.log('Payment methods fetch error:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/user/settings');
      if (response.data.success) {
        const data = response.data.settings;
        setSettings({
          notifications: data.notifications === 1,
          darkMode: data.dark_mode === 1,
          locationTracking: data.location_tracking === 1,
          shareData: data.share_data === 1,
          autoAccept: data.auto_accept === 1,
          soundEffects: data.sound_effects !== undefined ? data.sound_effects === 1 : true,
          vibration: data.vibration !== undefined ? data.vibration === 1 : true,
          language: data.language || 'English',
          measurementUnit: data.measurement_unit || 'km',
        });
      }
    } catch (error) {
      console.log('Settings fetch error:', error);
    }
  };

  const fetchBankDetails = async () => {
    try {
      const response = await api.get('/api/drivers/bank-details');
      if (response.data.success) {
        setBankDetails(response.data.bankDetails);
      }
    } catch (error) {
      console.log('Bank details fetch error:', error);
    }
  };

  // ==================== PROFILE PICTURE ====================
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permission to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const base64 = result.assets[0].base64;
        
        setLoading(true);
        try {
          const response = await api.post('/api/user/profile-picture', {
            image: base64,
          });
          
          if (response.data.success) {
            setProfileImage(imageUri);
            const updatedUser = { ...userProfile, profileImage: imageUri };
            await login(response.data.token, updatedUser);
            Alert.alert('Success', 'Profile picture updated!');
          } else {
            Alert.alert('Error', response.data.message || 'Failed to upload image');
          }
        } catch (error) {
          console.error('Image upload error:', error);
          Alert.alert('Error', 'Failed to upload profile picture');
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Image pick error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  // ==================== EDIT PROFILE ====================
  const openEditProfile = () => {
    setEditName(userProfile?.name || '');
    setEditEmail(userProfile?.email || '');
    setEditMobile(userProfile?.mobile || '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    
    setEditLoading(true);
    try {
      const response = await api.put('/api/user/profile', {
        name: editName.trim(),
        email: editEmail.trim(),
        mobile: editMobile.trim(),
      });
      
      if (response.data.success) {
        const updatedUser = { ...userProfile, name: editName.trim(), email: editEmail.trim(), mobile: editMobile.trim() };
        await login(response.data.token, updatedUser);
        setUserProfile(updatedUser);
        setEditModalVisible(false);
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  // ==================== VEHICLE DETAILS ====================
  const openVehicleDetails = () => {
    setVehicleModalVisible(true);
  };

  const handleVehicleChange = (key, value) => {
    setVehicleDetails(prev => ({ ...prev, [key]: value }));
  };

  const saveVehicleDetails = async () => {
    if (!vehicleDetails.vehicleModel || !vehicleDetails.licensePlate) {
      Alert.alert('Error', 'Vehicle Model and License Plate are required');
      return;
    }
    
    setVehicleLoading(true);
    try {
      const response = await api.put('/api/drivers/vehicle', vehicleDetails);
      
      if (response.data.success) {
        setVehicleModalVisible(false);
        Alert.alert('Success', 'Vehicle details updated successfully!');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update vehicle details');
      }
    } catch (error) {
      console.error('Vehicle update error:', error);
      Alert.alert('Error', 'Failed to save vehicle details');
    } finally {
      setVehicleLoading(false);
    }
  };

  // ==================== BANK VERIFICATION ====================
  const openBankVerification = () => {
    setBankModalVisible(true);
  };

  const handleBankChange = (key, value) => {
    setBankDetails(prev => ({ ...prev, [key]: value }));
  };

  const saveBankDetails = async () => {
    if (!bankDetails.accountHolderName || !bankDetails.accountNumber || 
        !bankDetails.ifsc || !bankDetails.bankName) {
      Alert.alert('Error', 'All bank details are required');
      return;
    }
    
    setBankLoading(true);
    try {
      const response = await api.post('/api/drivers/bank-details', bankDetails);
      
      if (response.data.success) {
        setBankModalVisible(false);
        Alert.alert('Success', 'Bank details verified successfully!');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to verify bank details');
      }
    } catch (error) {
      console.error('Bank details save error:', error);
      Alert.alert('Error', 'Failed to save bank details');
    } finally {
      setBankLoading(false);
    }
  };

  // ==================== PAYMENT SETTINGS ====================
  const openPaymentSettings = () => {
    setPaymentModalVisible(true);
  };

  const togglePaymentMethod = (id) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === id ? { ...method, enabled: !method.enabled } : method
      )
    );
  };

  const setDefaultPaymentMethod = (id) => {
    setDefaultPayment(id);
    setPaymentMethods(prev => 
      prev.map(method => ({ ...method, default: method.id === id }))
    );
  };

  const savePaymentMethods = async () => {
    setPaymentLoading(true);
    try {
      const response = await api.post('/api/user/payment-methods', {
        methods: paymentMethods,
        defaultMethod: defaultPayment,
      });
      
      if (response.data.success) {
        setPaymentModalVisible(false);
        Alert.alert('Success', 'Payment methods updated successfully!');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update payment methods');
      }
    } catch (error) {
      console.error('Payment methods save error:', error);
      Alert.alert('Error', 'Failed to save payment methods');
    } finally {
      setPaymentLoading(false);
    }
  };

  // ==================== SETTINGS ====================
  const openSettings = () => {
    setSettingsModalVisible(true);
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveSettings = async () => {
    setSettingsLoading(true);
    try {
      const response = await api.post('/api/user/settings', {
        notifications: settings.notifications,
        darkMode: settings.darkMode,
        locationTracking: settings.locationTracking,
        shareData: settings.shareData,
        autoAccept: settings.autoAccept,
        soundEffects: settings.soundEffects,
        vibration: settings.vibration,
        language: settings.language,
        measurementUnit: settings.measurementUnit,
      });
      
      if (response.data.success) {
        setSettingsModalVisible(false);
        Alert.alert('Success', 'Settings updated successfully!');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Settings save error:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  if (!userProfile) {
    return (
      <View style={[GLOBAL_STYLES.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={GLOBAL_STYLES.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={40} color={COLORS.primary} />
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={14} color={COLORS.background} />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{userProfile?.name || 'Captain'}</Text>
        <Text style={styles.email}>{userProfile?.email || 'captain@cabindia.in'}</Text>
        {userProfile?.mobile && (
          <Text style={styles.mobile}>📱 {userProfile.mobile}</Text>
        )}
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Captain</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {/* Edit Profile */}
        <TouchableOpacity style={styles.menuItem} onPress={openEditProfile}>
          <View style={styles.menuIconWrapper}>
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={styles.menuArrow} />
        </TouchableOpacity>

        {/* Vehicle Details */}
        <TouchableOpacity style={styles.menuItem} onPress={openVehicleDetails}>
          <View style={styles.menuIconWrapper}>
            <Ionicons name="car-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.menuText}>Vehicle Details</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={styles.menuArrow} />
        </TouchableOpacity>

        {/* Bank Verification */}
        <TouchableOpacity style={styles.menuItem} onPress={openBankVerification}>
          <View style={styles.menuIconWrapper}>
            <Ionicons name="card-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.menuText}>Bank Verification</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={styles.menuArrow} />
        </TouchableOpacity>

        {/* Payment Settings */}
        <TouchableOpacity style={styles.menuItem} onPress={openPaymentSettings}>
          <View style={styles.menuIconWrapper}>
            <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.menuText}>Payment Settings</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={styles.menuArrow} />
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity style={styles.menuItem} onPress={openSettings}>
          <View style={styles.menuIconWrapper}>
            <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={styles.menuArrow} />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Logout */}
        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
          <View style={[styles.menuIconWrapper, styles.logoutIconWrapper]}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          </View>
          <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={styles.menuArrow} />
        </TouchableOpacity>
      </View>

      {/* ==================== EDIT PROFILE MODAL ==================== */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.textMuted}
                  value={editName}
                  onChangeText={setEditName}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.textMuted}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter your mobile number"
                  placeholderTextColor={COLORS.textMuted}
                  value={editMobile}
                  onChangeText={setEditMobile}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]} 
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSaveButton]} 
                onPress={handleSaveProfile}
                disabled={editLoading}
              >
                {editLoading ? (
                  <ActivityIndicator color={COLORS.background} size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ==================== VEHICLE DETAILS MODAL ==================== */}
      <Modal
        visible={vehicleModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setVehicleModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vehicle Details</Text>
              <TouchableOpacity onPress={() => setVehicleModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Vehicle Type</Text>
                <View style={styles.typeContainer}>
                  {['Auto', 'Bike', 'Mini', 'Sedan', 'SUV', 'Parcel'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        vehicleDetails.vehicleType === type && styles.typeButtonActive,
                      ]}
                      onPress={() => handleVehicleChange('vehicleType', type)}
                    >
                      <Text style={[
                        styles.typeText,
                        vehicleDetails.vehicleType === type && styles.typeTextActive,
                      ]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Vehicle Model *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Maruti Suzuki Swift"
                  placeholderTextColor={COLORS.textMuted}
                  value={vehicleDetails.vehicleModel}
                  onChangeText={(text) => handleVehicleChange('vehicleModel', text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>License Plate *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="OD 01 AB 1234"
                  placeholderTextColor={COLORS.textMuted}
                  value={vehicleDetails.licensePlate}
                  onChangeText={(text) => handleVehicleChange('licensePlate', text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Vehicle Color</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. White, Red"
                  placeholderTextColor={COLORS.textMuted}
                  value={vehicleDetails.vehicleColor}
                  onChangeText={(text) => handleVehicleChange('vehicleColor', text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>RC Number</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Registration certificate number"
                  placeholderTextColor={COLORS.textMuted}
                  value={vehicleDetails.rcNumber}
                  onChangeText={(text) => handleVehicleChange('rcNumber', text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chassis Number</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Vehicle chassis number"
                  placeholderTextColor={COLORS.textMuted}
                  value={vehicleDetails.chassisNumber}
                  onChangeText={(text) => handleVehicleChange('chassisNumber', text)}
                />
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Pollution Certificate Valid</Text>
                <Switch
                  value={vehicleDetails.pollutionValid}
                  onValueChange={(value) => handleVehicleChange('pollutionValid', value)}
                  trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
                  thumbColor={vehicleDetails.pollutionValid ? '#000' : '#fff'}
                />
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Insurance Valid</Text>
                <Switch
                  value={vehicleDetails.insuranceValid}
                  onValueChange={(value) => handleVehicleChange('insuranceValid', value)}
                  trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
                  thumbColor={vehicleDetails.insuranceValid ? '#000' : '#fff'}
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]} 
                onPress={() => setVehicleModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSaveButton]} 
                onPress={saveVehicleDetails}
                disabled={vehicleLoading}
              >
                {vehicleLoading ? (
                  <ActivityIndicator color={COLORS.background} size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ==================== BANK VERIFICATION MODAL ==================== */}
      <Modal
        visible={bankModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setBankModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bank Verification</Text>
              <TouchableOpacity onPress={() => setBankModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Holder Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="As per bank records"
                  placeholderTextColor={COLORS.textMuted}
                  value={bankDetails.accountHolderName}
                  onChangeText={(text) => handleBankChange('accountHolderName', text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Number *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter account number"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={bankDetails.accountNumber}
                  onChangeText={(text) => handleBankChange('accountNumber', text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>IFSC Code *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="SBIN0001234"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="characters"
                  value={bankDetails.ifsc}
                  onChangeText={(text) => handleBankChange('ifsc', text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bank Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="State Bank of India"
                  placeholderTextColor={COLORS.textMuted}
                  value={bankDetails.bankName}
                  onChangeText={(text) => handleBankChange('bankName', text)}
                />
              </View>

              <View style={styles.noteBox}>
                <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                <Text style={styles.noteText}>
                  Your bank details will be verified within 48 hours. This is required for payment processing.
                </Text>
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]} 
                onPress={() => setBankModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSaveButton]} 
                onPress={saveBankDetails}
                disabled={bankLoading}
              >
                {bankLoading ? (
                  <ActivityIndicator color={COLORS.background} size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ==================== PAYMENT SETTINGS MODAL ==================== */}
      <Modal
        visible={paymentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Settings</Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {paymentMethods.map((method) => (
                <View key={method.id} style={styles.paymentMethodRow}>
                  <View style={styles.paymentMethodLeft}>
                    <Ionicons name={method.icon} size={22} color={COLORS.primary} />
                    <Text style={styles.paymentMethodName}>{method.name}</Text>
                  </View>
                  <View style={styles.paymentMethodRight}>
                    <TouchableOpacity
                      onPress={() => setDefaultPaymentMethod(method.id)}
                      style={[
                        styles.defaultButton,
                        method.default && styles.defaultButtonActive,
                      ]}
                    >
                      <Text style={[
                        styles.defaultButtonText,
                        method.default && styles.defaultButtonTextActive,
                      ]}>
                        {method.default ? 'Default' : 'Set Default'}
                      </Text>
                    </TouchableOpacity>
                    <Switch
                      value={method.enabled}
                      onValueChange={() => togglePaymentMethod(method.id)}
                      trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
                      thumbColor={method.enabled ? '#000' : '#fff'}
                    />
                  </View>
                </View>
              ))}
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]} 
                onPress={() => setPaymentModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSaveButton]} 
                onPress={savePaymentMethods}
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <ActivityIndicator color={COLORS.background} size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ==================== SETTINGS MODAL ==================== */}
      <Modal
        visible={settingsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.settingSection}>
                <Text style={styles.sectionTitle}>General</Text>
                
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingLabel}>Push Notifications</Text>
                      <Text style={styles.settingDesc}>Receive ride alerts and updates</Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.notifications}
                    onValueChange={() => toggleSetting('notifications')}
                    trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
                    thumbColor={settings.notifications ? '#000' : '#fff'}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="moon-outline" size={20} color={COLORS.primary} />
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingLabel}>Dark Mode</Text>
                      <Text style={styles.settingDesc}>Dark theme preference</Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.darkMode}
                    onValueChange={() => toggleSetting('darkMode')}
                    trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
                    thumbColor={settings.darkMode ? '#000' : '#fff'}
                  />
                </View>
              </View>

              <View style={styles.settingSection}>
                <Text style={styles.sectionTitle}>Privacy</Text>
                
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingLabel}>Location Tracking</Text>
                      <Text style={styles.settingDesc}>Allow app to track your location</Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.locationTracking}
                    onValueChange={() => toggleSetting('locationTracking')}
                    trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
                    thumbColor={settings.locationTracking ? '#000' : '#fff'}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="share-outline" size={20} color={COLORS.primary} />
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingLabel}>Share Data</Text>
                      <Text style={styles.settingDesc}>Share anonymized data for improvements</Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.shareData}
                    onValueChange={() => toggleSetting('shareData')}
                    trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
                    thumbColor={settings.shareData ? '#000' : '#fff'}
                  />
                </View>
              </View>

              <View style={styles.settingSection}>
                <Text style={styles.sectionTitle}>Ride Preferences</Text>
                
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="car-outline" size={20} color={COLORS.primary} />
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingLabel}>Auto-Accept Rides</Text>
                      <Text style={styles.settingDesc}>Automatically accept ride requests</Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.autoAccept}
                    onValueChange={() => toggleSetting('autoAccept')}
                    trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
                    thumbColor={settings.autoAccept ? '#000' : '#fff'}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="speedometer-outline" size={20} color={COLORS.primary} />
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingLabel}>Measurement Unit</Text>
                      <Text style={styles.settingDesc}>Distance unit preference</Text>
                    </View>
                  </View>
                  <View style={styles.unitSelector}>
                    <TouchableOpacity
                      style={[
                        styles.unitButton,
                        settings.measurementUnit === 'km' && styles.unitButtonActive,
                      ]}
                      onPress={() => setSettings(prev => ({ ...prev, measurementUnit: 'km' }))}
                    >
                      <Text style={[
                        styles.unitText,
                        settings.measurementUnit === 'km' && styles.unitTextActive,
                      ]}>KM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.unitButton,
                        settings.measurementUnit === 'miles' && styles.unitButtonActive,
                      ]}
                      onPress={() => setSettings(prev => ({ ...prev, measurementUnit: 'miles' }))}
                    >
                      <Text style={[
                        styles.unitText,
                        settings.measurementUnit === 'miles' && styles.unitTextActive,
                      ]}>Miles</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.settingSection}>
                <Text style={styles.sectionTitle}>Sound & Vibration</Text>
                
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="volume-high-outline" size={20} color={COLORS.primary} />
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingLabel}>Sound Effects</Text>
                      <Text style={styles.settingDesc}>Play sounds for ride events</Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.soundEffects}
                    onValueChange={() => toggleSetting('soundEffects')}
                    trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
                    thumbColor={settings.soundEffects ? '#000' : '#fff'}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="phone-portrait-outline" size={20} color={COLORS.primary} />
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingLabel}>Vibration</Text>
                      <Text style={styles.settingDesc}>Vibrate for ride notifications</Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.vibration}
                    onValueChange={() => toggleSetting('vibration')}
                    trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
                    thumbColor={settings.vibration ? '#000' : '#fff'}
                  />
                </View>
              </View>

              <View style={styles.settingSection}>
                <Text style={styles.sectionTitle}>Language</Text>
                
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="language-outline" size={20} color={COLORS.primary} />
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingLabel}>App Language</Text>
                      <Text style={styles.settingDesc}>Select your preferred language</Text>
                    </View>
                  </View>
                  <View style={styles.languageSelector}>
                    <TouchableOpacity
                      style={[
                        styles.langButton,
                        settings.language === 'English' && styles.langButtonActive,
                      ]}
                      onPress={() => setSettings(prev => ({ ...prev, language: 'English' }))}
                    >
                      <Text style={[
                        styles.langText,
                        settings.language === 'English' && styles.langTextActive,
                      ]}>EN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.langButton,
                        settings.language === 'Hindi' && styles.langButtonActive,
                      ]}
                      onPress={() => setSettings(prev => ({ ...prev, language: 'Hindi' }))}
                    >
                      <Text style={[
                        styles.langText,
                        settings.language === 'Hindi' && styles.langTextActive,
                      ]}>HI</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.langButton,
                        settings.language === 'Odia' && styles.langButtonActive,
                      ]}
                      onPress={() => setSettings(prev => ({ ...prev, language: 'Odia' }))}
                    >
                      <Text style={[
                        styles.langText,
                        settings.language === 'Odia' && styles.langTextActive,
                      ]}>OR</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]} 
                onPress={() => setSettingsModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSaveButton]} 
                onPress={saveSettings}
                disabled={settingsLoading}
              >
                {settingsLoading ? (
                  <ActivityIndicator color={COLORS.background} size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Save Settings</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.textMuted,
    marginTop: SIZES.margin,
    fontSize: SIZES.medium,
  },
  header: {
    paddingVertical: SIZES.padding * 2,
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: COLORS.borderColor,
  },
  headerTitle: {
    ...GLOBAL_STYLES.heading1,
    color: COLORS.primary,
  },
  profileCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius * 2,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    padding: SIZES.padding * 2,
    margin: SIZES.padding,
    alignItems: 'center',
    marginTop: SIZES.padding * 2,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}1A`,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.margin,
    position: 'relative',
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  name: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  email: {
    fontSize: SIZES.medium,
    color: COLORS.textMuted,
  },
  mobile: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: SIZES.margin,
  },
  badge: {
    backgroundColor: `${COLORS.primary}1A`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: SIZES.small,
    fontFamily: FONTS.bold,
  },
  menuContainer: {
    paddingHorizontal: SIZES.padding,
    marginTop: SIZES.margin,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin,
  },
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.margin,
  },
  menuText: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.body,
    fontFamily: FONTS.semibold,
    flex: 1,
  },
  menuArrow: {
    marginLeft: 'auto',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderColor,
    marginVertical: SIZES.margin,
  },
  logoutButton: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  logoutIconWrapper: {
    backgroundColor: `${COLORS.error}1A`,
  },
  logoutText: {
    color: COLORS.error,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    padding: SIZES.padding * 1.5,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  modalBody: {
    paddingVertical: SIZES.padding,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.margin,
    paddingTop: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SIZES.padding * 0.8,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  modalCancelText: {
    color: COLORS.text,
    fontFamily: FONTS.semibold,
    fontSize: SIZES.medium,
  },
  modalSaveButton: {
    backgroundColor: COLORS.primary,
  },
  modalSaveText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },

  // Edit Profile Inputs
  inputGroup: {
    marginBottom: SIZES.margin * 1.5,
  },
  inputLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.8,
    color: COLORS.text,
    fontSize: SIZES.body,
  },

  // Vehicle Details
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
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

  // Bank Verification
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

  // Payment Methods
  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin,
  },
  paymentMethodName: {
    color: COLORS.text,
    fontSize: SIZES.medium,
    fontFamily: FONTS.semibold,
  },
  paymentMethodRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin,
  },
  defaultButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  defaultButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  defaultButtonText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: FONTS.semibold,
  },
  defaultButtonTextActive: {
    color: COLORS.background,
  },

  // Settings
  settingSection: {
    marginBottom: SIZES.margin * 2,
  },
  sectionTitle: {
    color: COLORS.primary,
    fontSize: SIZES.small,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SIZES.margin,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SIZES.margin,
  },
  settingTextContainer: {
    marginLeft: SIZES.margin,
    flex: 1,
  },
  settingLabel: {
    color: COLORS.text,
    fontSize: SIZES.medium,
    fontFamily: FONTS.semibold,
  },
  settingDesc: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    marginTop: 1,
  },
  unitSelector: {
    flexDirection: 'row',
    gap: 4,
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  unitButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  unitText: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
  },
  unitTextActive: {
    color: COLORS.background,
  },
  languageSelector: {
    flexDirection: 'row',
    gap: 4,
  },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  langButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  langText: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
  },
  langTextActive: {
    color: COLORS.background,
  },
});