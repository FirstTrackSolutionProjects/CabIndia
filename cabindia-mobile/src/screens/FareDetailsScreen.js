// cabindia-mobile/src/screens/FareDetailsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import Feather from 'react-native-vector-icons/Feather';
import { calculateDistance } from '../utils/locationUtils';
import api from '../utils/api';
import Constants from 'expo-constants';

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.android?.config?.googleMaps?.apiKey || 
                           Constants.expoConfig?.ios?.infoPlist?.GOOGLE_MAPS_API_KEY ||
                           'AIzaSyAD7ImoIAlAk6Ob9Iwyd_67UFr9lCNVTNY';

const rideTypes = [
  { type: "Bike", pricePerKm: 7, emoji: "🏍️", minFare: 30 },
  { type: "Auto", pricePerKm: 10, emoji: "🛺", minFare: 40 },
  { type: "Mini", pricePerKm: 12, emoji: "🚗", minFare: 60 },
  { type: "Sedan", pricePerKm: 15, emoji: "🚙", minFare: 80 },
  { type: "Parcel", pricePerKm: 8, emoji: "📦", minFare: 35 },
  { type: "Rental", pricePerKm: 20, emoji: "⏱️", minFare: 150 },
];

const paymentOptions = [
  { name: "Cash", icon: "dollar-sign", description: "Pay directly to the captain" },
  { name: "Online", icon: "credit-card", description: "UPI, cards or wallets" },
];

export default function FareDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    sourceAddress,
    destinationAddress,
    sourceLat,
    sourceLon,
    destinationLat,
    destinationLon
  } = route.params || {};

  const [selectedPayment, setSelectedPayment] = useState("Cash");
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [distance, setDistance] = useState(0);
  const [loadingDistance, setLoadingDistance] = useState(true);
  const [realDistance, setRealDistance] = useState(null);

  // Get real distance using Google Maps Distance Matrix API
  useEffect(() => {
    const getRealDistance = async () => {
      if (!sourceLat || !sourceLon || !destinationLat || !destinationLon) {
        setLoadingDistance(false);
        return;
      }

      try {
        setLoadingDistance(true);
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${sourceLat},${sourceLon}&destinations=${destinationLat},${destinationLon}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.rows && data.rows.length > 0 && data.rows[0].elements && data.rows[0].elements.length > 0) {
          const element = data.rows[0].elements[0];
          if (element.status === 'OK') {
            const distanceInKm = element.distance.value / 1000;
            setRealDistance(distanceInKm);
            setDistance(distanceInKm);
          } else {
            const calcDist = calculateDistance(sourceLat, sourceLon, destinationLat, destinationLon);
            setDistance(calcDist);
          }
        } else {
          const calcDist = calculateDistance(sourceLat, sourceLon, destinationLat, destinationLon);
          setDistance(calcDist);
        }
      } catch (error) {
        console.error('Distance API error:', error);
        const calcDist = calculateDistance(sourceLat, sourceLon, destinationLat, destinationLon);
        setDistance(calcDist);
      } finally {
        setLoadingDistance(false);
      }
    };

    getRealDistance();
  }, [sourceLat, sourceLon, destinationLat, destinationLon]);

  const selectedPaymentMethod = paymentOptions.find(p => p.name === selectedPayment);

  const handleContinue = async () => {
    if (!sourceAddress || !destinationAddress) {
      Alert.alert('Missing Info', 'Pickup and drop-off locations are required.');
      return;
    }
    if (!selectedRide) {
      Alert.alert('No Ride Selected', 'Please select a ride type first.');
      return;
    }

    const minFare = Math.max(selectedRide.minFare, selectedRide.pricePerKm * distance);
    const maxFare = Math.ceil(minFare * 1.2);
    const estimatedFareStr = `${Math.floor(minFare)} - ${maxFare}`;

    try {
      const response = await api.post('/rides/request', {
        pickupAddress: sourceAddress,
        dropoffAddress: destinationAddress,
        vehicleType: selectedRide.type,
        pickupLat: sourceLat,
        pickupLon: sourceLon,
        dropoffLat: destinationLat,
        dropoffLon: destinationLon,
        estimatedPrice: estimatedFareStr,
        distanceKm: distance.toFixed(1)
      });

      if (response.data.success) {
        navigation.navigate('Map', {
          rideId: response.data.rideId,
          ride: selectedRide.type,
          icon: selectedRide.emoji,
          source: sourceAddress,
          destination: destinationAddress,
          pickupLat: sourceLat,
          pickupLon: sourceLon,
          dropoffLat: destinationLat,
          dropoffLon: destinationLon,
          paymentMethod: selectedPayment,
          estimatedFare: estimatedFareStr,
          distance: distance.toFixed(1)
        });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to request ride.');
      }
    } catch (error) {
      console.error('Ride Request Error:', error);
      Alert.alert('Error', 'An error occurred while requesting your ride. Please check your connection.');
    }
  };

  if (loadingDistance) {
    return (
      <View style={[GLOBAL_STYLES.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Calculating distance...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={GLOBAL_STYLES.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fare Details</Text>
        <Text style={styles.headerSubtitle}>Choose your ride and payment method</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.locationInputContainer}>
          <Text style={styles.label}>Source Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter pickup location"
            placeholderTextColor={COLORS.textMuted}
            value={sourceAddress || ''}
            editable={false}
          />

          <View style={styles.dividerDots}>
            <Text style={{color: COLORS.textMuted, fontSize: SIZES.body}}>• • •</Text>
          </View>

          <Text style={styles.label}>Destination</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter drop-off location"
            placeholderTextColor={COLORS.textMuted}
            value={destinationAddress || ''}
            editable={false}
          />
        </View>

        {distance > 0 && (
          <Text style={styles.distanceText}>
            Estimated Distance: <Text style={styles.highlightText}>{distance.toFixed(1)} km</Text>
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Select Service</Text>
        {rideTypes.map((ride, idx) => {
          const minFare = Math.max(ride.minFare, ride.pricePerKm * distance);
          const maxFare = Math.ceil(minFare * 1.2);
          const isSelected = selectedRide?.type === ride.type;

          return (
            <TouchableOpacity
              key={idx}
              onPress={() => setSelectedRide(ride)}
              style={[
                styles.rideCard,
                isSelected ? styles.selectedRideCard : {},
                { borderColor: isSelected ? COLORS.primary : COLORS.borderColor }
              ]}
            >
              <View style={styles.rideCardLeft}>
                <Text style={styles.rideEmoji}>{ride.emoji}</Text>
                <Text style={styles.rideType}>{ride.type}</Text>
              </View>
              {distance > 0 && (
                <Text style={styles.ridePrice}>
                  ₹{minFare.toFixed(0)} - ₹{maxFare.toFixed(0)}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        <TouchableOpacity
          style={styles.paymentMethodButton}
          onPress={() => setShowPaymentOptions(!showPaymentOptions)}
        >
          <View style={styles.paymentMethodLeft}>
            {selectedPaymentMethod?.icon === 'dollar-sign' && <Feather name="dollar-sign" size={SIZES.large} color={COLORS.text} />}
            {selectedPaymentMethod?.icon === 'credit-card' && <Feather name="credit-card" size={SIZES.large} color={COLORS.text} />}
            <View>
              <Text style={styles.paymentMethodName}>{selectedPaymentMethod?.name}</Text>
              <Text style={styles.paymentMethodDesc}>{selectedPaymentMethod?.description}</Text>
            </View>
          </View>
          <Feather name="chevron-down" size={SIZES.body} color={COLORS.textMuted} style={{ transform: [{ rotate: showPaymentOptions ? '180deg' : '0deg' }] }} />
        </TouchableOpacity>

        {showPaymentOptions && (
          <View style={styles.paymentOptionsContainer}>
            {paymentOptions.map((method) => (
              <TouchableOpacity
                key={method.name}
                onPress={() => {
                  setSelectedPayment(method.name);
                  setShowPaymentOptions(false);
                }}
                style={[
                  styles.individualPaymentOption,
                  selectedPayment === method.name ? { backgroundColor: `${COLORS.primary}1A` } : {}
                ]}
              >
                {method.icon === 'dollar-sign' && <Feather name="dollar-sign" size={SIZES.large} color={COLORS.text} />}
                {method.icon === 'credit-card' && <Feather name="credit-card" size={SIZES.large} color={COLORS.text} />}
                <View>
                  <Text style={styles.paymentOptionName}>{method.name}</Text>
                  <Text style={styles.paymentOptionDesc}>{method.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={handleContinue}
        style={styles.continueButton}
      >
        <Text style={styles.continueButtonText}>Continue Booking</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 4,
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
  header: {
    marginBottom: SIZES.margin * 3,
    alignItems: 'center',
  },
  headerTitle: {
    ...GLOBAL_STYLES.heading1,
    color: COLORS.primary,
    marginBottom: SIZES.margin / 2,
  },
  headerSubtitle: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.small,
    color: COLORS.textMuted,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius * 2,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin * 2,
  },
  locationInputContainer: {
    marginBottom: SIZES.margin,
  },
  label: {
    fontSize: SIZES.small,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
  },
  input: {
    height: 48,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    color: COLORS.text,
    fontSize: SIZES.body - 2,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    marginBottom: SIZES.margin,
  },
  dividerDots: {
    alignSelf: 'center',
    marginVertical: SIZES.margin / 2,
    height: SIZES.medium * 2,
    justifyContent: 'center',
  },
  distanceText: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.medium,
    textAlign: 'center',
    marginTop: SIZES.margin,
    marginBottom: SIZES.margin,
  },
  highlightText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  sectionTitle: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    marginBottom: SIZES.margin,
  },
  rideCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    backgroundColor: COLORS.inputBackground,
    marginBottom: SIZES.margin / 2,
  },
  selectedRideCard: {
    backgroundColor: `${COLORS.primary}1A`,
    borderColor: COLORS.primary,
  },
  rideCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin,
  },
  rideEmoji: {
    fontSize: SIZES.large,
  },
  rideType: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.medium,
    fontFamily: FONTS.semibold,
  },
  ridePrice: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    marginBottom: SIZES.margin,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin,
  },
  paymentMethodName: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.medium,
    fontFamily: FONTS.semibold,
  },
  paymentMethodDesc: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
  },
  paymentOptionsContainer: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    marginTop: -SIZES.margin,
    overflow: 'hidden',
  },
  individualPaymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin,
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderColor: COLORS.borderColor,
  },
  paymentOptionName: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.medium,
    fontFamily: FONTS.semibold,
  },
  paymentOptionDesc: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.margin * 2,
  },
  continueButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
});