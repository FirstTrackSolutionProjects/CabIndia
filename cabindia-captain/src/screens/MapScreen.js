// cabindia-captain/src/screens/MapScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import Constants from 'expo-constants';
import api from '../utils/api';

const BACKEND_URL = Constants.expoConfig?.extra?.apiUrl || 'https://cabindia-mobile.onrender.com';
const socket = io(BACKEND_URL, { transports: ['websocket'] });

export default function MapScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { rideId } = route.params || {};

  const [currentLocation, setCurrentLocation] = useState(null);
  const [rideDetails, setRideDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    if (rideId) {
      fetchRideDetails();
    }
    getLocation();
  }, []);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    }
  };

  const fetchRideDetails = async () => {
    try {
      const response = await api.get(`/rides/${rideId}`);
      if (response.data.success) {
        setRideDetails(response.data.ride);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load ride details.');
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async () => {
    const loc = await Location.getCurrentPositionAsync({});
    setCurrentLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
    // Emit location update
    socket.emit('update_location', {
      rideId,
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  };

  const startRide = async () => {
    try {
      const response = await api.post(`/rides/${rideId}/start`);
      if (response.data.success) {
        Alert.alert('Success', 'Ride started!');
        updateLocation();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start ride.');
    }
  };

  const completeRide = async () => {
    try {
      const response = await api.post(`/rides/${rideId}/complete`, {
        finalPrice: rideDetails?.estimated_price || '100',
        distanceKm: 5.0,
      });
      if (response.data.success) {
        Alert.alert('Success', 'Ride completed!');
        navigation.navigate('Dashboard');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to complete ride.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={GLOBAL_STYLES.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={currentLocation || {
          latitude: 20.2961,
          longitude: 85.8245,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {currentLocation && (
          <Marker coordinate={currentLocation} title="Your Location" pinColor={COLORS.primary} />
        )}
      </MapView>

      <View style={styles.bottomSheet}>
        {rideDetails ? (
          <>
            <Text style={styles.rideTitle}>Current Ride</Text>
            <View style={styles.locationContainer}>
              <Text style={styles.pickupText}>📍 {rideDetails.pickup_address}</Text>
              <Text style={styles.dropoffText}>🏁 {rideDetails.dropoff_address}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.startButton} onPress={startRide}>
                <Text style={styles.buttonText}>Start Ride</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.completeButton} onPress={completeRide}>
                <Text style={styles.buttonText}>Complete Ride</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={styles.noRideText}>No active ride</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    padding: SIZES.padding * 1.5,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderColor: COLORS.borderColor,
  },
  rideTitle: {
    color: COLORS.text,
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
    marginBottom: SIZES.margin,
  },
  locationContainer: {
    marginBottom: SIZES.margin,
  },
  pickupText: {
    color: COLORS.text,
    fontSize: SIZES.medium,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  dropoffText: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SIZES.margin,
  },
  startButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#22c55e',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
  noRideText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    fontSize: SIZES.medium,
    fontFamily: FONTS.semibold,
  },
});