// cabindia-mobile/src/screens/MoreScreen.js
import React, { useContext, useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, 
  ScrollView, Modal, Switch, ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';

export default function MoreScreen() {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
  
  // Settings State
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    locationTracking: true,
    shareData: false,
    autoBook: false,
    soundEffects: true,
    vibration: true,
    language: 'English',
    measurementUnit: 'km',
  });

  // Load settings from API
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/user/settings');
      if (response.data.success) {
        const data = response.data.settings;
        setSettings({
          notifications: data.notifications === 1,
          darkMode: data.dark_mode === 1,
          locationTracking: data.location_tracking === 1,
          shareData: data.share_data === 1,
          autoBook: data.auto_book === 1,
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

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            await logout();
          },
          style: "destructive"
        }
      ]
    );
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const response = await api.post('/user/settings', {
        notifications: settings.notifications,
        darkMode: settings.darkMode,
        locationTracking: settings.locationTracking,
        shareData: settings.shareData,
        autoBook: settings.autoBook,
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
      setLoading(false);
    }
  };

  const menuItems = [
    {
      id: 'support',
      title: 'Support / Help',
      icon: 'chatbubble-outline',
      action: () => navigation.navigate('Chat')
    },
    {
      id: 'safety',
      title: 'Safety Features',
      icon: 'shield-outline',
      action: () => navigation.navigate('SafetyScreen')
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: 'document-text-outline',
      action: () => navigation.navigate('PolicyScreen', {
        title: 'Privacy Policy',
        sections: [
          { title: 'Data Collection', content: 'We collect your name, email, and location to provide services.' },
          { title: 'Data Usage', content: 'Your data is used to improve our services and personalize your experience.' }
        ]
      })
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      icon: 'book-outline',
      action: () => navigation.navigate('PolicyScreen', {
        title: 'Terms & Conditions',
        sections: [
          { title: 'Service Agreement', content: 'By using CabIndia, you agree to our terms of service.' },
          { title: 'User Conduct', content: 'Users must adhere to community guidelines and refrain from misuse.' }
        ]
      })
    },
    {
      id: 'settings',
      title: 'App Settings',
      icon: 'settings-outline',
      action: () => setSettingsModalVisible(true)
    },
  ];

  return (
    <ScrollView style={GLOBAL_STYLES.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More Options</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.action}>
            <Ionicons name={item.icon} size={SIZES.large} color={COLORS.primary} />
            <Text style={styles.menuText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={SIZES.medium} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={SIZES.large} color={COLORS.error} />
          <Text style={[styles.menuText, { color: COLORS.error }]}>Logout</Text>
        </TouchableOpacity>
      </View>

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
              <Text style={styles.modalTitle}>App Settings</Text>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Notification Settings */}
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

              {/* Privacy Settings */}
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

              {/* Ride Settings */}
              <View style={styles.settingSection}>
                <Text style={styles.sectionTitle}>Ride Preferences</Text>
                
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="car-outline" size={20} color={COLORS.primary} />
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingLabel}>Auto-Book</Text>
                      <Text style={styles.settingDesc}>Automatically book preferred ride</Text>
                    </View>
                  </View>
                  <Switch
                    value={settings.autoBook}
                    onValueChange={() => toggleSetting('autoBook')}
                    trackColor={{ false: COLORS.borderColor, true: COLORS.primary }}
                    thumbColor={settings.autoBook ? '#000' : '#fff'}
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

              {/* Sound & Vibration */}
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

              {/* Language */}
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
                disabled={loading}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSaveButton]} 
                onPress={saveSettings}
                disabled={loading}
              >
                {loading ? (
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
  menuContainer: {
    padding: SIZES.padding,
    marginTop: SIZES.margin * 2,
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
    gap: SIZES.margin,
  },
  menuText: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.body,
    fontFamily: FONTS.semibold,
    flex: 1,
  },
  logoutButton: {
    marginTop: SIZES.margin * 3,
    borderColor: COLORS.error,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    padding: SIZES.padding * 1.5,
    maxHeight: '92%',
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
    maxHeight: '75%',
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

  // Settings Styles
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