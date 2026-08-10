// cabindia-captain/src/screens/MapScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, 
  ActivityIndicator, Dimensions, Linking, Platform 
} from 'react-native';
import MapView, { Marker, AnimatedRegion, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { io } from 'socket.io-client';
import Constants from 'expo-constants';

const { height } = Dimensions.get('window');

import { SOCKET_URL } from '../config';
const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.android?.config?.googleMaps?.apiKey || 
                           Constants.expoConfig?.ios?.infoPlist?.GOOGLE_MAPS_API_KEY ||
                           'AIzaSyAD7ImoIAlAk6Ob9Iwyd_67UFr9lCNVTNY';

// Import API helper
import api from '../utils/api';

let socket = null;

const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });
  }
  return socket;
};

export default function MapScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { rideId } = route.params || {};

  const [currentLocation, setCurrentLocation] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [rideDetails, setRideDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rideStatus, setRideStatus] = useState('accepted');
  const mapRef = useRef(null);
  const socketInstance = useRef(null);
  const locationInterval = useRef(null);

  // Animated driver marker
  const driverAnimatedRegion = useRef(
    new AnimatedRegion({
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  ).current;

  const fetchRideDetails = useCallback(async () => {
    try {
      setLoading(true);
      // FIX: Add /api/ prefix
      const response = await api.get(`/api/rides/${rideId}`);
      if (response.data.success) {
        const ride = response.data.ride;
        setRideDetails(ride);
        setRideStatus(ride.status);
        
        if (ride.pickup_lat && ride.pickup_lon) {
          setPickupLocation({
            latitude: parseFloat(ride.pickup_lat),
            longitude: parseFloat(ride.pickup_lon),
          });
        }
        if (ride.dropoff_lat && ride.dropoff_lon) {
          setDropoffLocation({
            latitude: parseFloat(ride.dropoff_lat),
            longitude: parseFloat(ride.dropoff_lon),
          });
        }
        
        setTimeout(() => fitMapToLocations(), 500);
      }
    } catch (error) {
      console.error('Error fetching ride details:', error);
      Alert.alert('Error', 'Failed to load ride details.');
    } finally {
      setLoading(false);
    }
  }, [rideId]);

  const setupSocket = useCallback(() => {
    const socket = getSocket();
    socketInstance.current = socket;

    socket.emit('join_ride', rideId);

    socket.on(`location_${rideId}`, (data) => {
      console.log('📍 Captain location update:', data);
      if (data.latitude && data.longitude) {
        const newLocation = {
          latitude: data.latitude,
          longitude: data.longitude,
        };
        setCurrentLocation(newLocation);
        
        driverAnimatedRegion.timing({
          latitude: data.latitude,
          longitude: data.longitude,
          duration: 2000,
          useNativeDriver: false,
        }).start();
      }
    });

    socket.on('ride_status_update', (data) => {
      console.log('📊 Ride status update:', data);
      setRideStatus(data.status);
      if (data.status === 'completed') {
        Alert.alert(
          '✅ Ride Completed!',
          'The ride has been completed. Thank you for driving with CabIndia!',
          [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }]
        );
      }
    });

    return () => {
      socket.off(`location_${rideId}`);
      socket.off('ride_status_update');
    };
  }, [rideId, navigation]);

  useEffect(() => {
    if (rideId) {
      fetchRideDetails();
      setupSocket();
    }
    getLocation();

    return () => {
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
      }
    };
  }, [rideId, fetchRideDetails, setupSocket]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCurrentLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const fitMapToLocations = () => {
    if (!mapRef.current) return;
    
    const coordinates = [];
    if (currentLocation) coordinates.push(currentLocation);
    if (pickupLocation) coordinates.push(pickupLocation);
    if (dropoffLocation) coordinates.push(dropoffLocation);
    
    if (coordinates.length > 0) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 150, left: 50 },
        animated: true,
      });
    }
  };

  const updateLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const newLocation = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setCurrentLocation(newLocation);
      
      if (socketInstance.current && rideId) {
        socketInstance.current.emit('update_location', {
          rideId,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Update location error:', error);
    }
  };

  const startRide = async () => {
    try {
      // FIX: Add /api/ prefix
      const response = await api.post(`/api/rides/${rideId}/start`);
      if (response.data.success) {
        setRideStatus('started');
        Alert.alert('✅ Ride Started!', 'Navigate to the dropoff location.');
        updateLocation();
        locationInterval.current = setInterval(updateLocation, 5000);
      }
    } catch (error) {
      console.error('Start ride error:', error);
      Alert.alert('Error', 'Failed to start ride.');
    }
  };

  const completeRide = async () => {
    try {
      const distanceKm = 5.0;
      const finalPrice = rideDetails?.estimated_price || '100';
      
      // FIX: Add /api/ prefix
      const response = await api.post(`/api/rides/${rideId}/complete`, {
        finalPrice: finalPrice.toString().split('-')[0].trim(),
        distanceKm: distanceKm,
      });
      
      if (response.data.success) {
        if (locationInterval.current) {
          clearInterval(locationInterval.current);
          locationInterval.current = null;
        }
        Alert.alert(
          '✅ Ride Completed!',
          'The ride has been completed successfully.',
          [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }]
        );
      }
    } catch (error) {
      console.error('Complete ride error:', error);
      Alert.alert('Error', 'Failed to complete ride.');
    }
  };

  const cancelRide = () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              // FIX: Add /api/ prefix
              await api.post(`/api/rides/${rideId}/cancel`, {
                cancellationReason: 'Cancelled by captain',
              });
              if (locationInterval.current) {
                clearInterval(locationInterval.current);
                locationInterval.current = null;
              }
              Alert.alert('Ride Cancelled', 'The ride has been cancelled.');
              navigation.navigate('Dashboard');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel ride.');
            }
          }
        }
      ]
    );
  };

  const openInMaps = () => {
    if (!pickupLocation) {
      Alert.alert('Info', 'Pickup location not available.');
      return;
    }
    
    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${pickupLocation.latitude},${pickupLocation.longitude}`,
      android: `http://maps.google.com/maps?daddr=${pickupLocation.latitude},${pickupLocation.longitude}`,
    });
    
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open maps app.');
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading ride details...</Text>
      </View>
    );
  }

  return (
    <View style={GLOBAL_STYLES.container}>
      {/* Map View */}
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
        loadingEnabled
        loadingIndicatorColor={COLORS.primary}
        loadingBackgroundColor={COLORS.background}
        apiKey={GOOGLE_MAPS_API_KEY}
      >
        {/* Driver Location Marker */}
        {currentLocation && (
          <Marker 
            coordinate={currentLocation} 
            title="Your Location"
            pinColor={COLORS.primary}
          />
        )}
        
        {/* Pickup Location Marker */}
        {pickupLocation && (
          <Marker 
            coordinate={pickupLocation} 
            title="Pickup Location"
            pinColor="#22c55e"
          />
        )}
        
        {/* Dropoff Location Marker */}
        {dropoffLocation && (
          <Marker 
            coordinate={dropoffLocation} 
            title="Dropoff Location"
            pinColor="#ef4444"
          />
        )}
      </MapView>

      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        {/* Ride Info */}
        <View style={styles.rideInfo}>
          <View style={styles.rideInfoHeader}>
            <Text style={styles.rideTitle}>
              {rideDetails?.vehicle_type_requested || 'Cab'} Ride
            </Text>
            <View style={[
              styles.statusBadge,
              rideStatus === 'accepted' && styles.statusAccepted,
              rideStatus === 'started' && styles.statusStarted,
              rideStatus === 'completed' && styles.statusCompleted,
            ]}>
              <Text style={styles.statusBadgeText}>
                {rideStatus.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.locationInfo}>
            <View style={styles.locationRow}>
              <View style={styles.pickupDot} />
              <Text style={styles.locationText} numberOfLines={1}>
                {rideDetails?.pickup_address || 'Pickup location'}
              </Text>
            </View>
            <View style={styles.locationDivider} />
            <View style={styles.locationRow}>
              <View style={styles.dropoffDot} />
              <Text style={styles.locationText} numberOfLines={1}>
                {rideDetails?.dropoff_address || 'Dropoff location'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {rideStatus === 'accepted' && (
            <>
              <TouchableOpacity style={[styles.actionBtn, styles.navigateBtn]} onPress={openInMaps}>
                <Ionicons name="navigate" size={20} color={COLORS.background} />
                <Text style={styles.actionBtnText}>Navigate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.startBtn]} onPress={startRide}>
                <Ionicons name="play" size={20} color={COLORS.background} />
                <Text style={styles.actionBtnText}>Start Ride</Text>
              </TouchableOpacity>
            </>
          )}
          
          {rideStatus === 'started' && (
            <>
              <TouchableOpacity style={[styles.actionBtn, styles.navigateBtn]} onPress={openInMaps}>
                <Ionicons name="navigate" size={20} color={COLORS.background} />
                <Text style={styles.actionBtnText}>Navigate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.completeBtn]} onPress={completeRide}>
                <Ionicons name="checkmark" size={20} color={COLORS.background} />
                <Text style={styles.actionBtnText}>Complete</Text>
              </TouchableOpacity>
            </>
          )}
          
          {rideStatus === 'completed' && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.doneBtn]} 
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Ionicons name="home" size={20} color={COLORS.background} />
              <Text style={styles.actionBtnText}>Go Home</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Cancel Button */}
        {rideStatus !== 'completed' && rideStatus !== 'cancelled' && (
          <TouchableOpacity style={styles.cancelBtn} onPress={cancelRide}>
            <Text style={styles.cancelBtnText}>Cancel Ride</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.textMuted,
    marginTop: SIZES.margin,
    fontSize: SIZES.medium,
  },
  backButton: {
    position: 'absolute',
    top: 44,
    left: 16,
    backgroundColor: 'rgba(17, 17, 17, 0.9)',
    borderRadius: SIZES.radius,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    zIndex: 10,
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
    paddingBottom: Platform.OS === 'ios' ? 34 : SIZES.padding * 1.5,
    borderTopWidth: 1,
    borderColor: COLORS.borderColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  rideInfo: {
    marginBottom: SIZES.margin,
  },
  rideInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  rideTitle: {
    color: COLORS.text,
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusAccepted: {
    backgroundColor: '#facc15',
  },
  statusStarted: {
    backgroundColor: '#3b82f6',
  },
  statusCompleted: {
    backgroundColor: '#22c55e',
  },
  statusBadgeText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: 10,
  },
  locationInfo: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  pickupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 10,
  },
  dropoffDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 10,
  },
  locationDivider: {
    paddingLeft: 12,
    paddingVertical: 2,
  },
  locationText: {
    color: COLORS.text,
    fontSize: SIZES.small,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SIZES.margin,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    gap: 8,
  },
  actionBtnText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.small,
  },
  navigateBtn: {
    backgroundColor: '#3b82f6',
  },
  startBtn: {
    backgroundColor: COLORS.primary,
  },
  completeBtn: {
    backgroundColor: '#22c55e',
  },
  doneBtn: {
    backgroundColor: COLORS.primary,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    marginTop: 4,
  },
  cancelBtnText: {
    color: COLORS.error,
    fontFamily: FONTS.semibold,
    fontSize: SIZES.small,
  },
});