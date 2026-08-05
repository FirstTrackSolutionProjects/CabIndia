// cabindia-mobile/src/screens/RidesScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
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
        <Text style={styles.rideRoute}>
          {ride.pickup_address} → {ride.dropoff_address}
        </Text>
        {ride.driver_name && (
          <Text style={styles.rideDriver}>Driver: {ride.driver_name}</Text>
        )}
        {ride.vehicle_type_requested && (
          <Text style={styles.rideVehicle}>Vehicle: {ride.vehicle_type_requested}</Text>
        )}
      </View>
      <Text style={styles.rideFare}>
        ₹{ride.final_price || ride.estimated_price || '0'}
      </Text>
    </View>
  );
};

export default function RidesScreen() {
  const { userData } = useContext(AuthContext);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rides/history/user');
      console.log('Rides response:', response.data);
      if (response.data.success) {
        setRides(response.data.rides || []);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch rides');
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
      Alert.alert('Error', 'Failed to load ride history. Please try again.');
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
      <View style={[GLOBAL_STYLES.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your rides...</Text>
      </View>
    );
  }

  return (
    <View style={GLOBAL_STYLES.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Rides</Text>
      </View>
      <FlatList
        data={rides}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <RideItem ride={item} />}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyText}>No rides yet</Text>
            <Text style={styles.emptySubText}>Book your first ride and it will appear here!</Text>
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
  listContainer: {
    padding: SIZES.padding,
    flexGrow: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textMuted,
    marginTop: SIZES.margin,
    fontSize: SIZES.medium,
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
    alignItems: 'center',
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
  rideDriver: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
  },
  rideVehicle: {
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
  emptyIcon: {
    fontSize: 48,
    marginBottom: SIZES.margin * 2,
  },
  emptyText: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    textAlign: 'center',
  },
  emptySubText: {
    ...GLOBAL_STYLES.text,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SIZES.margin,
  },
});