// cabindia-mobile/src/screens/MapScreen.js
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Dimensions,
  Linking,
  Platform
} from 'react-native';
import MapView, { Marker, AnimatedRegion, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Feather } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import Constants from 'expo-constants';

const { height, width } = Dimensions.get('window');

// ============================================
// BACKEND URL - Using Constants exclusively
// ============================================
const BACKEND_URL = Constants.expoConfig?.extra?.socketUrl || 
                    Constants.expoConfig?.extra?.apiUrl ||
                    'https://cabindia-mobile.onrender.com';

// Google Maps API Keys from environment - Using Constants exclusively
const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey ||
                            '';

// Google OAuth Config - Using Constants exclusively
const GOOGLE_CLIENT_ID = Constants.expoConfig?.extra?.googleClientId || 
                         '';

console.log('🔌 Socket connecting to:', BACKEND_URL);
console.log('🗺️ Google Maps API Key configured:', !!GOOGLE_MAPS_API_KEY);
console.log('🔑 Google Client ID configured:', !!GOOGLE_CLIENT_ID);

// Create socket connection
let socket = null;

const getSocket = () => {
  if (!socket) {
    socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected successfully!');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });
  }
  return socket;
};

const MapScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get ride details from navigation params
  const {
    ride,
    icon,
    source,
    destination,
    estimatedFare,
    rideId: routeRideId,
    pickupLat,
    pickupLon,
    dropoffLat,
    dropoffLon,
    paymentMethod,
  } = route.params || {};

  const [rideId] = useState(routeRideId || null);
  const [isSearching, setIsSearching] = useState(!!routeRideId);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [rideStatus, setRideStatus] = useState('searching');
  const [timer, setTimer] = useState(0);
  const [isDriverAssigned, setIsDriverAssigned] = useState(false);
  
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const timerInterval = useRef(null);
  const socketInstance = useRef(null);

  // Default region (Bhubaneswar, Odisha)
  const defaultRegion = {
    latitude: 20.2961,
    longitude: 85.8245,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Animated driver marker
  const driverAnimatedRegion = useRef(
    new AnimatedRegion({
      latitude: defaultRegion.latitude,
      longitude: defaultRegion.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  ).current;

  // ============================================
  // 1. GET USER LOCATION
  // ============================================
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Location Permission',
            'Location access is needed to show your position on the map and find rides.',
            [{ text: 'OK' }]
          );
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        const userLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        
        setCurrentLocation(userLocation);

        // Animate map to user location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }, 1000);
        }
      } catch (error) {
        console.error('❌ Location error:', error);
        // Fallback to default location
        setCurrentLocation(defaultRegion);
      }
    })();
  }, []);

  // ============================================
  // 2. SOCKET.IO - RIDE TRACKING
  // ============================================
  useEffect(() => {
    if (!rideId) return;

    console.log('📡 Joining ride room:', rideId);
    const socket = getSocket();
    socketInstance.current = socket;

    // Join the ride room
    socket.emit('join_ride', rideId);

    // ============================================
    // 2a. LISTEN FOR DRIVER LOCATION UPDATES
    // ============================================
    const locationHandler = (data) => {
      console.log(`📍 Location update for ride ${data.rideId}:`, data);
      
      setIsSearching(false);
      setIsDriverAssigned(true);
      
      // Update driver location
      const newLocation = {
        latitude: data.latitude,
        longitude: data.longitude,
      };
      setDriverLocation(newLocation);

      // Animate marker
      if (driverAnimatedRegion) {
        driverAnimatedRegion.timing({
          latitude: data.latitude,
          longitude: data.longitude,
          duration: 2000,
          useNativeDriver: false,
        }).start();
      }

      // Update driver info
      if (data.driverName) {
        setDriverInfo({
          name: data.driverName,
          phone: data.driverPhone || 'N/A',
          vehicle: data.vehicleNumber || 'N/A',
          rating: data.driverRating || 4.5,
        });
      }

      // Update ride status
      if (data.status) {
        setRideStatus(data.status);
      }

      // Fit map to show both locations
      if (mapRef.current && pickupLat && pickupLon) {
        const coordinates = [
          { latitude: pickupLat, longitude: pickupLon },
          { latitude: data.latitude, longitude: data.longitude },
        ];
        
        if (dropoffLat && dropoffLon) {
          coordinates.push({ latitude: dropoffLat, longitude: dropoffLon });
        }

        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    };

    // ============================================
    // 2b. LISTEN FOR RIDE STATUS CHANGES
    // ============================================
    const statusHandler = (data) => {
      console.log(`📊 Ride status update:`, data);
      setRideStatus(data.status);
      
      if (data.status === 'completed') {
        Alert.alert(
          '✅ Ride Completed!',
          'Your ride has been completed. Thank you for choosing CabIndia!',
          [{ text: 'OK', onPress: () => navigation.navigate('HomeTab') }]
        );
      }
    };

    // ============================================
    // 2c. LISTEN FOR DRIVER ASSIGNED
    // ============================================
    const assignedHandler = (data) => {
      console.log('👤 Driver assigned:', data);
      setIsSearching(false);
      setIsDriverAssigned(true);
      setDriverInfo({
        name: data.driverName || 'Captain',
        phone: data.driverPhone || 'N/A',
        vehicle: data.vehicleNumber || 'N/A',
        rating: data.driverRating || 4.5,
      });
      
      Alert.alert(
        '🚗 Captain Assigned!',
        `${data.driverName || 'A captain'} has been assigned to your ride.`,
        [{ text: 'OK' }]
      );
    };

    // ============================================
    // 2d. LISTEN FOR DRIVER CANCELLED
    // ============================================
    const cancelledHandler = (data) => {
      console.log('❌ Ride cancelled:', data);
      Alert.alert(
        'Ride Cancelled',
        data.message || 'Your ride has been cancelled. Please try booking again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    };

    // Register event listeners
    socket.on(`location_${rideId}`, locationHandler);
    socket.on('ride_status_update', statusHandler);
    socket.on('driver_assigned', assignedHandler);
    socket.on('ride_cancelled', cancelledHandler);
    socket.on(`ride_cancelled_${rideId}`, cancelledHandler);

    // ============================================
    // 3. TIMER FOR SEARCHING
    // ============================================
    if (isSearching) {
      timerInterval.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }

    // ============================================
    // 4. CLEANUP
    // ============================================
    return () => {
      console.log('🧹 Cleaning up MapScreen socket listeners');
      
      // Clear timer
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }

      // Remove all listeners
      if (socketInstance.current) {
        socketInstance.current.off(`location_${rideId}`, locationHandler);
        socketInstance.current.off('ride_status_update', statusHandler);
        socketInstance.current.off('driver_assigned', assignedHandler);
        socketInstance.current.off('ride_cancelled', cancelledHandler);
        socketInstance.current.off(`ride_cancelled_${rideId}`, cancelledHandler);
      }
    };
  }, [rideId]);

  // ============================================
  // 5. HANDLE DRIVER CONTACT
  // ============================================
  const handleCallDriver = () => {
    if (!driverInfo?.phone) {
      Alert.alert('Info', 'Driver phone number not available yet.');
      return;
    }
    
    const phoneNumber = driverInfo.phone.startsWith('+') 
      ? driverInfo.phone 
      : `+91${driverInfo.phone}`;
    
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Error', 'Could not open phone dialer.');
    });
  };

  const handleChatWithDriver = () => {
    navigation.navigate('Chat', { 
      driverId: driverInfo?.id,
      driverName: driverInfo?.name,
      rideId: rideId,
    });
  };

  // ============================================
  // 6. HANDLE RIDE CANCELLATION
  // ============================================
  const handleCancelRide = () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride? Cancellation fees may apply.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              const api = require('../utils/api').default;
              await api.post(`/rides/${rideId}/cancel`, {
                cancellationReason: 'Cancelled by user',
              });
              
              Alert.alert(
                'Ride Cancelled',
                'Your ride has been cancelled successfully.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel ride. Please try again.');
            }
          }
        }
      ]
    );
  };

  // ============================================
  // 7. RENDER
  // ============================================
  const renderSearching = () => (
    <View style={styles.searchingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.searchingTitle}>Finding your captain...</Text>
      <Text style={styles.searchingSubtitle}>
        {timer > 0 && `Searching for ${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`}
      </Text>
      <View style={styles.searchingDots}>
        {[0, 1, 2].map(i => (
          <View 
            key={i} 
            style={[
              styles.dot,
              { 
                animationDelay: `${i * 0.3}s`,
                opacity: timer % 3 === i ? 1 : 0.3,
              }
            ]} 
          />
        ))}
      </View>
    </View>
  );

  const renderRideInfo = () => (
    <>
      <View style={styles.rideInfoCard}>
        <View style={styles.rideHeader}>
          <Text style={styles.rideEmoji}>{icon || '🚗'}</Text>
          <View style={styles.rideHeaderText}>
            <Text style={styles.rideType}>{ride || 'Cab'} Ride</Text>
            <Text style={styles.rideStatusText}>
              {rideStatus === 'accepted' ? '🟡 Captain is coming' : 
               rideStatus === 'started' ? '🟢 Ride in progress' :
               rideStatus === 'completed' ? '✅ Completed' : '🔵 Searching...'}
            </Text>
          </View>
        </View>

        <View style={styles.locationSummary}>
          <View style={styles.locationRow}>
            <View style={styles.locationDotPickup} />
            <Text style={styles.locationText} numberOfLines={1}>
              {source || 'Pickup Location'}
            </Text>
          </View>
          <View style={styles.locationDivider}>
            <View style={styles.locationLine} />
          </View>
          <View style={styles.locationRow}>
            <View style={styles.locationDotDropoff} />
            <Text style={styles.locationText} numberOfLines={1}>
              {destination || 'Drop-off Location'}
            </Text>
          </View>
        </View>

        {estimatedFare && (
          <View style={styles.fareContainer}>
            <Text style={styles.fareLabel}>Estimated Fare</Text>
            <Text style={styles.fareValue}>₹{estimatedFare}</Text>
          </View>
        )}
      </View>

      {/* Driver Info - shown when assigned */}
      {isDriverAssigned && driverInfo && (
        <View style={styles.driverCard}>
          <View style={styles.driverCardHeader}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverInitials}>
                {driverInfo.name?.charAt(0) || 'D'}
              </Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{driverInfo.name || 'Captain'}</Text>
              <View style={styles.driverRatingRow}>
                <Feather name="star" size={12} color={COLORS.primary} />
                <Text style={styles.driverRating}>{driverInfo.rating || 4.5} ★</Text>
                <Text style={styles.driverVehicle}>{driverInfo.vehicle || 'Vehicle'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.driverActions}>
            <TouchableOpacity style={styles.driverActionBtn} onPress={handleCallDriver}>
              <Feather name="phone" size={18} color={COLORS.background} />
              <Text style={styles.driverActionText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.driverActionBtn} onPress={handleChatWithDriver}>
              <Feather name="message-circle" size={18} color={COLORS.background} />
              <Text style={styles.driverActionText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.driverActionBtn, styles.cancelBtn]} 
              onPress={handleCancelRide}
            >
              <Feather name="x" size={18} color="#ef4444" />
              <Text style={[styles.driverActionText, styles.cancelText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <View style={GLOBAL_STYLES.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={defaultRegion}
        showsUserLocation={true}
        followsUserLocation={true}
        showsTraffic={false}
        showsCompass={true}
        showsScale={true}
        loadingEnabled
        loadingIndicatorColor={COLORS.primary}
        loadingBackgroundColor={COLORS.background}
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
      >
        {/* User Location Marker */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            pinColor={COLORS.primary}
          />
        )}

        {/* Pickup Location Marker */}
        {pickupLat && pickupLon && (
          <Marker
            coordinate={{ latitude: pickupLat, longitude: pickupLon }}
            title="Pickup Location"
            pinColor="#22c55e"
          />
        )}

        {/* Drop-off Location Marker */}
        {dropoffLat && dropoffLon && (
          <Marker
            coordinate={{ latitude: dropoffLat, longitude: dropoffLon }}
            title="Drop-off Location"
            pinColor="#ef4444"
          />
        )}

        {/* Driver Marker - Animated */}
        {driverLocation && (
          <Marker.Animated
            ref={markerRef}
            coordinate={driverAnimatedRegion}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.driverMarkerContainer}>
              <Image 
                source={require('../../assets/car_icon.png')} 
                style={styles.carIcon}
                defaultSource={require('../../assets/car_icon.png')}
              />
              <View style={styles.driverMarkerPulse} />
            </View>
          </Marker.Animated>
        )}
      </MapView>

      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Feather name="arrow-left" size={22} color={COLORS.text} />
      </TouchableOpacity>

      {/* Cancel Button (Top Right) */}
      {rideId && (
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={handleCancelRide}
        >
          <Feather name="x" size={20} color="#ef4444" />
        </TouchableOpacity>
      )}

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        {isSearching ? renderSearching() : renderRideInfo()}
      </View>
    </View>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
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
  cancelButton: {
    position: 'absolute',
    top: 44,
    right: 16,
    backgroundColor: 'rgba(17, 17, 17, 0.9)',
    borderRadius: SIZES.radius,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ef4444',
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
    maxHeight: height * 0.5,
  },

  // Searching State
  searchingContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.padding,
  },
  searchingTitle: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
    marginTop: SIZES.margin,
  },
  searchingSubtitle: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    marginTop: 4,
  },
  searchingDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: SIZES.margin,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  // Ride Info
  rideInfoCard: {
    marginBottom: SIZES.margin,
  },
  rideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  rideEmoji: {
    fontSize: SIZES.h2,
    marginRight: SIZES.margin,
  },
  rideHeaderText: {
    flex: 1,
  },
  rideType: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
  rideStatusText: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    marginTop: 1,
  },

  locationSummary: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  locationDotPickup: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 10,
  },
  locationDotDropoff: {
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
  locationLine: {
    width: 2,
    height: 12,
    backgroundColor: COLORS.borderColor,
  },
  locationText: {
    color: COLORS.text,
    fontSize: SIZES.small,
    flex: 1,
  },

  fareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SIZES.margin,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
  },
  fareLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
  },
  fareValue: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },

  // Driver Card
  driverCard: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  driverCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.margin,
  },
  driverInitials: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
  driverRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  driverRating: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    marginLeft: 4,
  },
  driverVehicle: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    marginLeft: 10,
  },

  driverActions: {
    flexDirection: 'row',
    gap: 8,
  },
  driverActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 8,
    gap: 6,
  },
  driverActionText: {
    color: COLORS.background,
    fontFamily: FONTS.semibold,
    fontSize: SIZES.small,
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  cancelText: {
    color: '#ef4444',
  },

  // Driver Marker
  driverMarkerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    tintColor: COLORS.primary,
  },
  driverMarkerPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(250, 204, 21, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.3)',
  },
});

export default MapScreen;