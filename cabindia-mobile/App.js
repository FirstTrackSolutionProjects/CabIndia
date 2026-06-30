// cabindia-mobile/App.js
import 'react-native-gesture-handler'; // Required for react-navigation
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';

// Import your screens
import WelcomeScreen from './src/screens/WelcomeScreen'; // Example
import LoginScreen from './src/screens/LoginScreen';
import RegisterCustomerScreen from './src/screens/RegisterCustomerScreen'; // You'll create this
// import Other screens...

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false, // Hide default header for all screens
          cardStyle: { backgroundColor: '#0a0a0a' }, // Set background for all screens
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegisterCustomer" component={RegisterCustomerScreen} />
        {/* Add more screens as you convert them */}
        {/* <Stack.Screen name="AboutUs" component={AboutUsScreen} /> */}
        {/* <Stack.Screen name="Contact" component={ContactScreen} /> */}
        {/* etc. */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
