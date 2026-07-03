// cabindia-mobile/src/screens/FareDetailsScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Car, Bike, Package, Clock, DollarSign, CreditCard, ChevronDown } from '@expo/vector-icons';

const rideTypes = [
  { type: "Bike", icon: "motorcycle", pricePerKm: 7, emoji: "🏍️", color: COLORS.tertiary },
  { type: "Auto", icon: "truck-pickup", pricePerKm: 10, emoji: "🛺", color: COLORS.primary },
  { type: "Mini", icon: "car", pricePerKm: 12, emoji: "🚗", color: COLORS.secondary },
  { type: "Sedan", icon: "car", pricePerKm: 15, emoji: "🚙", color: COLORS.textMuted },
  // Adding placeholders for other types from web
  { type: "Parcel", icon: "box", pricePerKm: 8, emoji: "📦", color: COLORS.borderColor },
  { type: "Rental", icon: "clock", pricePerKm: 20, emoji: "⏱️", color: COLORS.inputBackground },
];

const paymentOptions = [
  { name: "Cash", icon: "dollar-sign", description: "Pay directly to the captain" },
  { name: "Online", icon: "credit-card", description: "UPI, cards or wallets" },
];

export default function FareDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { source: initialSource, destination: initialDestination } = route.params || {};

  const [source, setSource] = useState(initialSource || '');
  const [destination, setDestination] = useState(initialDestination || '');
  const [selectedPayment, setSelectedPayment] = useState("Cash");
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);

  const getDistanceKm = () => {
    // In a real app, this would be calculated using a map API
    if (!source || !destination) return 0;
    if (source === destination) return 1;
    return Math.floor(Math.random() * 10) + 2; // Simulated distance between 2-11 km
  };

  const distance = getDistanceKm();
  const selectedPaymentMethod = paymentOptions.find(p => p.name === selectedPayment);

  const handleContinue = () => {
    if (!source || !destination) {
      Alert.alert('Missing Info', 'Please enter both source and destination.');
      return;
    }
    if (!selectedRide) {
      Alert.alert('No Ride Selected', 'Please select a ride type first.');
      return;
    }
    // Navigate to a ride searching/confirmation screen
    navigation.navigate('Map', {
      ride: selectedRide.type,
      icon: selectedRide.emoji,
      source,
      destination,
      paymentMethod: selectedPayment,
      estimatedFare: `${Math.floor(selectedRide.pricePerKm * distance)} - ${Math.ceil(selectedRide.pricePerKm * distance * 1.2)}`
    });
  };

  const handleClear = () => {
    setSource('');
    setDestination('');
    setSelectedRide(null);
  };

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
            value={source}
            onChangeText={setSource}
          />

          <View style={styles.dividerDots} />

          <Text style={styles.label}>Destination</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter drop-off location"
            placeholderTextColor={COLORS.textMuted}
            value={destination}
            onChangeText={setDestination}
          />
        </View>

        {distance > 0 && (
          <Text style={styles.distanceText}>
            Estimated Distance: <Text style={styles.highlightText}>{distance} km</Text>
          </Text>
        )}

        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear Locations</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Select Service</Text>
        {rideTypes.map((ride, idx) => {
          const minFare = ride.pricePerKm * distance;
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
                  ₹{minFare} - ₹{maxFare}
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
            {selectedPaymentMethod?.icon === 'dollar-sign' && <DollarSign name="dollar-sign" size={20} color={COLORS.text} />}
            {selectedPaymentMethod?.icon === 'credit-card' && <CreditCard name="credit-card" size={20} color={COLORS.text} />}
            <View>
              <Text style={styles.paymentMethodName}>{selectedPaymentMethod?.name}</Text>
              <Text style={styles.paymentMethodDesc}>{selectedPaymentMethod?.description}</Text>
            </View>
          </View>
          <ChevronDown name="chevron-down" size={16} color={COLORS.textMuted} style={{ transform: [{ rotate: showPaymentOptions ? '180deg' : '0deg' }] }} />
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
                {method.icon === 'dollar-sign' && <DollarSign name="dollar-sign" size={20} color={COLORS.text} />}
                {method.icon === 'credit-card' && <CreditCard name="credit-card" size={20} color={COLORS.text} />}
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
    color: COLORS.textMuted,
    fontSize: SIZES.medium,
    lineHeight: SIZES.medium,
    height: SIZES.medium * 2,
    justifyContent: 'center',
    textAlignVertical: 'center',
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
  clearButton: {
    alignSelf: 'center',
    marginTop: SIZES.margin,
    paddingVertical: SIZES.margin / 2,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  clearButtonText: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
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