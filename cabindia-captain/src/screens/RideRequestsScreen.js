// cabindia-captain/src/screens/RideRequestsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import Constants from 'expo-constants';
import api from '../utils/api';

const BACKEND_URL = Constants.expoConfig?.extra?.apiUrl || 'https://cabindia-mobile.onrender.com';
const socket = io(BACKEND_URL, { transports: ['websocket'] });

export default function RideRequestsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.on('new_ride_request', (data) => {
      setRequests(prev => [data, ...prev]);
    });

    return () => {
      socket.off('new_ride_request');
    };
  }, []);

  const acceptRide = async (rideId) => {
    try {
      const response = await api.post(`/rides/${rideId}/accept`);
      if (response.data.success) {
        Alert.alert('Success', 'Ride accepted successfully!');
        setRequests(prev => prev.filter(r => r.rideId !== rideId));
        navigation.navigate('Map', { rideId });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to accept ride. Please try again.');
    }
  };

  const declineRide = (rideId) => {
    setRequests(prev => prev.filter(r => r.rideId !== rideId));
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ride Requests</Text>
      </View>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.rideId.toString()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
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