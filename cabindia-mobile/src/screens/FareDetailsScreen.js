// cabindia-mobile/src/screens/FareDetailsScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, ScrollView, ActivityIndicator, Modal, Switch 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
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
  { name: "Cash", icon: "cash-outline", description: "Pay directly to the captain" },
  { name: "Online", icon: "card-outline", description: "UPI, cards or wallets" },
  { name: "Wallet", icon: "wallet-outline", description: "Pay using CabIndia Wallet" },
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
    destinationLon,
    distance: routeDistance,
    duration: routeDuration,
    distanceText: routeDistanceText,
    durationText: routeDurationText,
  } = route.params || {};

  const [selectedPayment, setSelectedPayment] = useState("Cash");
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [distance, setDistance] = useState(routeDistance || 0);
  const [loadingDistance, setLoadingDistance] = useState(!routeDistance);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletRechargeAmount, setWalletRechargeAmount] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);

  // Get real distance using Google Maps Distance Matrix API
  useEffect(() => {
    const getRealDistance = async () => {
      if (routeDistance) {
        setDistance(routeDistance);
        setLoadingDistance(false);
        return;
      }

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
    fetchWalletBalance();
  }, [sourceLat, sourceLon, destinationLat, destinationLon, routeDistance]);

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    try {
      const response = await api.get('/user/wallet');
      if (response.data.success) {
        setWalletBalance(response.data.balance || 0);
      }
    } catch (error) {
      console.log('Wallet fetch error:', error);
    }
  };

  // Handle wallet recharge
  const handleWalletRecharge = async () => {
    const amount = parseFloat(walletRechargeAmount);
    if (!amount || amount < 10) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount (minimum ₹10)');
      return;
    }

    setWalletLoading(true);
    try {
      // Create Razorpay order
      const response = await api.post('/payment/create-order', {
        amount: amount,
        currency: 'INR',
        receipt: `wallet_${Date.now()}`,
      });

      if (!response.data.success) {
        Alert.alert('Error', response.data.message || 'Failed to create payment order');
        setWalletLoading(false);
        return;
      }

      const { orderId, amount: orderAmount, currency } = response.data;

      // Use Razorpay Checkout
      // Note: You need to add the Razorpay SDK to your project
      // For now, we'll simulate payment success
      Alert.alert(
        'Payment Initiated',
        `Please complete the payment of ₹${orderAmount} ${currency}`,
        [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: () => setWalletLoading(false)
          },
          { 
            text: 'Pay Now',
            onPress: async () => {
              try {
                // Simulate payment success
                const verifyResponse = await api.post('/payment/verify', {
                  orderId: orderId,
                  paymentId: `pay_${Date.now()}`,
                  signature: `sig_${Date.now()}`,
                  amount: orderAmount,
                });

                if (verifyResponse.data.success) {
                  setWalletBalance(prev => prev + orderAmount);
                  setWalletRechargeAmount('');
                  setShowWalletModal(false);
                  Alert.alert('Success', `₹${orderAmount} added to your wallet!`);
                }
              } catch (err) {
                Alert.alert('Error', 'Payment verification failed');
              }
              setWalletLoading(false);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Wallet recharge error:', error);
      Alert.alert('Error', 'Failed to initiate payment');
      setWalletLoading(false);
    }
  };

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

    // Check wallet balance if paying with wallet
    if (selectedPayment === 'Wallet') {
      const minFare = Math.max(selectedRide.minFare, selectedRide.pricePerKm * distance);
      if (walletBalance < minFare) {
        Alert.alert(
          'Insufficient Balance',
          `Your wallet balance is ₹${walletBalance}. Please add funds to continue.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Add Funds', onPress: () => setShowWalletModal(true) }
          ]
        );
        return;
      }
    }

    setLoadingBooking(true);

    const minFare = Math.max(selectedRide.minFare, selectedRide.pricePerKm * distance);
    const maxFare = Math.ceil(minFare * 1.2);
    const estimatedFareStr = `${Math.floor(minFare)} - ${maxFare}`;

    try {
      const response = await api.post('/api/rides/request', {
        pickupAddress: sourceAddress,
        dropoffAddress: destinationAddress,
        vehicleType: selectedRide.type,
        pickupLat: sourceLat,
        pickupLon: sourceLon,
        dropoffLat: destinationLat,
        dropoffLon: destinationLon,
        estimatedPrice: estimatedFareStr,
        distanceKm: distance.toFixed(1),
        paymentMethod: selectedPayment,
      });

      if (response.data.success) {
        // If paying with wallet, deduct balance
        if (selectedPayment === 'Wallet') {
          await api.post('/payment/deduct-wallet', {
            amount: Math.floor(minFare),
            rideId: response.data.rideId,
          });
        }

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
    } finally {
      setLoadingBooking(false);
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fare Details</Text>
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
            <Ionicons name={selectedPaymentMethod?.icon} size={SIZES.large} color={COLORS.primary} />
            <View>
              <Text style={styles.paymentMethodName}>{selectedPaymentMethod?.name}</Text>
              <Text style={styles.paymentMethodDesc}>{selectedPaymentMethod?.description}</Text>
            </View>
          </View>
          <Ionicons name="chevron-down" size={SIZES.body} color={COLORS.textMuted} style={{ transform: [{ rotate: showPaymentOptions ? '180deg' : '0deg' }] }} />
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
                <Ionicons name={method.icon} size={SIZES.large} color={COLORS.primary} />
                <View>
                  <Text style={styles.paymentOptionName}>{method.name}</Text>
                  <Text style={styles.paymentOptionDesc}>{method.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedPayment === 'Wallet' && (
          <View style={styles.walletInfoContainer}>
            <View style={styles.walletBalanceRow}>
              <Text style={styles.walletLabel}>Wallet Balance:</Text>
              <Text style={styles.walletBalance}>₹{walletBalance.toFixed(2)}</Text>
            </View>
            <TouchableOpacity 
              style={styles.addFundsButton}
              onPress={() => setShowWalletModal(true)}
            >
              <Text style={styles.addFundsButtonText}>+ Add Funds</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={handleContinue}
        style={[styles.continueButton, loadingBooking && { opacity: 0.7 }]}
        disabled={loadingBooking}
      >
        {loadingBooking ? (
          <ActivityIndicator color={COLORS.background} size="small" />
        ) : (
          <Text style={styles.continueButtonText}>Continue Booking</Text>
        )}
      </TouchableOpacity>

      {/* Wallet Recharge Modal */}
      <Modal
        visible={showWalletModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWalletModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Funds to Wallet</Text>
              <TouchableOpacity onPress={() => setShowWalletModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Enter Amount (₹)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Min ₹10"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={walletRechargeAmount}
                onChangeText={setWalletRechargeAmount}
              />
              
              <View style={styles.quickAmounts}>
                {[10, 50, 100, 500].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={styles.quickAmountButton}
                    onPress={() => setWalletRechargeAmount(amount.toString())}
                  >
                    <Text style={styles.quickAmountText}>₹{amount}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]} 
                onPress={() => setShowWalletModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSaveButton]} 
                onPress={handleWalletRecharge}
                disabled={walletLoading}
              >
                {walletLoading ? (
                  <ActivityIndicator color={COLORS.background} size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Add Funds</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin * 3,
    paddingVertical: SIZES.padding,
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    ...GLOBAL_STYLES.heading1,
    color: COLORS.primary,
    fontSize: SIZES.h2,
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
  walletInfoContainer: {
    marginTop: SIZES.margin,
    padding: SIZES.padding,
    backgroundColor: `${COLORS.primary}0A`,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  walletBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    color: COLORS.text,
    fontSize: SIZES.medium,
    fontFamily: FONTS.semibold,
  },
  walletBalance: {
    color: COLORS.primary,
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
  },
  addFundsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: SIZES.radius,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  addFundsButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    padding: SIZES.padding * 1.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  modalBody: {
    paddingVertical: SIZES.padding,
  },
  modalLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.8,
    color: COLORS.text,
    fontSize: SIZES.body,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: SIZES.margin,
  },
  quickAmountButton: {
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  quickAmountText: {
    color: COLORS.text,
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.margin,
    paddingTop: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SIZES.padding * 0.8,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  modalCancelText: {
    color: COLORS.text,
    fontFamily: FONTS.semibold,
    fontSize: SIZES.medium,
  },
  modalSaveButton: {
    backgroundColor: COLORS.primary,
  },
  modalSaveText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
});