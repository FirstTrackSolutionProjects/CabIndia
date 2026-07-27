// cabindia-mobile/src/screens/MapScreen.js
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, AnimatedRegion, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Feather } from '@expo/vector-icons';
import { io } from 'socket.io-client';

// Replace with your backend URL
const BACKEND_URL = 'http://192.168.29.203:5000';
const socket = io(BACKEND_URL, {
  transports: ['websocket'],
  forceNew: true
});

const MapScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { ride, icon, source, destination, estimatedFare } = route.params || {};
  const [rideId] = useState(route.params?.rideId || null);
  const [isSearching, setIsSearching] = useState(!!route.params?.rideId);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const defaultRegion = {
    latitude: 20.2764,
    longitude: 85.8456,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const driverAnimatedRegion = useRef(
    new AnimatedRegion({
      latitude: defaultRegion.latitude,
      longitude: defaultRegion.longitude,
      latitudeDelta: defaultRegion.latitudeDelta,
      longitudeDelta: defaultRegion.longitudeDelta,
    })
  ).current;

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

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (rideId) {
      console.log(`Attempting to join ride room: ride_${rideId}`);
      socket.emit('join_ride', rideId);

      const locationUpdateHandler = (data) => {
        console.log(`Received location update for ride ${data.rideId}:`, data);
        setIsSearching(false);
        if (driverAnimatedRegion) {
          driverAnimatedRegion.timing({
            latitude: data.latitude,
            longitude: data.longitude,
            duration: 2000,
            useNativeDriver: true,
          }).start();
        }
        setDriverLocation({ latitude: data.latitude, longitude: data.longitude });
      };

      socket.on(`location_${rideId}`, locationUpdateHandler);

      return () => {
        console.log(`Cleaning up socket for ride room: ride_${rideId}`);
        socket.off(`location_${rideId}`, locationUpdateHandler);
        socket.disconnect();
      };
    }
  }, [rideId]);

  return (
    <View style={GLOBAL_STYLES.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={defaultRegion}
        showsUserLocation
        followsUserLocation
      >
        {driverLocation && (
          <Marker.Animated
            ref={markerRef}
            coordinate={driverAnimatedRegion}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <Image source={require('../../assets/car_icon.png')} style={styles.carIcon} />
          </Marker.Animated>
        )}
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Feather name="arrow-left" size={24} color={COLORS.text} />
      </TouchableOpacity>

      <View style={styles.bottomSheet}>
        {isSearching ? (
          <View style={{ alignItems: 'center', paddingVertical: SIZES.padding }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[GLOBAL_STYLES.text, { marginTop: SIZES.margin, fontFamily: FONTS.bold }]}>Searching for nearby captains...</Text>
          </View>
        ) : (
          <>
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
                <Feather name="phone" size={20} color={COLORS.background} />
                <Text style={styles.contactButtonText}>Call Driver</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactButton} onPress={() => navigation.navigate('Chat')}>
                <Feather name="message-circle" size={20} color={COLORS.background} />
                <Text style={styles.contactButtonText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
    tintColor: COLORS.primary,
  },
});

export default MapScreen;