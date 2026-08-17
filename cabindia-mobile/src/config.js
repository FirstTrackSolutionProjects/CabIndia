// cabindia-mobile/src/config.js (UPDATED)
import Constants from 'expo-constants';

// Get API URL from environment - using Constants exclusively
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://cabindia-mobile.onrender.com';
const SOCKET_URL = Constants.expoConfig?.extra?.socketUrl || API_URL;

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.android?.config?.googleMaps?.apiKey || 
                           Constants.expoConfig?.ios?.infoPlist?.GOOGLE_MAPS_API_KEY ||
                           'AIzaSyAD7ImoIAlAk6Ob9Iwyd_67UFr9lCNVTNY';

// Google OAuth Config - UPDATED
const GOOGLE_CLIENT_ID = Constants.expoConfig?.extra?.googleClientId || 
                         '79474403137-kf7plivtq1cgkkeapit16a45oskepvtb.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = Constants.expoConfig?.extra?.googleClientSecret || 
                             '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';
const GOOGLE_PROJECT_ID = Constants.expoConfig?.extra?.googleProjectId || 
                           'single-obelisk-504908-p6';

// Web Client ID (for backend verification)
const GOOGLE_WEB_CLIENT_ID = '79474403137-kf7plivtq1cgkkeapit16a45oskepvtb.apps.googleusercontent.com';

// Android Client ID (for Android app)
const GOOGLE_ANDROID_CLIENT_ID = Constants.expoConfig?.extra?.googleAndroidClientId || 
                                  '79474403137-kf7plivtq1cgkkeapit16a45oskepvtb.apps.googleusercontent.com';

// iOS Client ID (for iOS app)
const GOOGLE_IOS_CLIENT_ID = Constants.expoConfig?.extra?.googleIOSClientId || 
                              '79474403137-kf7plivtq1cgkkeapit16a45oskepvtb.apps.googleusercontent.com';

export {
  API_URL,
  SOCKET_URL,
  GOOGLE_MAPS_API_KEY,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_PROJECT_ID,
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID
};