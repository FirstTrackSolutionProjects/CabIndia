// cabindia-captain/src/screens/RideRequestsScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { io } from 'socket.io-client';
import Constants from 'expo-constants';
import api from '../utils/api';

import { SOCKET_URL } from '../config';

export default function RideRequestsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to socket
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Requests socket connected');
      socket.emit('join_drivers');
    });

    socket.on('new_ride_request', (data) => {
      console.log('New ride request received:', data);
      setRequests(prev => [{
        rideId: data.rideId || data.id || Date.now(),
        pickupAddress: data.pickupAddress || 'Pickup location',
        dropoffAddress: data.dropoffAddress || 'Dropoff location',
        estimatedPrice: data.estimatedPrice || '0',
        vehicleType: data.vehicleType || 'Cab',
        ...data
      }, ...prev]);
    });

    socket.on('ride_taken', (data) => {
      setRequests(prev => prev.filter(r => r.rideId !== data.rideId));
    });

    socket.on('ride_cancelled', (data) => {
      setRequests(prev => prev.filter(r => r.rideId !== data.rideId));
    });

    // Also fetch any pending requests from API
    fetchPendingRequests();

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      // This endpoint might not exist, so we'll just simulate
      // In a real app, you'd have an endpoint to get pending requests
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setLoading(false);
    }
  };

  const acceptRide = async (rideId) => {
    try {
      // FIX: Add /api/ prefix
      const response = await api.post(`/api/rides/${rideId}/accept`);
      if (response.data.success) {
        Alert.alert('✅ Ride Accepted!', 'Navigate to the pickup location.');
        setRequests(prev => prev.filter(r => r.rideId !== rideId));
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
    setRequests(prev => prev.filter(r => r.rideId !== rideId));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPendingRequests();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  return (
    <View style={GLOBAL_STYLES.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ride Requests</Text>
        <Text style={styles.headerSubtitle}>{requests.length} pending</Text>
      </View>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.rideId?.toString() || Math.random().toString()}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => (
          <View style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <Text style={styles.pickupText}>📍 {item.pickupAddress}</Text>
              <Text style={styles.dropoffText}>🏁 {item.dropoffAddress}</Text>
            </View>
            <View style={styles.requestFooter}>
              <Text style={styles.fareText}>₹{item.estimatedPrice}</Text>
              <Text style={styles.vehicleText}>{item.vehicleType}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.declineBtn} onPress={() => declineRide(item.rideId)}>
                <Text style={styles.declineBtnText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn} onPress={() => acceptRide(item.rideId)}>
                <Text style={styles.acceptBtnText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No ride requests</Text>
            <Text style={styles.emptySubText}>Stay online to receive ride requests</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: SIZES.padding * 2,
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: COLORS.borderColor,
  },
  headerTitle: {
    ...GLOBAL_STYLES.heading1,
    color: COLORS.primary,
  },
  headerSubtitle: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    marginTop: 2,
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
  },
  requestCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    padding: SIZES.padding,
    margin: SIZES.margin,
  },
  requestHeader: {
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
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.margin,
  },
  fareText: {
    color: COLORS.primary,
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
  },
  vehicleText: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SIZES.margin,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
  declineBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  declineBtnText: {
    color: COLORS.error,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.padding * 4,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
    marginTop: SIZES.margin,
  },
  emptySubText: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    marginTop: SIZES.margin / 2,
  },
});