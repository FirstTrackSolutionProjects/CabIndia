// cabindia-captain/src/screens/RideHistoryScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';

const RideItem = ({ ride }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#22c55e';
      case 'pending': return '#facc15';
      case 'accepted': return '#3b82f6';
      case 'started': return '#8b5cf6';
      case 'cancelled': return '#ef4444';
      default: return COLORS.textMuted;
    }
  };

  return (
    <View style={styles.rideCard}>
      <View style={styles.rideInfo}>
        <View style={styles.rideHeader}>
          <Text style={[styles.rideStatus, { color: getStatusColor(ride.status) }]}>
            {ride.status.toUpperCase()}
          </Text>
          <Text style={styles.rideDate}>
            {new Date(ride.requested_at).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.rideRoute} numberOfLines={1}>
          {ride.pickup_address} → {ride.dropoff_address}
        </Text>
        {ride.customer_name && (
          <Text style={styles.customerName}>👤 {ride.customer_name}</Text>
        )}
      </View>
      <Text style={styles.rideFare}>
        ₹{ride.final_price || ride.estimated_price || '0'}
      </Text>
    </View>
  );
};

export default function RideHistoryScreen() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRides = async () => {
    try {
      setLoading(true);
      // FIX: Add /api/ prefix
      const response = await api.get('/api/drivers/rides');
      console.log('Driver rides response:', response.data);
      if (response.data.success) {
        setRides(response.data.rides || []);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to load ride history.');
      }
    } catch (error) {
      console.error('Error fetching driver rides:', error);
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again.');
      } else {
        Alert.alert('Error', 'Failed to load ride history. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRides();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading ride history...</Text>
      </View>
    );
  }

  return (
    <View style={GLOBAL_STYLES.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ride History</Text>
        <Text style={styles.headerSubtitle}>{rides.length} completed rides</Text>
      </View>
      <FlatList
        data={rides.filter(r => r.status === 'completed')}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => <RideItem ride={item} />}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No completed rides</Text>
            <Text style={styles.emptySubText}>Complete your first ride to see it here</Text>
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
  listContainer: {
    padding: SIZES.padding,
    flexGrow: 1,
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
  rideCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rideInfo: {
    flex: 1,
    marginRight: SIZES.margin,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rideStatus: {
    fontSize: SIZES.small,
    fontFamily: FONTS.bold,
  },
  rideDate: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
  },
  rideRoute: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
    marginBottom: 2,
  },
  customerName: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
  },
  rideFare: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
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