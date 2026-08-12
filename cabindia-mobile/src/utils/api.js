// cabindia-mobile/src/utils/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

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

// Wallet API methods
export const walletApi = {
  getBalance: () => api.get('/api/wallet/balance'),
  recharge: (amount, paymentMethod) => api.post('/api/wallet/recharge', { amount, paymentMethod }),
  verifyPayment: (orderId, paymentId, signature) => 
    api.post('/api/wallet/verify-payment', { orderId, paymentId, signature }),
  getTransactions: () => api.get('/api/wallet/transactions'),
};

export default api;