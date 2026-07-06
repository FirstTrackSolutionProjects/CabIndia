// cabindia-mobile/src/screens/MapScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Platform, PermissionsAndroid, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, AnimatedRegion, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Feather } from '@expo/vector-icons'; // Corrected icon import
import carIcon from '../../assets/car_icon.png';

// NEW IMPORTS FOR SOCKET.IO
import { io } from 'socket.io-client';

// IMPORTANT: Replace with your actual backend IP or domain
// For development, use your machine's local IP, e.g., 'http://192.168.1.XXX:5000'
const BACKEND_URL = 'http://YOUR_BACKEND_IP_ADDRESS:5000';
const socket = io(BACKEND_URL, {
  transports: ['websocket'], // Prefer websockets for real-time
  forceNew: true // Ensure a new connection each time this component mounts
});

const MapScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // Extract rideId from route params
  const { ride, icon, source, destination, estimatedFare, rideId } = route.params || {};

  const [currentLocation, setCurrentLocation] = useState(null);
  // driverLocation will be updated by socket.io
  const [driverLocation, setDriverLocation] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Initial region can be a default or derived from source/destination if available
  // It's mainly for the MapView's initial camera position
  const defaultRegion = {
    latitude: 20.2764, // Default to Bhubaneswar for now
    longitude: 85.8456,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const driverAnimatedRegion = useRef(
    new AnimatedRegion({
      latitude: defaultRegion.latitude, // Will be updated by real-time data
      longitude: defaultRegion.longitude, // Will be updated by real-time data
      latitudeDelta: defaultRegion.latitudeDelta,
      longitudeDelta: defaultRegion.longitudeDelta,
    })
  ).current;

  // useEffect for initial user location and map setup
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is needed to show your position on the map.');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Animate map to current user location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      }
    })();
  }, []); // Run once on component mount

  // useEffect for Socket.IO integration to listen for driver updates
  useEffect(() => {
    if (rideId) {
      console.log(`Attempting to join ride room: ride_${rideId}`);
      socket.emit('join_ride', rideId);

      const locationUpdateHandler = (data) => {
        console.log(`Received location update for ride ${data.rideId}:`, data);
        if (driverAnimatedRegion) {
          driverAnimatedRegion.timing({
            latitude: data.latitude,
            longitude: data.longitude,
            duration: 2000, // Smooth transition over 2 seconds
            useNativeDriver: true, // Recommended for performance
          }).start();
        }
        setDriverLocation({ latitude: data.latitude, longitude: data.longitude }); // Keep state updated if needed for other UI elements
      };

      socket.on(`location_${rideId}`, locationUpdateHandler);

      // Cleanup on unmount
      return () => {
        console.log(`Cleaning up socket for ride room: ride_${rideId}`);
        socket.off(`location_${rideId}`, locationUpdateHandler);
        // CRITICAL NOTE: Disconnecting the global socket here might affect other screens
        // if they rely on the same persistent socket connection. For a full-fledged app,
        // consider managing the socket connection in a global context (e.g., AuthContext)
        // and only joining/leaving rooms within components.
        socket.disconnect(); // Disconnects the entire socket connection as per your request
      };
    }
  }, [rideId]); // Re-run if rideId changes

  return (
    <View style={GLOBAL_STYLES.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={defaultRegion}
        showsUserLocation
        followsUserLocation
      >
        {driverLocation && (
          <Marker.Animated
            ref={markerRef}
            coordinate={driverAnimatedRegion}
            anchor={{ x: 0.5, y: 0.5 }} // Center the icon
          >
            <Image source={carIcon} style={styles.carIcon} />
          </Marker.Animated>
        )}
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Feather name="arrow-left" size={24} color={COLORS.text} />
      </TouchableOpacity>

      <View style={styles.bottomSheet}>
        <View style={styles.rideInfo}>
          <Text style={styles.rideEmoji}>{icon}</Text>
          <View>
            <Text style={styles.rideType}>{ride} Ride</Text>
            <Text style={styles.fareText}>Estimated Fare: <Text style={styles.fareValue}>₹{estimatedFare}</Text></Text>
          </View>
        </View>
        <View style={styles.locationSummary}>
          <Text style={styles.locationText} numberOfLines={1}>From: {source}</Text>
          <Text style={styles.locationText} numberOfLines={1}>To: {destination}</Text>
        </View>
        <View style={styles.driverContact}>
          <TouchableOpacity style={styles.contactButton} onPress={() => Alert.alert('Call Driver', 'Calling simulated driver...')}>
            <Feather name="phone" size={20} color={COLORS.background} />
            <Text style={styles.contactButtonText}>Call Driver</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={() => navigation.navigate('Chat')}>
            <Feather name="message-circle" size={20} color={COLORS.background} />
            <Text style={styles.contactButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: SIZES.padding * 3,
    left: SIZES.padding,
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    padding: SIZES.margin,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    padding: SIZES.padding * 2,
    borderTopWidth: 1,
    borderColor: COLORS.borderColor,
    ...GLOBAL_STYLES.shadow,
  },
  rideInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin * 2,
  },
  rideEmoji: {
    fontSize: SIZES.h1,
    marginRight: SIZES.margin,
  },
  rideType: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
  },
  fareText: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.medium,
    color: COLORS.textMuted,
  },
  fareValue: {
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
  },
  locationSummary: {
    marginBottom: SIZES.margin * 2,
  },
  locationText: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.body,
    marginBottom: SIZES.margin / 2,
    color: COLORS.textMuted,
  },
  driverContact: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: SIZES.margin,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding,
    gap: SIZES.margin / 2,
  },
  contactButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
  carIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    tintColor: COLORS.primary, // Optional: colorize the car icon
  },
});

export default MapScreen;