// cabindia-mobile/src/screens/RideBookingScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, KeyboardAvoidingView, Platform, Dimensions,
  ActivityIndicator, Image, FlatList, Switch, Modal,
  ScrollView
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
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
import { getRealDistance } from '../utils/locationUtils';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.android?.config?.googleMaps?.apiKey ||
  Constants.expoConfig?.ios?.infoPlist?.GOOGLE_MAPS_API_KEY ||
  'AIzaSyAD7ImoIAlAk6Ob9Iwyd_67UFr9lCNVTNY';

const BOTTOM_SHEET_MIN_HEIGHT = screenHeight * 0.25;
const BOTTOM_SHEET_MAX_HEIGHT = screenHeight * 0.8;
const BOTTOM_SHEET_DRAG_AREA_HEIGHT = 40;

// Map types
const MAP_TYPES = [
  { id: 'standard', label: 'Standard', icon: 'map-outline' },
  { id: 'satellite', label: 'Satellite', icon: 'satellite-outline' },
  { id: 'hybrid', label: 'Hybrid', icon: 'layers-outline' },
];

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

// Get route from Directions API
const getRoute = async (originLat, originLon, destLat, destLon) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLon}&destination=${destLat},${destLon}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const points = decodePolyline(route.overview_polyline.points);
      const leg = route.legs[0];
      return {
        points,
        distance: leg.distance.text,
        duration: leg.duration.text,
        distanceInMeters: leg.distance.value,
        durationInSeconds: leg.duration.value,
      };
    }
    return null;
  } catch (error) {
    console.error('Route error:', error);
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
  const [routePoints, setRoutePoints] = useState([]);
  const [showFullSheet, setShowFullSheet] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Map controls
  const [mapType, setMapType] = useState('standard');
  const [showMapControls, setShowMapControls] = useState(false);
  
  const mapRef = useRef(null);
  const sourceDebounce = useRef(null);
  const destDebounce = useRef(null);

  const sheetHeight = useSharedValue(BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT);
  const startSheetHeight = useSharedValue(BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT);

  // Initialize sheet height
  useEffect(() => {
    sheetHeight.value = withSpring(BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT, {
      damping: 15,
      stiffness: 100
    });
  }, []);

  // ============================================
  // GET CURRENT LOCATION
  // ============================================
  const getCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          '📍 Location Access',
          'CabIndia needs your location to find nearby rides. Please enable location permission in settings.'
        );
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      
      setCurrentLocation(region);
      
      // Reverse geocode to get address
      try {
        const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${region.latitude},${region.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(geoUrl);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const address = data.results[0].formatted_address;
          setSource(address);
          setSourceCoords({
            latitude: region.latitude,
            longitude: region.longitude,
          });
        }
      } catch (geoError) {
        console.error('Reverse geocoding error:', geoError);
        setSourceCoords({
          latitude: region.latitude,
          longitude: region.longitude,
        });
      }
      
      if (mapRef.current) {
        mapRef.current.animateToRegion(region, 1000);
      }
    } catch (error) {
      console.error('Location error:', error);
    }
  }, []);

  // Get location on focus
  useFocusEffect(
    useCallback(() => {
      getCurrentLocation();
    }, [getCurrentLocation])
  );

  // ============================================
  // FETCH ROUTE
  // ============================================
  const fetchRoute = useCallback(async () => {
    if (!sourceCoords || !destinationCoords) return;
    
    try {
      const route = await getRoute(
        sourceCoords.latitude,
        sourceCoords.longitude,
        destinationCoords.latitude,
        destinationCoords.longitude
      );
      
      if (route && route.points.length > 0) {
        setRoutePoints(route.points);
        
        // Fit map to show the route
        if (mapRef.current) {
          const first = route.points[0];
          const last = route.points[route.points.length - 1];
          mapRef.current.fitToCoordinates(
            [first, last],
            { edgePadding: { top: 80, right: 80, bottom: 180, left: 80 }, animated: true }
          );
        }
      }
    } catch (error) {
      console.error('Route error:', error);
    }
  }, [sourceCoords, destinationCoords]);

  // Fetch route when both coordinates are set
  useEffect(() => {
    if (sourceCoords && destinationCoords) {
      fetchRoute();
    }
  }, [sourceCoords, destinationCoords, fetchRoute]);

  // ============================================
  // HANDLE SOURCE CHANGE
  // ============================================
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

  // ============================================
  // HANDLE DESTINATION CHANGE
  // ============================================
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

  // ============================================
  // SELECT SOURCE SUGGESTION
  // ============================================
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

  // ============================================
  // SELECT DESTINATION SUGGESTION
  // ============================================
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

  // ============================================
  // HANDLE MAP PRESS - Manual Pin Placement
  // ============================================
  const handleMapPress = useCallback(async (e) => {
    const { coordinate } = e.nativeEvent;
    
    // Reverse geocode to get address
    try {
      const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(geoUrl);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        
        // If source is empty or we want to set pickup
        if (!sourceCoords || sourceCoords.latitude === currentLocation?.latitude) {
          setSource(address);
          setSourceCoords({
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
          });
        } else {
          // Set as destination
          setDestination(address);
          setDestinationCoords({
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
          });
        }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  }, [sourceCoords, currentLocation]);

  // ============================================
  // HANDLE GET FARE
  // ============================================
  const handleGetFare = async () => {
    if (!source || !destination) {
      Alert.alert('📍 Missing Info', 'Please enter both pickup and drop-off locations.');
      return;
    }

    if (!sourceCoords || !destinationCoords) {
      Alert.alert('📍 Location Error', 'Could not find coordinates. Please try again.');
      return;
    }

    setLoadingFindRide(true);

    try {
      // Get real distance using Google Maps
      const distanceData = await getRealDistance(
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
        distance: distanceData.distance,
        duration: distanceData.duration,
        distanceText: distanceData.distanceText,
        durationText: distanceData.durationText,
      });
    } catch (error) {
      console.error('Error in handleGetFare:', error);
      Alert.alert('❌ Error', 'Something went wrong. Please try again.');
    } finally {
      setLoadingFindRide(false);
    }
  };

  // ============================================
  // PAN GESTURE FOR BOTTOM SHEET
  // ============================================
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startSheetHeight.value = sheetHeight.value;
      setIsDragging(true);
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
      setIsDragging(false);
      const velocity = event.velocityY;
      let targetHeight;
      
      if (velocity < -500) {
        targetHeight = BOTTOM_SHEET_MAX_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT;
        setShowFullSheet(true);
      } else if (velocity > 500) {
        targetHeight = BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT;
        setShowFullSheet(false);
      } else if (sheetHeight.value > (BOTTOM_SHEET_MAX_HEIGHT + BOTTOM_SHEET_MIN_HEIGHT + 2 * BOTTOM_SHEET_DRAG_AREA_HEIGHT) / 2) {
        targetHeight = BOTTOM_SHEET_MAX_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT;
        setShowFullSheet(true);
      } else {
        targetHeight = BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT;
        setShowFullSheet(false);
      }
      sheetHeight.value = withSpring(targetHeight, { damping: 15, stiffness: 100 });
    });

  // Toggle sheet expansion
  const toggleSheet = useCallback(() => {
    const targetHeight = showFullSheet 
      ? BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT
      : BOTTOM_SHEET_MAX_HEIGHT + BOTTOM_SHEET_DRAG_AREA_HEIGHT;
    sheetHeight.value = withSpring(targetHeight, { damping: 15, stiffness: 100 });
    setShowFullSheet(!showFullSheet);
  }, [showFullSheet]);

  // ============================================
  // ANIMATED STYLES
  // ============================================
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

  // ============================================
  // RENDER SUGGESTIONS
  // ============================================
  const renderSuggestions = (suggestions, onSelect, show) => {
    if (!show || suggestions.length === 0) return null;
    
    // Add "Current Location" option for source suggestions
    const enhancedSuggestions = [...suggestions];
    if (currentLocation) {
      enhancedSuggestions.unshift({
        id: 'current_location',
        description: 'Current Location',
        main_text: '📍 Current Location',
        secondary_text: 'Use your current location',
        isCurrentLocation: true,
      });
    }
    
    return (
      <View style={styles.suggestionsContainer}>
        <FlatList
          data={enhancedSuggestions}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => {
                if (item.isCurrentLocation) {
                  // Use current location
                  onSelect({
                    description: item.description,
                    id: item.id,
                    isCurrentLocation: true,
                  });
                } else {
                  onSelect(item);
                }
              }}
            >
              <Ionicons 
                name={item.isCurrentLocation ? 'locate' : 'location-outline'} 
                size={18} 
                color={item.isCurrentLocation ? '#22c55e' : COLORS.primary} 
              />
              <View style={styles.suggestionTextContainer}>
                <Text style={[styles.suggestionMain, item.isCurrentLocation && { color: '#22c55e' }]}>
                  {item.main_text}
                </Text>
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

  // ============================================
  // RENDER MAP CONTROLS
  // ============================================
  const renderMapControls = () => (
    <View style={styles.mapControlsContainer}>
      <TouchableOpacity style={styles.mapControlBtn} onPress={() => {
        const currentIndex = MAP_TYPES.findIndex(t => t.id === mapType);
        const nextIndex = (currentIndex + 1) % MAP_TYPES.length;
        setMapType(MAP_TYPES[nextIndex].id);
      }}>
        <Ionicons name="layers-outline" size={20} color={COLORS.text} />
        <Text style={styles.mapControlLabel}>{mapType.charAt(0).toUpperCase() + mapType.slice(1)}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.mapControlBtn} onPress={() => {
        if (sourceCoords && mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: sourceCoords.latitude,
            longitude: sourceCoords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        } else if (currentLocation) {
          mapRef.current.animateToRegion(currentLocation);
        }
      }}>
        <Ionicons name="locate-outline" size={20} color={COLORS.text} />
        <Text style={styles.mapControlLabel}>Center</Text>
      </TouchableOpacity>
    </View>
  );

  // ============================================
  // MAIN RENDER
  // ============================================
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
          mapType={mapType}
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
          googleMapsApiKey={GOOGLE_MAPS_API_KEY}
          showsTraffic={true}
          showsCompass={true}
          showsScale={true}
          showsIndoors={true}
          onPress={handleMapPress}
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
              draggable={true}
              onDragEnd={(e) => {
                const { coordinate } = e.nativeEvent;
                setSourceCoords({
                  latitude: coordinate.latitude,
                  longitude: coordinate.longitude,
                });
                // Reverse geocode to get address
                fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=${GOOGLE_MAPS_API_KEY}`)
                  .then(res => res.json())
                  .then(data => {
                    if (data.results && data.results.length > 0) {
                      setSource(data.results[0].formatted_address);
                    }
                  })
                  .catch(console.error);
              }}
            />
          )}
          {destinationCoords && (
            <Marker
              coordinate={destinationCoords}
              title="Drop-off"
              pinColor="#f44336"
              draggable={true}
              onDragEnd={(e) => {
                const { coordinate } = e.nativeEvent;
                setDestinationCoords({
                  latitude: coordinate.latitude,
                  longitude: coordinate.longitude,
                });
                fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=${GOOGLE_MAPS_API_KEY}`)
                  .then(res => res.json())
                  .then(data => {
                    if (data.results && data.results.length > 0) {
                      setDestination(data.results[0].formatted_address);
                    }
                  })
                  .catch(console.error);
              }}
            />
          )}
          
          {/* Show route on map */}
          {routePoints.length > 0 && (
            <Polyline
              coordinates={routePoints}
              strokeColor={COLORS.primary}
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
              tappable={true}
            />
          )}
        </MapView>

        {/* Map Controls */}
        {renderMapControls()}
      </Animated.View>

      <Animated.View style={[styles.bottomSheet, animatedBottomSheetStyle]}>
        <GestureDetector gesture={panGesture}>
          <TouchableOpacity 
            style={styles.dragHandleContainer} 
            onPress={toggleSheet}
            activeOpacity={0.7}
          >
            <View style={styles.dragHandleBar} />
            <Animated.View style={animatedChevronRotation}>
              <Ionicons name="chevron-up" size={20} color={COLORS.textMuted} />
            </Animated.View>
          </TouchableOpacity>
        </GestureDetector>

        <ScrollView 
          style={styles.bottomSheetScrollView}
          contentContainerStyle={styles.bottomSheetContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
                onChangeText={handleSourceChange}
                onFocus={() => setShowSourceSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowSourceSuggestions(false), 200);
                }}
              />
              <TouchableOpacity 
                style={styles.currentLocationBtn}
                onPress={getCurrentLocation}
              >
                <Ionicons name="locate" size={20} color={COLORS.primary} />
              </TouchableOpacity>
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
                onFocus={() => setShowDestSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowDestSuggestions(false), 200);
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
            {loadingFindRide ? (
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
  bottomSheetScrollView: {
    flex: 1,
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
    paddingVertical: 4,
  },
  dragHandleBar: {
    width: 60,
    height: 5,
    backgroundColor: COLORS.borderColor,
    borderRadius: 3,
  },
  headerSection: {
    marginBottom: 16,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  inputContainer: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    paddingHorizontal: 16,
    marginBottom: 16,
    position: 'relative',
    zIndex: 10,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
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
  currentLocationBtn: {
    padding: 8,
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
    paddingVertical: 14,
    gap: 10,
    marginBottom: 16,
  },
  findRideButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  quickAction: {
    alignItems: 'center',
    gap: 4,
  },
  quickActionText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  
  // Map Controls
  mapControlsContainer: {
    position: 'absolute',
    top: 50,
    right: 16,
    gap: 8,
    zIndex: 5,
  },
  mapControlBtn: {
    backgroundColor: 'rgba(17, 17, 17, 0.85)',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    width: 50,
  },
  mapControlLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    marginTop: 2,
  },
});