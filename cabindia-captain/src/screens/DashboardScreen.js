// cabindia-captain/src/screens/DashboardScreen.js
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Switch, 
  ScrollView, ActivityIndicator, Alert, AppState, RefreshControl
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
    status: 'offline',
    isAvailable: false,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [rideRequests, setRideRequests] = useState([]);
  const socketRef = useRef(null);
  const locationInterval = useRef(null);
  const appState = useRef(AppState.currentState);

  // Define handlers with useCallback to prevent recreation
  const handleNewRideRequest = useCallback((data) => {
    console.log('New ride request:', data);
    setRideRequests(prev => [{
      rideId: data.rideId || data.id || Date.now(),
      pickupAddress: data.pickupAddress || 'Near you',
      dropoffAddress: data.dropoffAddress || 'Destination',
      estimatedPrice: data.estimatedPrice || '0',
      vehicleType: data.vehicleType || 'Cab',
      ...data
    }, ...prev]);
    
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
    socket.on('driver_assigned', handleRideAssigned);
    socket.on('ride_cancelled', handleRideCancelled);
    socket.on('ride_taken', (data) => {
      setRideRequests(prev => prev.filter(r => r.rideId !== data.rideId));
    });

    return () => {
      socket.disconnect();
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
      }
    };
  }, [handleNewRideRequest, handleRideAssigned, handleRideCancelled]);

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
      console.log('Dashboard stats response:', response.data);
      if (response.data.success) {
        setStats(response.data.data);
        // Sync online status with server
        if (response.data.data.isAvailable) {
          setIsOnline(true);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (error.response?.status === 401) {
        // Handle unauthorized - maybe logout
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline;
      
      let currentLocation = location;
      if (newStatus) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Location permission is needed to go online.');
          return;
        }
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

      console.log('Status update response:', response.data);

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
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update status.');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update status. Please try again.'
      );
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
      } else {
        Alert.alert('Error', response.data.message || 'Failed to accept ride.');
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
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
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
          <View style={styles.requestsHeader}>
            <Text style={styles.requestsTitle}>📋 Pending Requests</Text>
            <Text style={styles.requestsCount}>{rideRequests.length}</Text>
          </View>
          {rideRequests.slice(0, 3).map((req, index) => (
            <View key={index} style={styles.requestItem}>
              <View style={styles.requestInfo}>
                <Text style={styles.requestPickup} numberOfLines={1}>📍 {req.pickupAddress || 'Pickup'}</Text>
                <Text style={styles.requestDropoff} numberOfLines={1}>🏁 {req.dropoffAddress || 'Dropoff'}</Text>
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
          <Text style={styles.statValue}>{stats.rating || 0}★</Text>
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
          <View style={styles.actionIconWrapper}>
            <Ionicons name="car" size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.actionLabel}>Requests</Text>
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
          <View style={styles.actionIconWrapper}>
            <Ionicons name="cash" size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.actionLabel}>Earnings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.actionIconWrapper}>
            <Ionicons name="person" size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.actionLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Current Ride Status */}
      {currentRide && (
        <View style={styles.currentRideCard}>
          <View style={styles.currentRideHeader}>
            <Ionicons name="car" size={20} color={COLORS.primary} />
            <Text style={styles.rideTitle}>Current Ride</Text>
          </View>
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
        <Ionicons 
          name="location" 
          size={16} 
          color={location ? '#22c55e' : '#ef4444'} 
        />
        <Text style={styles.locationText}>
          {location ? '📍 Location available' : '📍 Location unavailable'}
        </Text>
      </View>

      {/* Version Info */}
      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>CabIndia Captain v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

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
  loadingText: {
    color: COLORS.textMuted,
    marginTop: SIZES.margin,
    fontSize: SIZES.medium,
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
  requestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  requestsTitle: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
  requestsCount: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
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
  actionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionLabel: {
    color: COLORS.text,
    fontSize: SIZES.small,
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
  currentRideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
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
  versionInfo: {
    paddingTop: SIZES.margin * 2,
    alignItems: 'center',
  },
  versionText: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
  },
});