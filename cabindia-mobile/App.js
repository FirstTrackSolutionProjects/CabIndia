// cabindia-mobile/App.js
import 'react-native-gesture-handler'; // Required for react-navigation
import React, { useCallback, useEffect, useState, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, LogBox, View, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Feather } from '@expo/vector-icons';

// Ignore the InteractionManager deprecation warning
LogBox.ignoreLogs(['InteractionManager has been deprecated']);

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(err => {
  console.error('App.js: SplashScreen.preventAutoHideAsync failed with error:', err);
});

// Import your screens and context
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterCustomerScreen from './src/screens/RegisterCustomerScreen';
import CaptainApplicationScreen from './src/screens/CaptainApplicationScreen';
import ChatScreen from './src/screens/ChatScreen';
import FareDetailsScreen from './src/screens/FareDetailsScreen';
import MapScreen from './src/screens/MapScreen'; // For active ride tracking
// Screens for Tabs
import RideBookingScreen from './src/screens/RideBookingScreen';
import RidesScreen from './src/screens/RidesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MoreScreen from './src/screens/MoreScreen';
import PolicyScreen from './src/screens/PolicyScreen'; // NEW
import SafetyScreen from './src/screens/SafetyScreen'; // NEW
import { AuthContext, AuthProvider } from './src/context/AuthContext';

import { COLORS, SIZES } from './src/styles/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Authentication Stack
const AuthStack = () => (
  <Stack.Navigator
    initialRouteName="Welcome"
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: COLORS.background },
    }}>
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="RegisterCustomer" component={RegisterCustomerScreen} />
    {/* CaptainApplication removed from AuthStack as it's a post-login flow */}
    <Stack.Screen name="Chat" component={ChatScreen} />
  </Stack.Navigator>
);

// Main Application Tabs
const MainAppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textMuted,
      tabBarStyle: {
        backgroundColor: COLORS.cardBackground,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
        height: SIZES.padding * 5, // Increased height
        paddingBottom: SIZES.padding, // Increased padding
        paddingTop: SIZES.padding / 2, // Added top padding for icons
      },
      tabBarLabelStyle: {
        fontSize: SIZES.small, // Slightly larger font
        fontWeight: '600',
        marginTop: SIZES.padding / 4, // Adjusted margin to center text better
      },
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'HomeTab') {
          iconName = 'map-pin';
        } else if (route.name === 'RidesTab') {
          iconName = 'truck'; // Changed from 'car' to 'truck' for Feather icons
        } else if (route.name === 'ProfileTab') {
          iconName = 'user';
        } else if (route.name === 'MoreTab') {
          iconName = 'menu';
        }
        return <Feather name={iconName} size={size} color={color} />;
      },
    })}>
    <Tab.Screen name="HomeTab" component={RideBookingScreen} options={{ tabBarLabel: 'Home' }} />
    <Tab.Screen name="RidesTab" component={RidesScreen} options={{ tabBarLabel: 'Rides' }} />
    <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    <Tab.Screen name="MoreTab" component={MoreScreen} options={{ tabBarLabel: 'More' }} />
  </Tab.Navigator>
);

// Root Stack Navigator for Main App (includes tabs and other full-screen modals/screens)
const MainAppStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: COLORS.background },
    }}>
    <Stack.Screen name="MainTabs" component={MainAppTabs} />
    <Stack.Screen name="FareDetails" component={FareDetailsScreen} />
    <Stack.Screen name="Map" component={MapScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="PolicyScreen" component={PolicyScreen} />
    <Stack.Screen name="SafetyScreen" component={SafetyScreen} />
    <Stack.Screen name="CaptainApplication" component={CaptainApplicationScreen} />
  </Stack.Navigator>
);


export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate a longer loading process for testing splash screen
        await new Promise(resolve => setTimeout(resolve, 3000)); 
      } catch (e) {
        console.error('App.js: Error during app preparation in prepare():', e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  // Use AuthProvider to manage authentication state globally
  return (
    <AuthProvider>
      <RootNavigator appIsReady={appIsReady} />
    </AuthProvider>
  );
}

// Separate component for Root Navigation to use AuthContext
const RootNavigator = ({ appIsReady }) => {
  const { userToken, isLoading } = useContext(AuthContext);
  const [splashHidden, setSplashHidden] = useState(false);

  // Effect to hide splash screen once everything is ready
  useEffect(() => {
    // Only hide splash screen once App's initial preparation AND AuthContext's loading are complete
    if (appIsReady && !isLoading && !splashHidden) {
      async function hideSplash() {
        await SplashScreen.hideAsync().catch(err => {
          console.error('RootNavigator: SplashScreen.hideAsync failed with error:', err);
        });
        setSplashHidden(true);
      }
      hideSplash();
    }
  }, [appIsReady, isLoading, splashHidden]);

  if (!appIsReady || isLoading) {
    // During this phase, either the native splash is showing (if !appIsReady),
    // or a custom loading screen is showing (if appIsReady but isLoading).
    // The native splash screen will remain until hideAsync is explicitly called.
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <Text style={{ color: COLORS.text }}>Loading app...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      {userToken ? <MainAppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
