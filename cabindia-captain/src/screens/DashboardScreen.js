// cabindia-captain/src/screens/DashboardScreen.js
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Switch, 
  ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { AuthContext } from '../../App';
import { COLORS, SIZES, FONTS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import api from '../utils/api';
import { io } from 'socket.io-client';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.apiUrl || 'https://cabindia-mobile.onrender.com';

export default function DashboardScreen({ navigation }) {
  const { userData } = useContext(AuthContext);
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState(null);
  const [stats, setStats] = useState({
    todayRides: 0,
    todayEarnings: 0,
    rating: 4.8,
    totalRides: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentRide, setCurrentRide] = useState(null);
  const [rideRequests, setRideRequests] = useState([]);
  const socketRef = useRef(null);
  const locationInterval = useRef(null);
  const appState = useRef(AppState.currentState);

  // Define handlers with useCallback to prevent recreation
  const handleNewRideRequest = useCallback((data) => {
    console.log('New ride request:', data);
    setRideRequests(prev => [data, ...prev]);
    
    Alert.alert(
      '🚗 New Ride Request!',
      `Pickup: ${data.pickupAddress || 'Near you'}\nDropoff: ${data.dropoffAddress || 'Destination'}\nFare: ₹${data.estimatedPrice || '0'}`,
      [
        { text: 'Decline', style: 'cancel', onPress: () => declineRide(data.rideId) },
        { text: 'Accept', onPress: () => acceptRide(data.rideId) },
      ],
      { cancelable: true }
    );
  }, []);

  const handleRideAssigned = useCallback((data) => {
    Alert.alert(
      '🚗 Ride Assigned!',
      'You have been assigned a ride. Check your map for details.',
      [{ text: 'OK', onPress: () => navigation.navigate('Map', { rideId: data.rideId }) }]
    );
  }, [navigation]);

  const handleRideCancelled = useCallback(() => {
    Alert.alert('Ride Cancelled', 'The ride has been cancelled by the customer.');
    setCurrentRide(null);
  }, []);

  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        
        if (isOnline) {
          startLocationUpdates();
        }
      } else {
        Alert.alert(
          'Location Permission',
          'Location access is needed to receive ride requests in your area.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Location error:', error);
    }
  }, [isOnline]);

  const handleAppStateChange = useCallback((nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      requestLocationPermission();
      fetchStats();
    }
    appState.current = nextAppState;
  }, [requestLocationPermission]);

  // Initialize socket connection
  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Captain socket connected');
      if (isOnline && userData?.id) {
        socket.emit('driver_online', { 
          driverId: userData.id, 
          ...location 
        });
      }
    });

    socket.on('new_ride_request', handleNewRideRequest);
    socket.on('ride_assigned', handleRideAssigned);
    socket.on('ride_cancelled', handleRideCancelled);

    return () => {
      socket.disconnect();
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
      }
    };
  }, [handleNewRideRequest, handleRideAssigned, handleRideCancelled, isOnline, location, userData?.id]);

  // Request location permission and start tracking
  useEffect(() => {
    requestLocationPermission();
    fetchStats();

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange, requestLocationPermission]);

  const startLocationUpdates = () => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
    }
    
    locationInterval.current = setInterval(async () => {
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const newLocation = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setLocation(newLocation);
        
        if (socketRef.current && isOnline) {
          socketRef.current.emit('update_location', {
            driverId: userData?.id,
            ...newLocation,
          });
        }
      } catch (error) {
        console.error('Location update error:', error);
      }
    }, 5000);
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/drivers/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline;
      
      let currentLocation = location;
      if (newStatus) {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        currentLocation = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setLocation(currentLocation);
      }

      const response = await api.post('/drivers/status', {
        online: newStatus,
        lat: currentLocation?.latitude || null,
        lng: currentLocation?.longitude || null,
      });

      if (response.data.success) {
        setIsOnline(newStatus);
        
        if (newStatus) {
          socketRef.current?.emit('driver_online', { 
            driverId: userData?.id, 
            ...currentLocation 
          });
          socketRef.current?.emit('join_drivers');
          startLocationUpdates();
          
          Alert.alert(
            '🟢 You are online',
            'You will now receive ride requests in your area.'
          );
        } else {
          if (locationInterval.current) {
            clearInterval(locationInterval.current);
            locationInterval.current = null;
          }
          socketRef.current?.emit('driver_offline', { driverId: userData?.id });
          socketRef.current?.emit('leave_drivers');
          
          Alert.alert(
            '🔴 You are offline',
            'You will not receive ride requests.'
          );
        }
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      Alert.alert('Error', 'Failed to update status. Please try again.');
    }
  };

  const acceptRide = async (rideId) => {
    try {
      const response = await api.post(`/rides/${rideId}/accept`);
      if (response.data.success) {
        setCurrentRide({ rideId, status: 'accepted' });
        setRideRequests(prev => prev.filter(r => r.rideId !== rideId));
        Alert.alert('✅ Ride Accepted!', 'Navigate to the pickup location.');
        navigation.navigate('Map', { rideId });
      }
    } catch (error) {
      console.error('Accept ride error:', error);
      Alert.alert('Error', 'Failed to accept ride. Please try again.');
    }
  };

  const declineRide = (rideId) => {
    setRideRequests(prev => prev.filter(r => r.rideId !== rideId));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Banner */}
      <View style={styles.statusBanner}>
        <View style={styles.statusLeft}>
          <View style={[styles.statusDot, isOnline ? styles.onlineDot : styles.offlineDot]} />
          <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
        </View>
        <Switch
          value={isOnline}
          onValueChange={toggleOnlineStatus}
          trackColor={{ false: '#374151', true: '#facc15' }}
          thumbColor={isOnline ? '#000' : '#fff'}
        />
      </View>

      {/* Pending Ride Requests */}
      {rideRequests.length > 0 && (
        <View style={styles.requestsCard}>
          <Text style={styles.requestsTitle}>📋 Pending Requests ({rideRequests.length})</Text>
          {rideRequests.slice(0, 3).map((req, index) => (
            <View key={index} style={styles.requestItem}>
              <View style={styles.requestInfo}>
                <Text style={styles.requestPickup}>📍 {req.pickupAddress || 'Pickup'}</Text>
                <Text style={styles.requestDropoff}>🏁 {req.dropoffAddress || 'Dropoff'}</Text>
                <Text style={styles.requestFare}>₹{req.estimatedPrice || '0'}</Text>
              </View>
              <View style={styles.requestActions}>
                <TouchableOpacity 
                  style={[styles.requestBtn, styles.declineBtn]}
                  onPress={() => declineRide(req.rideId)}
                >
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.requestBtn, styles.acceptBtn]}
                  onPress={() => acceptRide(req.rideId)}
                >
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {rideRequests.length > 3 && (
            <TouchableOpacity 
              style={styles.viewAllBtn}
              onPress={() => navigation.navigate('Requests')}
            >
              <Text style={styles.viewAllText}>View all {rideRequests.length} requests →</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.todayRides}</Text>
          <Text style={styles.statLabel}>Today's Rides</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹{stats.todayEarnings}</Text>
          <Text style={styles.statLabel}>Today's Earnings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.rating}★</Text>
          <Text style={styles.statLabel}>Your Rating</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalRides}</Text>
          <Text style={styles.statLabel}>Total Rides</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Requests')}
        >
          <Ionicons name="car" size={24} color={COLORS.primary} />
          <Text style={styles.actionLabel}>Ride Requests</Text>
          {rideRequests.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{rideRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Earnings')}
        >
          <Ionicons name="cash" size={24} color={COLORS.primary} />
          <Text style={styles.actionLabel}>Earnings</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person" size={24} color={COLORS.primary} />
          <Text style={styles.actionLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Current Ride Status */}
      {currentRide && (
        <View style={styles.currentRideCard}>
          <Text style={styles.rideTitle}>🚗 Current Ride</Text>
          <Text style={styles.rideStatus}>Status: {currentRide.status}</Text>
          <TouchableOpacity 
            style={styles.viewRideButton}
            onPress={() => navigation.navigate('Map', { rideId: currentRide.rideId })}
          >
            <Text style={styles.viewRideText}>View Ride</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Location Status */}
      <View style={styles.locationStatus}>
        <Ionicons name="location" size={16} color={location ? '#22c55e' : '#ef4444'} />
        <Text style={styles.locationText}>
          {location ? 'Location available' : 'Location unavailable'}
        </Text>
      </View>
    </ScrollView>
  );
}

// Add AppState import at top
import { AppState } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.padding,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin * 2,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  onlineDot: {
    backgroundColor: '#22c55e',
  },
  offlineDot: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
  requestsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    padding: SIZES.padding,
    marginBottom: SIZES.margin * 2,
  },
  requestsTitle: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
    marginBottom: SIZES.margin,
  },
  requestItem: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
  },
  requestInfo: {
    marginBottom: SIZES.margin,
  },
  requestPickup: {
    color: COLORS.text,
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
  },
  requestDropoff: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    marginTop: 2,
  },
  requestFare: {
    color: COLORS.primary,
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
    marginTop: 4,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  requestBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: COLORS.primary,
  },
  acceptBtnText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.small,
  },
  declineBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  declineBtnText: {
    color: COLORS.error,
    fontFamily: FONTS.bold,
    fontSize: SIZES.small,
  },
  viewAllBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  viewAllText: {
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
    fontSize: SIZES.small,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: SIZES.margin * 2,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    padding: SIZES.padding,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.primary,
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    padding: SIZES.padding,
    marginBottom: SIZES.margin * 2,
  },
  actionButton: {
    alignItems: 'center',
    position: 'relative',
  },
  actionLabel: {
    color: COLORS.text,
    fontSize: SIZES.small,
    marginTop: 4,
    fontFamily: FONTS.semibold,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.background,
    fontSize: 10,
    fontFamily: FONTS.bold,
  },
  currentRideCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin * 2,
  },
  rideTitle: {
    color: COLORS.text,
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
  },
  rideStatus: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    marginTop: 4,
  },
  viewRideButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 0.8,
    marginTop: 10,
    alignItems: 'center',
  },
  viewRideText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.small,
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.margin,
    gap: 8,
  },
  locationText: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
  },
});