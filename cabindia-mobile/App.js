// cabindia-mobile/App.js
import 'react-native-gesture-handler';
import React, { useCallback, useEffect, useState, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, LogBox, View, Image, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES } from './src/styles/theme';
import { FONTS } from './src/styles/theme';

// Import Ionicons from react-native-vector-icons directly
import { Ionicons } from '@expo/vector-icons';
import { loadIcons } from './src/utils/loadFonts';

useEffect(() => {
  loadIcons();
}, []);

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

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.error('App preparation error:', e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  return (
    <AuthProvider>
      <RootNavigator appIsReady={appIsReady} />
    </AuthProvider>
  );
}

const RootNavigator = ({ appIsReady }) => {
  const { userToken, isLoading } = useContext(AuthContext);
  const [splashHidden, setSplashHidden] = useState(false);

  useEffect(() => {
    if (appIsReady && !isLoading && !splashHidden) {
      async function hideSplash() {
        try {
          await SplashScreen.hideAsync();
          setSplashHidden(true);
        } catch (err) {
          console.error('Hide splash error:', err);
        }
      }
      hideSplash();
    }
  }, [appIsReady, isLoading, splashHidden]);

  if (!appIsReady || isLoading) {
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        {userToken ? <MainAppStack /> : <AuthStack />}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
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