// cabindia-mobile/src/utils/locationUtils.js
import Constants from 'expo-constants';

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.android?.config?.googleMaps?.apiKey || 
                           Constants.expoConfig?.ios?.infoPlist?.GOOGLE_MAPS_API_KEY ||
                           'AIzaSyAD7ImoIAlAk6Ob9Iwyd_67UFr9lCNVTNY';

/**
 * Calculates the distance between two geographical points using the Haversine formula.
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers

  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

/**
 * Gets real distance using Google Maps Distance Matrix API
 * @param {number} originLat 
 * @param {number} originLon 
 * @param {number} destLat 
 * @param {number} destLon 
 * @returns {Promise<{distance: number, duration: number}>}
 */
export const getRealDistance = async (originLat, originLon, destLat, destLon) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLon}&destinations=${destLat},${destLon}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.rows && data.rows.length > 0 && data.rows[0].elements && data.rows[0].elements.length > 0) {
      const element = data.rows[0].elements[0];
      if (element.status === 'OK') {
        return {
          distance: element.distance.value / 1000, // Convert meters to km
          duration: element.duration.value / 60, // Convert seconds to minutes
          distanceText: element.distance.text,
          durationText: element.duration.text,
        };
      }
    }
    // Fallback to calculated distance
    const calcDist = calculateDistance(originLat, originLon, destLat, destLon);
    return {
      distance: calcDist,
      duration: calcDist * 2, // Rough estimate: 2 minutes per km
      distanceText: `${calcDist.toFixed(1)} km`,
      durationText: `${Math.round(calcDist * 2)} mins`,
    };
  } catch (error) {
    console.error('Distance Matrix API error:', error);
    const calcDist = calculateDistance(originLat, originLon, destLat, destLon);
    return {
      distance: calcDist,
      duration: calcDist * 2,
      distanceText: `${calcDist.toFixed(1)} km`,
      durationText: `${Math.round(calcDist * 2)} mins`,
    };
  }
};