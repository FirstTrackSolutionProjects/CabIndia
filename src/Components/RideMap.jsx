// src/Components/RideMap.jsx
import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, Polyline, LoadScript } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 20.2961,
  lng: 85.8245,
};

const mapOptions = {
  styles: [
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#ffffff' }]
    },
    {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#000000' }]
    },
    {
      featureType: 'all',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#2c2c2c' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1a1a1a' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#1a1a2e' }]
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#121212' }]
    }
  ],
  disableDefaultUI: true,
  zoomControl: true,
  zoomControlOptions: {
    position: window?.google?.maps?.ControlPosition?.RIGHT_BOTTOM || 10,
  },
};

const RideMap = ({ 
  pickupLat, 
  pickupLon, 
  dropoffLat, 
  dropoffLon, 
  driverLocation, 
  routePoints,
  height = 'h-64 md:h-80'
}) => {
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);

  const center = {
    lat: pickupLat || defaultCenter.lat,
    lng: pickupLon || defaultCenter.lng,
  };

  const onLoad = (mapInstance) => {
    setMap(mapInstance);
    mapRef.current = mapInstance;
    
    // Fit bounds to show all points
    const points = [];
    if (pickupLat) points.push({ lat: pickupLat, lng: pickupLon });
    if (dropoffLat) points.push({ lat: dropoffLat, lng: dropoffLon });
    if (driverLocation) points.push({ lat: driverLocation.lat, lng: driverLocation.lng });
    
    if (points.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      points.forEach(p => bounds.extend(p));
      mapInstance.fitBounds(bounds, { padding: 50 });
    } else if (points.length === 1) {
      mapInstance.setCenter(points[0]);
      mapInstance.setZoom(14);
    }
  };

  const onUnmount = () => {
    setMap(null);
  };

  return (
    <div className={`w-full ${height} rounded-xl overflow-hidden`}>
      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAD7ImoIAlAk6Ob9Iwyd_67UFr9lCNVTNY'}
        loadingElement={
          <div className="h-full flex items-center justify-center bg-gray-900">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              <p className="text-gray-500 text-sm">Loading map...</p>
            </div>
          </div>
        }
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={14}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
        >
          {/* Pickup Marker */}
          {pickupLat && pickupLon && (
            <Marker
              position={{ lat: pickupLat, lng: pickupLon }}
              icon={{
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                fillColor: '#22c55e',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: 1.5,
              }}
              label={{
                text: 'P',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 'bold',
              }}
            />
          )}

          {/* Dropoff Marker */}
          {dropoffLat && dropoffLon && (
            <Marker
              position={{ lat: dropoffLat, lng: dropoffLon }}
              icon={{
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                fillColor: '#ef4444',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: 1.5,
              }}
              label={{
                text: 'D',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 'bold',
              }}
            />
          )}

          {/* Driver Marker */}
          {driverLocation && (
            <Marker
              position={{ lat: driverLocation.lat, lng: driverLocation.lng }}
              icon={{
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                fillColor: '#facc15',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: 2,
              }}
              label={{
                text: '🚗',
                color: '#facc15',
                fontSize: '16px',
              }}
            />
          )}

          {/* Route Polyline */}
          {routePoints && routePoints.length > 0 && (
            <Polyline
              path={routePoints}
              options={{
                strokeColor: '#facc15',
                strokeWeight: 4,
                strokeOpacity: 0.8,
                strokeStyle: 'solid',
                icons: [
                  {
                    icon: {
                      path: window.google?.maps?.SymbolPath?.FORWARD_CLOSED_ARROW || 0,
                      scale: 3,
                      strokeColor: '#facc15',
                    },
                    offset: '100%',
                    repeat: '40px',
                  }
                ]
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default RideMap;