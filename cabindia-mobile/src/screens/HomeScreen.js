// cabindia-mobile/src/screens/RideBookingScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // NEW: useFocusEffect
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import Feather from 'react-native-vector-icons/Feather';
import { PanGestureHandler, GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler'; // NEW: Gesture imports
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated'; // NEW: Reanimated imports

const { height: screenHeight } = Dimensions.get('window');

const BOTTOM_SHEET_MIN_HEIGHT = screenHeight * 0.25; // Adjusted to show more content when collapsed
const BOTTOM_SHEET_MAX_HEIGHT = screenHeight * 0.7; // Max height for inputs
const BOTTOM_SHEET_DRAG_AREA_HEIGHT = SIZES.padding * 3; // Height for the drag handle area

export default function RideBookingScreen() {
  const navigation = useNavigation();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [loadingGeocode, setLoadingGeocode] = useState(false); // NEW: loading state for geocoding
  const mapRef = useRef(null);

  // Reanimated shared value for bottom sheet's current height (from the bottom of the screen)
  const sheetHeight = useSharedValue(BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT);
  const startSheetHeight = useSharedValue(BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT);

  // Initial animation on mount to open partially
  useEffect(() => {
    // Initialize to the minimum height
    sheetHeight.value = withSpring(BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT, { damping: 15, stiffness: 100 });
  }, []);

  // Set current location on mount or when screen is focused
  useFocusEffect(
    useCallback(() => {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Location access is needed to show your position on the map and find rides.');
          return;
        }
        let location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
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
    }, [])
  );

  const geocodeAddress = async (address) => {
    try {
      const result = await Location.geocodeAsync(address);
      if (result && result.length > 0) {
        return {
          latitude: result[0].latitude,
          longitude: result[0].longitude,
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return null;
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
      Alert.alert('Location Error', 'Could not find coordinates for one or both locations. Please try again or refine your input.');
      return;
    }

    setSourceCoords(sCoords);
    setDestinationCoords(dCoords);

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
      newHeight = Math.min(Math.max(newHeight, BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT), BOTTOM_SHEET_MAX_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT);
      sheetHeight.value = newHeight;
    })
    .onEnd((event) => {
      const velocity = event.velocityY;
      let targetHeight;

      if (velocity < -500) { // Swiping up fast
        targetHeight = BOTTOM_SHEET_MAX_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT; // Fully expanded
      } else if (velocity > 500) { // Swiping down fast
        targetHeight = BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT; // Fully collapsed
      } else if (sheetHeight.value > (BOTTOM_SHEET_MAX_HEIGHT + BOTTOM_SHEET_MIN_HEIGHT + 2 * BOTTOM_SHEET_DRAG_AREA_HEIGHT) / 2) {
        targetHeight = BOTTOM_SHEET_MAX_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT; // Snap to expanded
      } else {
        targetHeight = BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT; // Snap to collapsed
      }

      sheetHeight.value = withSpring(targetHeight, { damping: 15, stiffness: 100 });
    });

  const animatedBottomSheetStyle = useAnimatedStyle(() => {
    return {
      height: sheetHeight.value,
      // The 'bottom: 0' in styles.bottomSheet, combined with 'height', correctly positions it.
      // This transform was pushing it off-screen.
      // transform: [{ translateY: screenHeight - sheetHeight.value }],
    };
  });

  const animatedMapStyle = useAnimatedStyle(() => {
    return {
      height: screenHeight - sheetHeight.value,
    };
  });

  const animatedChevronRotation = useAnimatedStyle(() => {
    // If sheet is at min height, chevron points up (0 deg rotation)
    // If sheet is at max height, chevron points down (180 deg rotation)
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Keyboard handled by inner ScrollView, offset only if necessary
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
              pinColor={COLORS.primary}
            />
          )}
          {destinationCoords && (
            <Marker
              coordinate={destinationCoords}
              title="Drop-off"
              pinColor={COLORS.secondary}
            />
          )}
        </MapView>
      </Animated.View>

      <Animated.View style={[styles.bottomSheet, animatedBottomSheetStyle]}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandleBar} />
            <Animated.View style={animatedChevronRotation}>
              <Feather name="chevron-up" size={SIZES.large} color={COLORS.textMuted} />
            </Animated.View>
          </View>
        </GestureDetector>

        <ScrollView contentContainerStyle={styles.bottomSheetContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sheetTitle}>Where are you going?</Text>
          <View style={styles.inputGroup}>
            <Feather name="map-pin" size={SIZES.large} color={COLORS.primary} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Pickup Location"
              placeholderTextColor={COLORS.textMuted}
              value={source}
              onChangeText={setSource}
            />
          </View>
          <View style={styles.inputGroup}>
            <Feather name="flag" size={SIZES.large} color={COLORS.secondary} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Drop-off Location"
              placeholderTextColor={COLORS.textMuted}
              value={destination}
              onChangeText={setDestination}
            />
          </View>

          <TouchableOpacity style={styles.findRideButton} onPress={handleGetFare} disabled={loadingGeocode}>
            {loadingGeocode ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <>
                <Text style={styles.findRideButtonText}>Find a Ride</Text>
                <Feather name="arrow-right" size={SIZES.medium} color={COLORS.background} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    // flex: 1, // Removed flex, height is controlled by animatedMapStyle
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
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    // paddingTop is handled by content + drag handle
    borderTopWidth: 1,
    borderColor: COLORS.borderColor,
    ...GLOBAL_STYLES.shadow,
    // height and transform will be set dynamically by animatedBottomSheetStyle
  },
  bottomSheetContent: {
    paddingHorizontal: SIZES.padding * 2,
    paddingTop: SIZES.padding, // Space after drag handle
    paddingBottom: SIZES.padding * 5, // Ensures content and button are above the tab bar
    flexGrow: 1, // Allow content to grow to fill height
  },
  dragHandleContainer: {
    alignSelf: 'center',
    paddingVertical: SIZES.margin,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: BOTTOM_SHEET_DRAG_AREA_HEIGHT,
    flexDirection: 'row', // Align icon next to bar
    gap: SIZES.margin, // Space between bar and icon
  },
  dragHandleBar: {
    width: 60,
    height: 6,
    backgroundColor: COLORS.borderColor,
    borderRadius: 3,
  },
  sheetTitle: {
    ...GLOBAL_STYLES.heading1,
    fontSize: SIZES.h2,
    marginBottom: SIZES.margin * 3,
    textAlign: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    marginBottom: SIZES.margin * 2,
    paddingHorizontal: SIZES.padding,
    height: 48, // Slightly reduced input height
  },
  icon: {
    marginRight: SIZES.margin,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
  },
  findRideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding, // Reduced padding
    marginTop: SIZES.margin * 2,
    gap: SIZES.margin / 2,
  },
  findRideButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },
});