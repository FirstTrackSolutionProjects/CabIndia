// cabindia-captain/src/config.js
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://cabindia-mobile.onrender.com';
const SOCKET_URL = Constants.expoConfig?.extra?.socketUrl || API_URL;

export { API_URL, SOCKET_URL };