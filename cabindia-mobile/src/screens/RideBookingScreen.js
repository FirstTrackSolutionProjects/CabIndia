// cabindia-mobile/src/screens/RideBookingScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, KeyboardAvoidingView, Platform, Dimensions,
  ActivityIndicator, Image, FlatList
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
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

// Google Maps API Key - IMPORTANT: This must match your app.json
const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.android?.config?.googleMaps?.apiKey ||
  Constants.expoConfig?.ios?.infoPlist?.GOOGLE_MAPS_API_KEY ||
  'AIzaSyAD7ImoIAlAk6Ob9Iwyd_67UFr9lCNVTNY';

console.log('🗺️ Google Maps API Key:', GOOGLE_MAPS_API_KEY ? 'Configured ✅' : 'Missing ❌');

const BOTTOM_SHEET_MIN_HEIGHT = screenHeight * 0.28;
const BOTTOM_SHEET_MAX_HEIGHT = screenHeight * 0.65;
const BOTTOM_SHEET_DRAG_AREA_HEIGHT = 40;

// Google Places Autocomplete function
const fetchPlaces = async (input) => {
  if (!input || input.length < 2) return [];
  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}&components=country:in`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.predictions) {
      return data.predictions.map(p => ({
        id: p.place_id,
        description: p.description,
        main_text: p.structured_formatting?.main_text || p.description,
        secondary_text: p.structured_formatting?.secondary_text || '',
      }));
    }
    return [];
  } catch (error) {
    console.error('Places API error:', error);
    return [];
  }
};

// Get place details (lat/lng) from place_id
const getPlaceDetails = async (placeId) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.result && data.result.geometry) {
      return {
        latitude: data.result.geometry.location.lat,
        longitude: data.result.geometry.location.lng,
        formatted_address: data.result.formatted_address,
      };
    }
    return null;
  } catch (error) {
    console.error('Place details error:', error);
    return null;
  }
};

export default function RideBookingScreen() {
  const navigation = useNavigation();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [loadingGeocode, setLoadingGeocode] = useState(false);
  const [loadingFindRide, setLoadingFindRide] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const mapRef = useRef(null);

  // Debounce timers
  const sourceDebounce = useRef(null);
  const destDebounce = useRef(null);

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

  // Handle source text change with debounce
  const handleSourceChange = (text) => {
    setSource(text);
    setShowSourceSuggestions(true);

    if (sourceDebounce.current) clearTimeout(sourceDebounce.current);
    sourceDebounce.current = setTimeout(async () => {
      if (text.length >= 2) {
        const results = await fetchPlaces(text);
        setSourceSuggestions(results);
      } else {
        setSourceSuggestions([]);
      }
    }, 300);
  };

  // Handle destination text change with debounce
  const handleDestChange = (text) => {
    setDestination(text);
    setShowDestSuggestions(true);

    if (destDebounce.current) clearTimeout(destDebounce.current);
    destDebounce.current = setTimeout(async () => {
      if (text.length >= 2) {
        const results = await fetchPlaces(text);
        setDestSuggestions(results);
      } else {
        setDestSuggestions([]);
      }
    }, 300);
  };

  // Select a suggestion for source
  const selectSourceSuggestion = async (suggestion) => {
    setSource(suggestion.description);
    setShowSourceSuggestions(false);
    setSourceSuggestions([]);

    const details = await getPlaceDetails(suggestion.id);
    if (details) {
      setSourceCoords({
        latitude: details.latitude,
        longitude: details.longitude,
      });
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: details.latitude,
          longitude: details.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      }
    }
  };

  // Select a suggestion for destination
  const selectDestSuggestion = async (suggestion) => {
    setDestination(suggestion.description);
    setShowDestSuggestions(false);
    setDestSuggestions([]);

    const details = await getPlaceDetails(suggestion.id);
    if (details) {
      setDestinationCoords({
        latitude: details.latitude,
        longitude: details.longitude,
      });
    }
  };

  // Get route between two points
  const getRoute = async (originLat, originLon, destLat, destLon) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLon}&destination=${destLat},${destLon}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const points = data.routes[0].overview_polyline.points;
        const decoded = decodePolyline(points);
        setRouteCoordinates(decoded);

        if (mapRef.current && decoded.length > 0) {
          const first = decoded[0];
          const last = decoded[decoded.length - 1];
          mapRef.current.fitToCoordinates(
            [first, last],
            { edgePadding: { top: 80, right: 80, bottom: 80, left: 80 }, animated: true }
          );
        }
        return decoded;
      }
      return [];
    } catch (error) {
      console.error('Route error:', error);
      return [];
    }
  };

  // Decode polyline
  const decodePolyline = (encoded) => {
    const points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return points;
  };

  const handleGetFare = async () => {
    if (!source || !destination) {
      Alert.alert('Missing Info', 'Please enter both pickup and drop-off locations.');
      return;
    }

    setLoadingFindRide(true);

    try {
      if (!sourceCoords || !destinationCoords) {
        setLoadingGeocode(true);
        try {
          const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(source)}&key=${GOOGLE_MAPS_API_KEY}`;
          const geoResponse = await fetch(geoUrl);
          const geoData = await geoResponse.json();
          if (geoData.results && geoData.results.length > 0) {
            const { lat, lng } = geoData.results[0].geometry.location;
            setSourceCoords({ latitude: lat, longitude: lng });
          }

          const geoUrl2 = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${GOOGLE_MAPS_API_KEY}`;
          const geoResponse2 = await fetch(geoUrl2);
          const geoData2 = await geoResponse2.json();
          if (geoData2.results && geoData2.results.length > 0) {
            const { lat, lng } = geoData2.results[0].geometry.location;
            setDestinationCoords({ latitude: lat, longitude: lng });
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        }
        setLoadingGeocode(false);
      }

      if (!sourceCoords || !destinationCoords) {
        Alert.alert('Location Error', 'Could not find coordinates. Please try again.');
        setLoadingFindRide(false);
        return;
      }

      await getRoute(
        sourceCoords.latitude,
        sourceCoords.longitude,
        destinationCoords.latitude,
        destinationCoords.longitude
      );

      navigation.navigate('FareDetails', {
        sourceAddress: source,
        destinationAddress: destination,
        sourceLat: sourceCoords.latitude,
        sourceLon: sourceCoords.longitude,
        destinationLat: destinationCoords.latitude,
        destinationLon: destinationCoords.longitude,
      });
    } catch (error) {
      console.error('Error in handleGetFare:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoadingFindRide(false);
    }
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

  // Render suggestions list
  const renderSuggestions = (suggestions, onSelect, show) => {
    if (!show || suggestions.length === 0) return null;
    return (
      <View style={styles.suggestionsContainer}>
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => onSelect(item)}
            >
              <Ionicons name="location-outline" size={18} color={COLORS.primary} />
              <View style={styles.suggestionTextContainer}>
                <Text style={styles.suggestionMain}>{item.main_text}</Text>
                {item.secondary_text ? (
                  <Text style={styles.suggestionSecondary}>{item.secondary_text}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

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
          onMapReady={() => {
            console.log('🗺️ Map is ready!');
            setMapReady(true);
          }}
          // IMPORTANT: Add googleMapsApiKey prop
          googleMapsApiKey={GOOGLE_MAPS_API_KEY}
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
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={COLORS.primary}
              strokeWidth={3}
              lineDashPattern={[0]}
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

        <View style={styles.bottomSheetContent}>
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
                onChangeText={handleSourceChange}
                onFocus={() => {
                  setShowSourceSuggestions(true);
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setShowSourceSuggestions(false);
                  }, 200);
                }}
              />
            </View>
            {renderSuggestions(sourceSuggestions, selectSourceSuggestion, showSourceSuggestions)}

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
                onChangeText={handleDestChange}
                onFocus={() => {
                  setShowDestSuggestions(true);
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setShowDestSuggestions(false);
                  }, 200);
                }}
              />
            </View>
            {renderSuggestions(destSuggestions, selectDestSuggestion, showDestSuggestions)}
          </View>

          <TouchableOpacity
            style={[styles.findRideButton, (loadingFindRide || loadingGeocode) && { opacity: 0.7 }]}
            onPress={handleGetFare}
            disabled={loadingFindRide || loadingGeocode}
            activeOpacity={0.8}
          >
            {(loadingFindRide || loadingGeocode) ? (
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
        </View>
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
    flex: 1,
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
    position: 'relative',
    zIndex: 10,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    zIndex: 10,
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
  suggestionsContainer: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 8,
    maxHeight: 200,
    position: 'relative',
    zIndex: 20,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  suggestionTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  suggestionMain: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  suggestionSecondary: {
    color: COLORS.textMuted,
    fontSize: 12,
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