// src/Pages/RideConfirmed.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Phone, MessageCircle, Navigation, MapPin, Star, Car, Clock, AlertCircle, X } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../services/api';
import RideMap from '../Components/RideMap';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

const RideConfirmed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { rideId, driver, source, destination, estimatedFare, pickupLat, pickupLon, dropoffLat, dropoffLon } = location.state || {};

  const [rideStatus, setRideStatus] = useState('accepted');
  const [driverLocation, setDriverLocation] = useState(null);
  const [eta, setEta] = useState(driver?.eta || 5);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [routePoints, setRoutePoints] = useState([]);
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  // Fetch route points
  useEffect(() => {
    if (pickupLat && pickupLon && dropoffLat && dropoffLon) {
      const fetchRoute = async () => {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${pickupLat},${pickupLon}&destination=${dropoffLat},${dropoffLon}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const points = await decodePolyline(data.routes[0].overview_polyline.points);
            setRoutePoints(points);
          }
        } catch (error) {
          console.error('Error fetching route:', error);
        }
      };
      fetchRoute();
    }
  }, [pickupLat, pickupLon, dropoffLat, dropoffLon]);

  // Helper function to decode polyline
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
        lat: lat / 1e5,
        lng: lng / 1e5,
      });
    }
    return points;
  };

  // Socket.IO setup
  useEffect(() => {
    if (!rideId) {
      toast.error('No ride found.');
      navigate('/');
      return;
    }

    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected for ride:', rideId);
      socket.emit('join_ride', rideId);
    });

    socket.on(`location_${rideId}`, (data) => {
      console.log('Driver location update:', data);
      setDriverLocation({
        lat: data.latitude,
        lng: data.longitude,
      });
      if (data.eta) {
        setEta(data.eta);
      }
    });

    socket.on('ride_status_update', (data) => {
      console.log('Ride status update:', data);
      setRideStatus(data.status);
      
      if (data.status === 'started') {
        toast.info('🚗 Ride has started!');
      } else if (data.status === 'completed') {
        toast.success('✅ Ride completed! Thank you for choosing CabIndia!');
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    });

    socket.on('ride_cancelled', (data) => {
      toast.error('Ride cancelled by captain.');
      setTimeout(() => navigate('/'), 2000);
    });

    // ETA timer
    timerRef.current = setInterval(() => {
      setEta(prev => {
        if (prev > 0 && rideStatus === 'accepted') {
          return prev - 0.5;
        }
        return prev;
      });
    }, 30000);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [rideId, navigate]);

  const handleCancelRide = async () => {
    setCancelling(true);
    try {
      await api.post(`/api/rides/${rideId}/cancel`, {
        cancellationReason: 'Cancelled by user',
      });
      toast.info('Ride cancelled successfully');
      navigate('/');
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel ride. Please try again.');
    } finally {
      setCancelling(false);
      setShowCancelPopup(false);
    }
  };

  const handleCallDriver = () => {
    if (driver?.phone) {
      window.location.href = `tel:${driver.phone}`;
    } else {
      toast.info('Driver phone number not available.');
    }
  };

  const handleChatDriver = () => {
    navigate('/chat', {
      state: {
        driverId: driver?.id,
        driverName: driver?.name,
        rideId: rideId,
      }
    });
  };

  const handleOpenMaps = () => {
    if (pickupLat && pickupLon) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${pickupLat},${pickupLon}`, '_blank');
    } else {
      toast.info('Pickup location not available.');
    }
  };

  if (!rideId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Your Ride</h1>
          <span className={`text-sm font-semibold ${
            rideStatus === 'accepted' ? 'text-yellow-400' :
            rideStatus === 'started' ? 'text-blue-400' :
            rideStatus === 'completed' ? 'text-green-400' : 'text-gray-400'
          }`}>
            {rideStatus === 'accepted' ? 'Captain is coming' :
             rideStatus === 'started' ? 'Ride in progress' :
             rideStatus === 'completed' ? 'Ride completed' : 'Unknown status'}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Map Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <RideMap
            pickupLat={pickupLat}
            pickupLon={pickupLon}
            dropoffLat={dropoffLat}
            dropoffLon={dropoffLon}
            driverLocation={driverLocation}
            routePoints={routePoints}
            height="h-64 md:h-80"
          />
        </div>

        {/* Driver Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center text-2xl font-bold text-yellow-400">
              {driver?.name?.charAt(0) || 'C'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{driver?.name || 'Captain'}</h2>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Star className="text-yellow-400" size={14} />
                  {driver?.rating || 4.8}
                </span>
                <span className="flex items-center gap-1">
                  <Car size={14} />
                  {driver?.vehicle || 'Vehicle'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">
                {Math.round(eta)} min
              </div>
              <div className="text-xs text-gray-500">ETA</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              onClick={handleCallDriver}
              className="flex flex-col items-center gap-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all"
            >
              <Phone size={20} className="text-green-400" />
              <span className="text-xs">Call</span>
            </button>
            <button
              onClick={handleChatDriver}
              className="flex flex-col items-center gap-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all"
            >
              <MessageCircle size={20} className="text-yellow-400" />
              <span className="text-xs">Chat</span>
            </button>
            <button
              onClick={handleOpenMaps}
              className="flex flex-col items-center gap-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all"
            >
              <Navigation size={20} className="text-blue-400" />
              <span className="text-xs">Navigate</span>
            </button>
          </div>
        </div>

        {/* Trip Details */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Trip Details</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="w-0.5 h-8 bg-gray-700" />
                <div className="w-3 h-3 rounded-full bg-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">Pickup</p>
                <p className="font-medium">{source}</p>
                <p className="text-sm text-gray-400 mt-3">Drop-off</p>
                <p className="font-medium">{destination}</p>
              </div>
            </div>
          </div>

          {estimatedFare && (
            <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between">
              <span className="text-gray-400">Estimated Fare</span>
              <span className="text-yellow-400 font-bold">{estimatedFare}</span>
            </div>
          )}
        </div>

        {/* Status Timeline */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Ride Status</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${rideStatus === 'accepted' || rideStatus === 'started' || rideStatus === 'completed' ? 'bg-yellow-400' : 'bg-gray-700'}`} />
              <div>
                <p className="font-medium">Captain Assigned</p>
                <p className="text-sm text-gray-400">A captain is on the way</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${rideStatus === 'started' || rideStatus === 'completed' ? 'bg-yellow-400' : 'bg-gray-700'}`} />
              <div>
                <p className="font-medium">Ride Started</p>
                <p className="text-sm text-gray-400">Your ride has begun</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${rideStatus === 'completed' ? 'bg-yellow-400' : 'bg-gray-700'}`} />
              <div>
                <p className="font-medium">Ride Completed</p>
                <p className="text-sm text-gray-400">Arrived at destination</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        {rideStatus !== 'completed' && rideStatus !== 'cancelled' && (
          <button
            onClick={() => setShowCancelPopup(true)}
            className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/10 transition-all"
          >
            Cancel Ride
          </button>
        )}
      </div>

      {/* Cancel Popup */}
      {showCancelPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-gray-800">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-400" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Cancel Ride?</h3>
              <p className="text-gray-400 text-sm mb-6">
                Cancellation fees may apply. Are you sure you want to cancel this ride?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelPopup(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 hover:bg-gray-800 transition-all"
                >
                  Keep Ride
                </button>
                <button
                  onClick={handleCancelRide}
                  disabled={cancelling}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideConfirmed;