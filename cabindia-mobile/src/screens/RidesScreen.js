// cabindia-mobile/src/screens/RidesScreen.js
// Please create this new file.
// This is a placeholder for the Rides history/current rides screen.

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';

const dummyRides = [
  { id: '1', status: 'completed', pickup: 'Office', dropoff: 'Home', fare: '₹250', date: '2023-10-26' },
  { id: '2', status: 'pending', pickup: 'Starbucks', dropoff: 'Mall', fare: '₹180', date: '2023-10-25' },
  { id: '3', status: 'cancelled', pickup: 'Airport', dropoff: 'Hotel', fare: '₹400', date: '2023-10-24' },
  { id: '4', status: 'completed', pickup: 'Gym', dropoff: 'Restaurant', fare: '₹120', date: '2023-10-23' },
];

const RideItem = ({ ride }) => (
  <View style={styles.rideCard}>
    <View style={styles.rideInfo}>
      <Text style={styles.rideStatus}>{ride.status.toUpperCase()}</Text>
      <Text style={styles.rideRoute}>{ride.pickup} to {ride.dropoff}</Text>
      <Text style={styles.rideDate}>{ride.date}</Text>
    </View>
    <Text style={styles.rideFare}>{ride.fare}</Text>
  </View>
);

export default function RidesScreen() {
  return (
    <View style={GLOBAL_STYLES.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Rides</Text>
      </View>
      <FlatList
        data={dummyRides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RideItem ride={item} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No rides found yet.</Text>}
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
  },
  rideStatus: {
    fontSize: SIZES.small,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SIZES.margin / 2,
  },
  rideRoute: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  rideDate: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    marginTop: SIZES.margin / 2,
  },
  rideFare: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  emptyText: {
    ...GLOBAL_STYLES.text,
    textAlign: 'center',
    marginTop: SIZES.padding * 2,
    color: COLORS.textMuted,
  },
});