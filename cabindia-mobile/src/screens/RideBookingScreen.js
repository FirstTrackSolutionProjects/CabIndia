// cabindia-mobile/src/screens/RideBookingScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  Alert, KeyboardAvoidingView, Platform, Dimensions, 
  ScrollView, ActivityIndicator, Image 
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import Constants from 'expo-constants';

const { height: screenHeight } = Dimensions.get('window');

// Get Google Maps API Key from Constants
const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.android?.config?.googleMaps?.apiKey || 
                           Constants.expoConfig?.ios?.infoPlist?.GOOGLE_MAPS_API_KEY ||
                           'AIzaSyAD7ImoIAlAk6Ob9Iwyd_67UFr9lCNVTNY';

const BOTTOM_SHEET_MIN_HEIGHT = screenHeight * 0.28;
const BOTTOM_SHEET_MAX_HEIGHT = screenHeight * 0.65;
const BOTTOM_SHEET_DRAG_AREA_HEIGHT = 40;

export default function RideBookingScreen() {
  const navigation = useNavigation();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [loadingGeocode, setLoadingGeocode] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);

  const sheetHeight = useSharedValue(BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT);
  const startSheetHeight = useSharedValue(BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT);

  useEffect(() => {
    sheetHeight.value = withSpring(BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT, { 
      damping: 15, 
      stiffness: 100 
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission denied', 'Location access is needed for rides.');
            return;
          }
          const location = await Location.getCurrentPositionAsync({});
          const region = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          };
          setCurrentLocation(region);
          if (mapRef.current) {
            mapRef.current.animateToRegion(region);
          }
        } catch (error) {
          console.error('Location error:', error);
        }
      })();
    }, [])
  );

  const geocodeAddress = async (address) => {
    try {
      // Use Google Maps Geocoding API via backend
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const handleGetFare = async () => {
    if (!source || !destination) {
      Alert.alert('Missing Info', 'Please enter both pickup and drop-off locations.');
      return;
    }

    setLoadingGeocode(true);
    const sCoords = await geocodeAddress(source);
    const dCoords = await geocodeAddress(destination);
    setLoadingGeocode(false);

    if (!sCoords || !dCoords) {
      Alert.alert('Location Error', 'Could not find coordinates. Please try again.');
      return;
    }

    setSourceCoords(sCoords);
    setDestinationCoords(dCoords);

    // Fit map to show both locations
    if (mapRef.current) {
      mapRef.current.fitToCoordinates(
        [sCoords, dCoords],
        { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true }
      );
    }

    // Navigate to FareDetails with real coordinates
    navigation.navigate('FareDetails', {
      sourceAddress: source,
      destinationAddress: destination,
      sourceLat: sCoords.latitude,
      sourceLon: sCoords.longitude,
      destinationLat: dCoords.latitude,
      destinationLon: dCoords.longitude,
    });
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startSheetHeight.value = sheetHeight.value;
    })
    .onUpdate((event) => {
      let newHeight = startSheetHeight.value - event.translationY;
      newHeight = Math.min(
        Math.max(newHeight, BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT),
        BOTTOM_SHEET_MAX_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT
      );
      sheetHeight.value = newHeight;
    })
    .onEnd((event) => {
      const velocity = event.velocityY;
      let targetHeight;
      if (velocity < -500) {
        targetHeight = BOTTOM_SHEET_MAX_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT;
      } else if (velocity > 500) {
        targetHeight = BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT;
      } else if (sheetHeight.value > (BOTTOM_SHEET_MAX_HEIGHT + BOTTOM_SHEET_MIN_HEIGHT + 2 * BOTTOM_SHEET_DRAG_AREA_HEIGHT) / 2) {
        targetHeight = BOTTOM_SHEET_MAX_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT;
      } else {
        targetHeight = BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT;
      }
      sheetHeight.value = withSpring(targetHeight, { damping: 15, stiffness: 100 });
    });

  const animatedBottomSheetStyle = useAnimatedStyle(() => ({
    height: sheetHeight.value,
  }));

  const animatedMapStyle = useAnimatedStyle(() => ({
    height: screenHeight - sheetHeight.value,
  }));

  const animatedChevronRotation = useAnimatedStyle(() => {
    const rotate = interpolate(
      sheetHeight.value,
      [BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT, BOTTOM_SHEET_MAX_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT],
      [0, 180],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  return (
    <KeyboardAvoidingView
      style={GLOBAL_STYLES.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View style={[styles.mapContainer, animatedMapStyle]}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={currentLocation || {
            latitude: 20.2764,
            longitude: 85.8456,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
          followsUserLocation={true}
          loadingEnabled
          loadingIndicatorColor={COLORS.primary}
          loadingBackgroundColor={COLORS.background}
          onMapReady={() => setMapReady(true)}
          apiKey={GOOGLE_MAPS_API_KEY}
        >
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="Your Location"
              pinColor={COLORS.primary}
            />
          )}
          {sourceCoords && (
            <Marker
              coordinate={sourceCoords}
              title="Pickup"
              pinColor="#4CAF50"
            />
          )}
          {destinationCoords && (
            <Marker
              coordinate={destinationCoords}
              title="Drop-off"
              pinColor="#f44336"
            />
          )}
        </MapView>
      </Animated.View>

      <Animated.View style={[styles.bottomSheet, animatedBottomSheetStyle]}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandleBar} />
            <Animated.View style={animatedChevronRotation}>
              <Ionicons name="chevron-up" size={20} color={COLORS.textMuted} />
            </Animated.View>
          </View>
        </GestureDetector>

        <ScrollView 
          contentContainerStyle={styles.bottomSheetContent} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/icon.png')} 
                style={styles.logoIcon}
                defaultSource={require('../../assets/icon.png')}
              />
              <Text style={styles.brandText}>CabIndia</Text>
            </View>
            <Text style={styles.sheetTitle}>Where are you going?</Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputGroup}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="location" size={20} color={COLORS.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Pickup Location"
                placeholderTextColor={COLORS.textMuted}
                value={source}
                onChangeText={setSource}
              />
            </View>

            <View style={styles.inputDivider}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerDot} />
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="flag" size={20} color={COLORS.secondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Drop-off Location"
                placeholderTextColor={COLORS.textMuted}
                value={destination}
                onChangeText={setDestination}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.findRideButton} 
            onPress={handleGetFare} 
            disabled={loadingGeocode}
            activeOpacity={0.8}
          >
            {loadingGeocode ? (
              <ActivityIndicator color={COLORS.background} size="small" />
            ) : (
              <>
                <Text style={styles.findRideButtonText}>Find a Ride</Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.background} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="car" size={24} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Ride Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="calendar" size={24} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="business" size={24} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Corporate</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: COLORS.borderColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomSheetContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 30,
  },
  dragHandleContainer: {
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: BOTTOM_SHEET_DRAG_AREA_HEIGHT,
    flexDirection: 'row',
    gap: 12,
  },
  dragHandleBar: {
    width: 60,
    height: 5,
    backgroundColor: COLORS.borderColor,
    borderRadius: 3,
  },
  headerSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  brandText: {
    color: COLORS.primary,
    fontSize: 20,
    fontFamily: FONTS.bold,
  },
  sheetTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  inputContainer: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  inputIconContainer: {
    width: 32,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontFamily: FONTS.regular,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  inputDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    paddingHorizontal: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderColor,
  },
  dividerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginHorizontal: 8,
  },
  findRideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 10,
    marginBottom: 24,
  },
  findRideButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  quickAction: {
    alignItems: 'center',
    gap: 6,
  },
  quickActionText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
});