// cabindia-mobile/src/screens/RideBookingScreen.js
// This is the implementation for the RideBookingScreen with a resizable bottom sheet.

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, Dimensions, ScrollView } from 'react-native'; // Added Dimensions, ScrollView
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Feather } from '@expo/vector-icons';

const { height: screenHeight } = Dimensions.get('window'); // Get screen height

export default function RideBookingScreen() {
  const navigation = useNavigation();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const mapRef = useRef(null);

  // State for bottom sheet expansion
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  // Min height should be enough to show title, inputs, and button + tab bar padding
  const minBottomSheetHeight = screenHeight * 0.35; // 35% of screen height
  const maxBottomSheetHeight = screenHeight * 0.70; // 70% of screen height

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is needed to show your position on the map and find rides.');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      }
    })();
  }, []);

  const handleGetFare = () => {
    if (!source || !destination) {
      Alert.alert('Missing Info', 'Please enter both pickup and drop-off locations.');
      return;
    }
    // Navigate to FareDetails with source and destination
    navigation.navigate('FareDetails', { source, destination });
  };

  return (
    <KeyboardAvoidingView
      style={GLOBAL_STYLES.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0} // Let the bottomSheet's ScrollView handle content when keyboard is up
    >
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={currentLocation || { // Use current location if available, otherwise a default
            latitude: 20.2764, // Default to Bhubaneswar for now
            longitude: 85.8456,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
          followsUserLocation={true}
          loadingEnabled
          loadingIndicatorColor={COLORS.primary}
          loadingBackgroundColor={COLORS.background}
        >
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="Your Location"
              pinColor={COLORS.primary}
            />
          )}
        </MapView>
      </View>

      <View style={[
        styles.bottomSheet,
        { height: isBottomSheetExpanded ? maxBottomSheetHeight : minBottomSheetHeight },
      ]}>
        {/* Drag Handle to toggle expansion */}
        <TouchableOpacity
          style={styles.dragHandleContainer}
          onPress={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.dragHandleBar} />
          <Feather name={isBottomSheetExpanded ? "chevron-down" : "chevron-up"} size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.bottomSheetContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sheetTitle}>Where are you going?</Text>
          <View style={styles.inputGroup}>
            <Feather name="map-pin" size={SIZES.large} color={COLORS.primary} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Pickup Location"
              placeholderTextColor={COLORS.textMuted}
              value={source}
              onChangeText={setSource}
            />
          </View>
          <View style={styles.inputGroup}>
            <Feather name="flag" size={SIZES.large} color={COLORS.secondary} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Drop-off Location"
              placeholderTextColor={COLORS.textMuted}
              value={destination}
              onChangeText={setDestination}
            />
          </View>

          <TouchableOpacity style={styles.findRideButton} onPress={handleGetFare}>
            <Text style={styles.findRideButtonText}>Find a Ride</Text>
            <Feather name="arrow-right" size={SIZES.medium} color={COLORS.background} />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1, // Map takes all available space
  },
  map: {
    width: '100%',
    height: '100%',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    paddingHorizontal: SIZES.padding * 2,
    paddingTop: SIZES.padding * 2,
    // The effective paddingBottom for content will come from `bottomSheetContent`
    borderTopWidth: 1,
    borderColor: COLORS.borderColor,
    ...GLOBAL_STYLES.shadow,
    // height will be set dynamically in inline style
  },
  bottomSheetContent: {
    paddingBottom: SIZES.padding * 5, // Ensures content and button are above the tab bar (tab bar height is SIZES.padding * 5)
    justifyContent: 'flex-start',
    flexGrow: 1, // Allow content to grow to fill height
  },
  dragHandleContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin,
    paddingVertical: SIZES.padding / 2,
    marginBottom: SIZES.margin * 1.5,
  },
  dragHandleBar: {
    width: 60,
    height: 6,
    backgroundColor: COLORS.borderColor,
    borderRadius: 3,
  },
  sheetTitle: {
    ...GLOBAL_STYLES.heading1,
    fontSize: SIZES.h2,
    marginBottom: SIZES.margin * 3,
    textAlign: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    marginBottom: SIZES.margin * 2,
    paddingHorizontal: SIZES.padding,
    height: 50,
  },
  icon: {
    marginRight: SIZES.margin,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
  },
  findRideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding * 1.2,
    marginTop: SIZES.margin * 2,
    gap: SIZES.margin / 2,
  },
  findRideButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
});