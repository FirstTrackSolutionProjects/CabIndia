// cabindia-mobile/src/utils/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get API URL from environment
const API_URL = process.env.API_URL || Constants.expoConfig?.extra?.apiUrl || 'http://192.168.29.203:5000';

// For production, use deployed backend URL
// const API_URL = 'https://your-backend.onrender.com';

console.log('API_URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers['x-auth-token'] = token;
      }
      console.log('Request:', config.method.toUpperCase(), config.url);
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    
    // Handle token expiration
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    }
    
    return Promise.reject(error);
  }
);

export default api;