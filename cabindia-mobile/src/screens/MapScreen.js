// cabindia-mobile/src/screens/MapScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Platform, PermissionsAndroid, Alert } from 'react-native';
import MapView, { Marker, AnimatedRegion, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { ArrowLeft, Phone, MessageCircle } from '@expo/vector-icons';
import carIcon from '../../assets/car_icon.png'; // Make sure you have a car_icon.png in your assets folder

const MapScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { ride, icon, source, destination, estimatedFare } = route.params || {};

  const [currentLocation, setCurrentLocation] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null); // Simulated driver location
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const initialRegion = {
    latitude: currentLocation?.latitude || 20.2764, // Default to Bhubaneswar for now
    longitude: currentLocation?.longitude || 85.8456,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const driverAnimatedRegion = useRef(
    new AnimatedRegion({
      latitude: initialRegion.latitude + 0.005,
      longitude: initialRegion.longitude + 0.005,
      latitudeDelta: initialRegion.latitudeDelta,
      longitudeDelta: initialRegion.longitudeDelta,
    })
  ).current;

  // Simulate a route for the car to follow
  const simulatedRoute = [
    { latitude: initialRegion.latitude + 0.005, longitude: initialRegion.longitude + 0.005 },
    { latitude: initialRegion.latitude + 0.010, longitude: initialRegion.longitude + 0.008 },
    { latitude: initialRegion.latitude + 0.015, longitude: initialRegion.longitude + 0.012 },
    { latitude: initialRegion.latitude + 0.020, longitude: initialRegion.longitude + 0.015 },
  ];
  const [routeIndex, setRouteIndex] = useState(0);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is needed to show your position on the map.');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Initialize driver location near current user
      setDriverLocation({
        latitude: location.coords.latitude + 0.005,
        longitude: location.coords.longitude + 0.005,
      });

      // Start simulating driver movement
      const interval = setInterval(() => {
        setRouteIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % simulatedRoute.length;
          const nextPoint = simulatedRoute[nextIndex];

          driverAnimatedRegion.timing({
            latitude: nextPoint.latitude,
            longitude: nextPoint.longitude,
            duration: 5000, // Move over 5 seconds
            useNativeDriver: true,
          }).start();

          setDriverLocation(nextPoint); // Update state for potential re-renders or other logic
          return nextIndex;
        });
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);

    })();
  }, []);

  useEffect(() => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  }, [currentLocation]);

  return (
    <View style={GLOBAL_STYLES.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        followsUserLocation
      >
        {driverLocation && (
          <Marker.Animated
            ref={markerRef}
            coordinate={driverAnimatedRegion}
            anchor={{ x: 0.5, y: 0.5 }} // Center the icon
          >
            <Image source={carIcon} style={styles.carIcon} />
          </Marker.Animated>
        )}
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ArrowLeft name="arrow-left" size={24} color={COLORS.text} />
      </TouchableOpacity>

      <View style={styles.bottomSheet}>
        <View style={styles.rideInfo}>
          <Text style={styles.rideEmoji}>{icon}</Text>
          <View>
            <Text style={styles.rideType}>{ride} Ride</Text>
            <Text style={styles.fareText}>Estimated Fare: <Text style={styles.fareValue}>₹{estimatedFare}</Text></Text>
          </View>
        </View>
        <View style={styles.locationSummary}>
          <Text style={styles.locationText} numberOfLines={1}>From: {source}</Text>
          <Text style={styles.locationText} numberOfLines={1}>To: {destination}</Text>
        </View>
        <View style={styles.driverContact}>
          <TouchableOpacity style={styles.contactButton} onPress={() => Alert.alert('Call Driver', 'Calling simulated driver...')}>
            <Phone name="phone" size={20} color={COLORS.background} />
            <Text style={styles.contactButtonText}>Call Driver</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={() => navigation.navigate('Chat')}>
            <MessageCircle name="message-circle" size={20} color={COLORS.background} />
            <Text style={styles.contactButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: SIZES.padding * 3,
    left: SIZES.padding,
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    padding: SIZES.margin,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    padding: SIZES.padding * 2,
    borderTopWidth: 1,
    borderColor: COLORS.borderColor,
    ...GLOBAL_STYLES.shadow,
  },
  rideInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin * 2,
  },
  rideEmoji: {
    fontSize: SIZES.h1,
    marginRight: SIZES.margin,
  },
  rideType: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
  },
  fareText: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.medium,
    color: COLORS.textMuted,
  },
  fareValue: {
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
  },
  locationSummary: {
    marginBottom: SIZES.margin * 2,
  },
  locationText: {
    ...GLOBAL_STYLES.text,
    fontSize: SIZES.body,
    marginBottom: SIZES.margin / 2,
    color: COLORS.textMuted,
  },
  driverContact: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: SIZES.margin,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding,
    gap: SIZES.margin / 2,
  },
  contactButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
  carIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    tintColor: COLORS.primary, // Optional: colorize the car icon
  },
});

export default MapScreen;