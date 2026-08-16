// cabindia-captain/App.js - Updated with all navigation and font loading
import 'react-native-gesture-handler';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, View, Image, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

// Import API for logout
import api from './src/utils/api';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(err => {
  console.error('SplashScreen preventAutoHideAsync error:', err);
});

// Auth Context
export const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);

  const login = async (token, user) => {
    try {
      console.log('Logging in user:', user);
      setUserToken(token);
      setUserData(user);
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      console.log('Login successful, token saved');
    } catch (error) {
      console.error('Login storage error:', error);
    }
  };

  const logout = async () => {
    try {
      // Call logout API to invalidate token on server
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        try {
          await api.post('/api/auth/logout', {}, {
            headers: { 'x-auth-token': token }
          });
        } catch (e) {
          // Ignore API errors during logout
          console.log('Logout API call failed, continuing with local logout');
        }
      }
      
      // Clear local state
      setUserToken(null);
      setUserData(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API fails
      setUserToken(null);
      setUserData(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    }
  };

  const updateUser = async (user) => {
    try {
      setUserData(user);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      console.log('User data updated');
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const data = await AsyncStorage.getItem('userData');
        if (token && data) {
          setUserToken(token);
          setUserData(JSON.parse(data));
          console.log('User already logged in');
        }
      } catch (e) {
        console.log('checkLoginStatus error:', e);
      } finally {
        setIsLoading(false);
        console.log('✅ AuthProvider - isLoading set to false');
      }
    };
    checkLoginStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      login, 
      logout, 
      updateUser, 
      isLoading, 
      userToken, 
      userData 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Import Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import RideRequestsScreen from './src/screens/RideRequestsScreen';
import RideHistoryScreen from './src/screens/RideHistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EarningsScreen from './src/screens/EarningsScreen';
import MapScreen from './src/screens/MapScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Authentication Stack
const AuthStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
      cardStyle: { backgroundColor: '#0a0a0a' }
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
  </Stack.Navigator>
);

// Main Tabs
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#facc15',
      tabBarInactiveTintColor: '#6b7280',
      tabBarStyle: {
        backgroundColor: '#111111',
        borderTopWidth: 1,
        borderTopColor: '#374151',
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
      },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        const iconSize = size || 24;
        
        if (route.name === 'Dashboard') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Requests') {
          iconName = focused ? 'car' : 'car-outline';
        } else if (route.name === 'History') {
          iconName = focused ? 'time' : 'time-outline';
        } else if (route.name === 'Earnings') {
          iconName = focused ? 'cash' : 'cash-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }
        return <Ionicons name={iconName} size={iconSize} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Requests" component={RideRequestsScreen} />
    <Tab.Screen name="History" component={RideHistoryScreen} />
    <Tab.Screen name="Earnings" component={EarningsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Main Stack with Map and Change Password
const MainStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
      cardStyle: { backgroundColor: '#0a0a0a' }
    }}
  >
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen name="Map" component={MapScreen} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
  </Stack.Navigator>
);

// Root Navigator
const RootNavigator = () => {
  const { userToken, isLoading } = useContext(AuthContext);

  console.log('🔄 RootNavigator - isLoading:', isLoading, 'userToken:', !!userToken);

  if (isLoading) {
    console.log('⏳ RootNavigator - Still loading...');
    return (
      <View style={styles.splashContainer}>
        <Image source={require('./assets/splash.png')} style={styles.splashImage} />
      </View>
    );
  }

  console.log('✅ RootNavigator - Rendering navigation');
  return userToken ? <MainStack /> : <AuthStack />;
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  // Load fonts
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
  });

  // Log font loading status
  useEffect(() => {
    console.log('🔤 Fonts loaded:', fontsLoaded);
    if (fontError) {
      console.error('❌ Font load error:', fontError);
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setAppIsReady(true);
        console.log('✅ App preparation complete');
      } catch (e) {
        console.error('App preparation error:', e);
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    try {
      console.log('📱 onLayoutRootView - fontsLoaded:', fontsLoaded, 'appIsReady:', appIsReady);
      if (fontsLoaded && appIsReady) {
        console.log('✅ Hiding splash screen...');
        await SplashScreen.hideAsync().catch(err => {
          console.error('Hide splash error:', err);
        });
        console.log('✅ Splash screen hidden');
      }
    } catch (error) {
      console.error('❌ SplashScreen hide error:', error);
    }
  }, [fontsLoaded, appIsReady]);

  if (!fontsLoaded || !appIsReady) {
    console.log('⏳ Showing splash screen (loading...)');
    return (
      <View style={styles.splashContainer}>
        <Image source={require('./assets/splash.png')} style={styles.splashImage} />
      </View>
    );
  }

  console.log('🚀 App is ready! Rendering main app...');
  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
          <RootNavigator />
        </NavigationContainer>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
});