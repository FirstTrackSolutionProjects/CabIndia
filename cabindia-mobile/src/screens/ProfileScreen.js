// cabindia-mobile/src/screens/ProfileScreen.js
import React, { useContext, useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, 
  ActivityIndicator, ScrollView, TextInput, Modal,
  Switch, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../utils/api';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { userData, login, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  
  // Edit Profile Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  
  // Payment Methods State
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'cash', name: 'Cash', icon: 'cash-outline', enabled: true, default: true },
    { id: 'upi', name: 'UPI', icon: 'phone-portrait-outline', enabled: true, default: false },
    { id: 'card', name: 'Credit/Debit Card', icon: 'card-outline', enabled: false, default: false },
    { id: 'wallet', name: 'Wallet', icon: 'wallet-outline', enabled: false, default: false },
  ]);
  const [defaultPayment, setDefaultPayment] = useState('cash');
  
  // Settings State
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    locationTracking: true,
    shareData: false,
    autoBook: false,
  });

  // Load user profile data
  useEffect(() => {
    if (userData) {
      setUserProfile(userData);
      setEditName(userData.name || '');
      setEditEmail(userData.email || '');
      setEditMobile(userData.mobile || '');
      setProfileImage(userData.profileImage || null);
    }
    fetchPaymentMethods();
    fetchSettings();
  }, [userData]);

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
          autoBook: data.auto_book === 1,
        });
      }
    } catch (error) {
      console.log('Settings fetch error:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            setLoading(true);
            await logout();
            setLoading(false);
          },
          style: "destructive"
        }
      ]
    );
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
        
        // Upload profile picture
        setLoading(true);
        try {
          const response = await api.post('/api/user/profile-picture', {
            image: base64,
          });
          
          if (response.data.success) {
            setProfileImage(imageUri);
            const updatedUser = { ...userProfile, profileImage: imageUri };
            await login(userData.token, updatedUser);
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

  // ==================== PAYMENT METHODS ====================
  const openPaymentMethods = () => {
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
    setEditLoading(true);
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
      setEditLoading(false);
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
    setEditLoading(true);
    try {
      const response = await api.post('/api/user/settings', settings);
      
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
      setEditLoading(false);
    }
  };

  // ==================== RENDER ====================
  if (!userProfile) {
    return (
      <View style={[GLOBAL_STYLES.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={GLOBAL_STYLES.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
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
        <Text style={styles.name}>{userProfile.name || 'User Name'}</Text>
        <Text style={styles.email}>{userProfile.email || 'user@example.com'}</Text>
        {userProfile.mobile && (
          <Text style={styles.mobile}>{userProfile.mobile}</Text>
        )}
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Customer</Text>
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

        {/* Payment Methods */}
        <TouchableOpacity style={styles.menuItem} onPress={openPaymentMethods}>
          <View style={styles.menuIconWrapper}>
            <Ionicons name="card-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.menuText}>Payment Methods</Text>
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
        <TouchableOpacity
          style={[styles.menuItem, styles.logoutButton]}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.error} />
          ) : (
            <>
              <View style={[styles.menuIconWrapper, styles.logoutIconWrapper]}>
                <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              </View>
              <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={styles.menuArrow} />
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>CabIndia v1.0.0</Text>
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

      {/* ==================== PAYMENT METHODS MODAL ==================== */}
      <Modal
        visible={paymentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Methods</Text>
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
            
            <View style={styles.modalBody}>
              <View style={styles.settingRow}>
                <View>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingDesc}>Receive ride alerts and updates</Text>
                </View>
                <Switch
                  value={settings.notifications}
                  onValueChange={() => toggleSetting('notifications')}
                  trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
                  thumbColor={settings.notifications ? '#000' : '#fff'}
                />
              </View>

              <View style={styles.settingRow}>
                <View>
                  <Text style={styles.settingLabel}>Dark Mode</Text>
                  <Text style={styles.settingDesc}>Dark theme preference</Text>
                </View>
                <Switch
                  value={settings.darkMode}
                  onValueChange={() => toggleSetting('darkMode')}
                  trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
                  thumbColor={settings.darkMode ? '#000' : '#fff'}
                />
              </View>

              <View style={styles.settingRow}>
                <View>
                  <Text style={styles.settingLabel}>Location Tracking</Text>
                  <Text style={styles.settingDesc}>Allow app to track your location</Text>
                </View>
                <Switch
                  value={settings.locationTracking}
                  onValueChange={() => toggleSetting('locationTracking')}
                  trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
                  thumbColor={settings.locationTracking ? '#000' : '#fff'}
                />
              </View>

              <View style={styles.settingRow}>
                <View>
                  <Text style={styles.settingLabel}>Share Data</Text>
                  <Text style={styles.settingDesc}>Share anonymized data for improvements</Text>
                </View>
                <Switch
                  value={settings.shareData}
                  onValueChange={() => toggleSetting('shareData')}
                  trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
                  thumbColor={settings.shareData ? '#000' : '#fff'}
                />
              </View>

              <View style={styles.settingRow}>
                <View>
                  <Text style={styles.settingLabel}>Auto-Book</Text>
                  <Text style={styles.settingDesc}>Automatically book preferred ride</Text>
                </View>
                <Switch
                  value={settings.autoBook}
                  onValueChange={() => toggleSetting('autoBook')}
                  trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
                  thumbColor={settings.autoBook ? '#000' : '#fff'}
                />
              </View>
            </View>
            
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
    fontSize: SIZES.h1,
    fontFamily: FONTS.bold,
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
    fontSize: SIZES.body,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
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
  footer: {
    padding: SIZES.padding,
    alignItems: 'center',
    marginTop: SIZES.margin * 2,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  settingLabel: {
    color: COLORS.text,
    fontSize: SIZES.medium,
    fontFamily: FONTS.semibold,
  },
  settingDesc: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    marginTop: 2,
  },
});