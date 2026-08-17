// src/Pages/Captain/CaptainMap.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MapPin, Navigation, Play, Check, X, Phone, MessageCircle, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

export default function CaptainMap() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rideId } = location.state || {};

  const [rideDetails, setRideDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rideStatus, setRideStatus] = useState('accepted');
  const [customerLocation, setCustomerLocation] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const socketRef = useRef(null);
  const locationInterval = useRef(null);

  useEffect(() => {
    if (!rideId) {
      toast.error('No ride found.');
      navigate('/captain/dashboard');
      return;
    }

    fetchRideDetails();

    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Captain socket connected for ride:', rideId);
      socket.emit('join_ride', rideId);
      socket.emit('join_drivers');
    });

    socket.on(`location_${rideId}`, (data) => {
      console.log('Location update:', data);
    });

    socket.on('ride_status_update', (data) => {
      console.log('Ride status update:', data);
      setRideStatus(data.status);
    });

    startLocationUpdates();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
      }
    };
  }, [rideId]);

  const fetchRideDetails = async () => {
    try {
      const response = await api.get(`/api/rides/${rideId}`);
      if (response.data.success) {
        setRideDetails(response.data.ride);
        setRideStatus(response.data.ride.status);
      }
    } catch (error) {
      console.error('Error fetching ride:', error);
      toast.error('Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const startLocationUpdates = () => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
    }

    locationInterval.current = setInterval(() => {
      if (navigator.geolocation && socketRef.current) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            socketRef.current.emit('update_location', {
              rideId: rideId,
              driverId: user?.id,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              eta: 5,
            });
          },
          (error) => {
            console.error('Location error:', error);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    }, 5000);
  };

  const handleStartRide = async () => {
    setIsStarting(true);
    try {
      const response = await api.post(`/api/rides/${rideId}/start`);
      if (response.data.success) {
        setRideStatus('started');
        toast.success('✅ Ride started!');
      }
    } catch (error) {
      console.error('Start ride error:', error);
      toast.error('Failed to start ride');
    } finally {
      setIsStarting(false);
    }
  };

  const handleCompleteRide = async () => {
    setIsCompleting(true);
    try {
      const distanceKm = 5.0;
      const finalPrice = rideDetails?.estimated_price || '100';
      
      const response = await api.post(`/api/rides/${rideId}/complete`, {
        finalPrice: finalPrice.toString().split('-')[0].trim(),
        distanceKm: distanceKm,
      });
      
      if (response.data.success) {
        setRideStatus('completed');
        toast.success('✅ Ride completed!');
        setTimeout(() => navigate('/captain/dashboard'), 2000);
      }
    } catch (error) {
      console.error('Complete ride error:', error);
      toast.error('Failed to complete ride');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCancelRide = async () => {
    if (!window.confirm('Are you sure you want to cancel this ride?')) return;
    try {
      await api.post(`/api/rides/${rideId}/cancel`, {
        cancellationReason: 'Cancelled by captain',
      });
      toast.info('Ride cancelled');
      navigate('/captain/dashboard');
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel ride');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-yellow-400" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/captain/dashboard')}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold">Active Ride</h1>
          <span className={`text-sm font-semibold ${
            rideStatus === 'accepted' ? 'text-yellow-400' :
            rideStatus === 'started' ? 'text-blue-400' :
            rideStatus === 'completed' ? 'text-green-400' : 'text-gray-400'
          }`}>
            {rideStatus.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Map placeholder */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <MapPin className="mx-auto text-yellow-400" size={48} />
          <p className="text-gray-400 mt-2">Map view will be displayed here</p>
          <p className="text-sm text-gray-500">Real-time GPS tracking is active</p>
        </div>

        {/* Ride Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Ride Details</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="text-green-400 flex-shrink-0 mt-1" size={16} />
              <div>
                <p className="text-sm text-gray-400">Pickup</p>
                <p className="font-medium">{rideDetails?.pickup_address || 'Loading...'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="text-red-400 flex-shrink-0 mt-1" size={16} />
              <div>
                <p className="text-sm text-gray-400">Drop-off</p>
                <p className="font-medium">{rideDetails?.dropoff_address || 'Loading...'}</p>
              </div>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-800">
              <span className="text-gray-400">Fare</span>
              <span className="text-yellow-400 font-bold">
                {rideDetails?.estimated_price || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {rideStatus === 'accepted' && (
            <button
              onClick={handleStartRide}
              disabled={isStarting}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isStarting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Play size={20} /> Start Ride
                </>
              )}
            </button>
          )}

          {rideStatus === 'started' && (
            <button
              onClick={handleCompleteRide}
              disabled={isCompleting}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCompleting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Check size={20} /> Complete Ride
                </>
              )}
            </button>
          )}

          {rideStatus === 'completed' && (
            <button
              onClick={() => navigate('/captain/dashboard')}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-all"
            >
              Go to Dashboard
            </button>
          )}

          {rideStatus !== 'completed' && rideStatus !== 'cancelled' && (
            <button
              onClick={handleCancelRide}
              className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/10 transition-all"
            >
              Cancel Ride
            </button>
          )}
        </div>
      </div>
    </div>
  );
}