// cabindia-mobile/src/utils/api.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants'; // NEW

// IMPORTANT: Replace this with your actual backend IP or domain during development.
// For production, this should be a stable URL.
// Ensure your backend server is running and accessible from your device.
const API_URL = 'http://192.168.29.203:5000/api'; 
// IMPORTANT: Replace YOUR_ACTUAL_LOCAL_IP_ADDRESS with your machine's local IP address.
// For example, if your IP is 192.168.1.5, it would be 'http://192.168.1.5:5000/api'.
// For Expo Go, ensure this IP is accessible from your device.

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
