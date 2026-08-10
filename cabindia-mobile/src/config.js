// cabindia-mobile/src/config.js
import Constants from 'expo-constants';

// Get API URL from environment - using Constants exclusively
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://cabindia-mobile.onrender.com';
const SOCKET_URL = Constants.expoConfig?.extra?.socketUrl || API_URL;

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.android?.config?.googleMaps?.apiKey || 
                           Constants.expoConfig?.ios?.infoPlist?.GOOGLE_MAPS_API_KEY ||
                           'AIzaSyAD7ImoIAlAk6Ob9Iwyd_67UFr9lCNVTNY';

// Google OAuth Config
const GOOGLE_CLIENT_ID = Constants.expoConfig?.extra?.googleClientId || 
                         '79474403137-kf7plivtq1cgkkeapit16a45oskepvtb.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = Constants.expoConfig?.extra?.googleClientSecret || '';

export {
  API_URL,
  SOCKET_URL,
  GOOGLE_MAPS_API_KEY,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET
};