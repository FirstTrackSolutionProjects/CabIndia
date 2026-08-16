// cabindia-mobile/App.js
import 'react-native-gesture-handler';
import React, { useCallback, useEffect, useState, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, View, Image, StyleSheet, LogBox } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SIZES } from './src/styles/theme';
import { FONTS } from './src/styles/theme';

// Ignore warnings
LogBox.ignoreLogs(['InteractionManager has been deprecated']);

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(err => {
  console.error('SplashScreen preventAutoHideAsync error:', err);
});

// Import screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterCustomerScreen from './src/screens/RegisterCustomerScreen';
import CaptainApplicationScreen from './src/screens/CaptainApplicationScreen';
import ChatScreen from './src/screens/ChatScreen';
import FareDetailsScreen from './src/screens/FareDetailsScreen';
import MapScreen from './src/screens/MapScreen';
import RideBookingScreen from './src/screens/RideBookingScreen';
import RidesScreen from './src/screens/RidesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MoreScreen from './src/screens/MoreScreen';
import PolicyScreen from './src/screens/PolicyScreen';
import SafetyScreen from './src/screens/SafetyScreen';
import { AuthContext, AuthProvider } from './src/context/AuthContext';

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
    <Stack.Screen name="Chat" component={ChatScreen} />
  </Stack.Navigator>
);

// Main Application Tabs
const MainAppTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.cardBackground,
          borderTopWidth: 1,
          borderTopColor: COLORS.borderColor,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom || 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: FONTS.semibold,
          marginBottom: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          const iconSize = size || 24;
          
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'RidesTab') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'MoreTab') {
            iconName = focused ? 'menu' : 'menu-outline';
          }
          
          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
      })}>
      <Tab.Screen 
        name="HomeTab" 
        component={RideBookingScreen} 
        options={{ tabBarLabel: 'Home' }} 
      />
      <Tab.Screen 
        name="RidesTab" 
        component={RidesScreen} 
        options={{ tabBarLabel: 'Rides' }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profile' }} 
      />
      <Tab.Screen 
        name="MoreTab" 
        component={MoreScreen} 
        options={{ tabBarLabel: 'More' }} 
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator for Main App
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

  // Load fonts
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate other loading tasks if any
        await new Promise(resolve => setTimeout(resolve, 500));
        setAppIsReady(true);
        console.log('✅ App preparation complete');
      } catch (e) {
        console.warn('App preparation error:', e);
        // Even if error, set app ready to show something
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
        await SplashScreen.hideAsync();
        console.log('✅ Splash screen hidden');
      }
    } catch (error) {
      console.error('❌ SplashScreen hide error:', error);
    }
  }, [fontsLoaded, appIsReady]);

  // Debug: Log state changes
  useEffect(() => {
    console.log('📊 State - fontsLoaded:', fontsLoaded, 'appIsReady:', appIsReady);
  }, [fontsLoaded, appIsReady]);

  if (!fontsLoaded || !appIsReady) {
    console.log('⏳ Showing splash screen (loading...)');
    return (
      <View style={styles.splashContainer}>
        <Image 
          source={require('./assets/splash.png')} 
          style={styles.splashImage}
          resizeMode="cover"
        />
      </View>
    );
  }

  console.log('🚀 App is ready! Rendering main app...');
  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
          <RootNavigator />
        </NavigationContainer>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}

// RootNavigator component - NO PROPS ACCEPTED
const RootNavigator = () => {
  const { userToken, isLoading } = useContext(AuthContext);
  const [splashHidden, setSplashHidden] = useState(false);

  useEffect(() => {
    console.log('🔄 RootNavigator - isLoading:', isLoading, 'userToken:', !!userToken);
    if (!isLoading && !splashHidden) {
      async function hideSplash() {
        try {
          console.log('🔄 RootNavigator hiding splash...');
          await SplashScreen.hideAsync();
          setSplashHidden(true);
          console.log('✅ RootNavigator splash hidden');
        } catch (err) {
          console.error('❌ RootNavigator hide splash error:', err);
        }
      }
      hideSplash();
    }
  }, [isLoading, splashHidden]);

  // Show splash while loading
  if (isLoading) {
    console.log('⏳ RootNavigator - Still loading...');
    return (
      <View style={styles.splashContainer}>
        <Image 
          source={require('./assets/splash.png')} 
          style={styles.splashImage}
          resizeMode="cover"
        />
      </View>
    );
  }

  console.log('✅ RootNavigator - Rendering navigation');
  return userToken ? <MainAppStack /> : <AuthStack />;
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
});