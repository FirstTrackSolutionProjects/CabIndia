// cabindia-captain/App.js
import 'react-native-gesture-handler';
import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, View, Image, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Ionicons from react-native-vector-icons directly
import { Ionicons } from '@expo/vector-icons';
import { loadIcons } from './src/utils/loadFonts';

useEffect(() => {
  loadIcons();
}, []);

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
      setUserToken(null);
      setUserData(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Add updateUser function for profile updates
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

// Main Stack with Map
const MainStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
      cardStyle: { backgroundColor: '#0a0a0a' }
    }}
  >
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen name="Map" component={MapScreen} />
  </Stack.Navigator>
);

// Root Navigator
const RootNavigator = () => {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <Image source={require('./assets/splash.png')} style={styles.splashImage} />
      </View>
    );
  }

  return userToken ? <MainStack /> : <AuthStack />;
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate loading resources
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (e) {
        console.error('App preparation error:', e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync().catch(err => {
          console.error('Hide splash error:', err);
        });
      }
    }
    prepare();
  }, []);

  if (!appIsReady) {
    return (
      <View style={styles.splashContainer}>
        <Image source={require('./assets/splash.png')} style={styles.splashImage} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
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