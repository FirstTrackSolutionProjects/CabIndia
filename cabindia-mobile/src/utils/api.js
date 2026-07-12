// cabindia-mobile/src/utils/api.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants'; // NEW

// IMPORTANT: For development, ensure this URL points to your backend.
// Use `Constants.expoConfig.extra.apiUrl` if available, otherwise fallback.
const API_URL = Constants.expoConfig.extra.apiUrl || 'http://192.168.29.203:5000/api'; // Fallback to a hardcoded local IP

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
