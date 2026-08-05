// cabindia-captain/src/screens/DashboardScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Switch, 
  ScrollView, ActivityIndicator, Alert, Image 
} from 'react-native';
import { AuthContext } from '../../App';
import { COLORS, SIZES, FONTS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import api from '../utils/api';
import { io } from 'socket.io-client';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.29.203:5000';
const socket = io(BACKEND_URL, { transports: ['websocket'] });

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

  useEffect(() => {
    requestLocationPermission();
    fetchStats();
    
    // Socket listeners
    socket.on('new_ride_request', handleNewRideRequest);
    socket.on('ride_assigned', handleRideAssigned);
    
    return () => {
      socket.off('new_ride_request');
      socket.off('ride_assigned');
    };
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    }
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
      const response = await api.post('/drivers/status', {
        online: newStatus,
        lat: location?.latitude,
        lng: location?.longitude,
      });

      if (response.data.success) {
        setIsOnline(newStatus);
        if (newStatus) {
          socket.emit('driver_online', { driverId: userData?.id, ...location });
        } else {
          socket.emit('driver_offline', { driverId: userData?.id });
        }
        Alert.alert(
          newStatus ? '🟢 You are online' : '🔴 You are offline',
          newStatus ? 'You will receive ride requests.' : 'You will not receive ride requests.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update status. Please try again.');
    }
  };

  const handleNewRideRequest = (data) => {
    Alert.alert(
      '🚗 New Ride Request!',
      `Pickup: ${data.pickupAddress}\nDropoff: ${data.dropoffAddress}\nFare: ₹${data.estimatedPrice}`,
      [
        { text: 'Decline', style: 'cancel' },
        { text: 'Accept', onPress: () => acceptRide(data.rideId) },
      ]
    );
  };

  const acceptRide = async (rideId) => {
    try {
      const response = await api.post(`/rides/${rideId}/accept`);
      if (response.data.success) {
        setCurrentRide({ rideId, status: 'accepted' });
        navigation.navigate('Map', { rideId });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to accept ride. Please try again.');
    }
  };

  const handleRideAssigned = (data) => {
    Alert.alert('Ride Assigned!', 'You have been assigned a ride. Check your map for details.');
    navigation.navigate('Map', { rideId: data.rideId });
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
  },
  actionLabel: {
    color: COLORS.text,
    fontSize: SIZES.small,
    marginTop: 4,
    fontFamily: FONTS.semibold,
  },
  currentRideCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: SIZES.padding * 1.5,
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
});