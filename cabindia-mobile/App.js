// cabindia-mobile/App.js
import 'react-native-gesture-handler'; // Required for react-navigation
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';

// Import your screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterCustomerScreen from './src/screens/RegisterCustomerScreen';
import CaptainApplicationScreen from './src/screens/CaptainApplicationScreen';
import ChatScreen from './src/screens/ChatScreen';
import HomeScreen from './src/screens/HomeScreen'; // Main app screen after login
import FareDetailsScreen from './src/screens/FareDetailsScreen'; // NEW
import MapScreen from './src/screens/MapScreen'; // NEW

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <Stack.Navigator
        initialRouteName="Welcome" // or 'Login' if you want auth flow first
        screenOptions={{
          headerShown: false, // Hide default header for all screens
          cardStyle: { backgroundColor: '#0a0a0a' }, // Set background for all screens
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegisterCustomer" component={RegisterCustomerScreen} />
        <Stack.Screen name="CaptainApplication" component={CaptainApplicationScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="FareDetails" component={FareDetailsScreen} /> {/* NEW */}
        <Stack.Screen name="Map" component={MapScreen} /> {/* NEW */}
        {/* Add more screens as you convert them */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
