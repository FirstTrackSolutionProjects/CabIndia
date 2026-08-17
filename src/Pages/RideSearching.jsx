// src/Pages/RideSearching.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Loader2, MapPin, Car, X } from 'lucide-react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

const RideSearching = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    rideId, ride, icon, source, destination, estimatedFare,
    pickupLat, pickupLon, dropoffLat, dropoffLon
  } = location.state || {};

  const [progress, setProgress] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [status, setStatus] = useState('searching');
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    if (!rideId) {
      toast.error('No ride found. Please try again.');
      navigate('/');
      return;
    }

    // Connect to Socket.IO
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected for ride:', rideId);
      socket.emit('join_ride', rideId);
    });

    socket.on('ride_status_update', (data) => {
      console.log('Ride status update:', data);
      if (data.status === 'failed') {
        setStatus('failed');
        toast.error(data.message || 'No drivers available. Please try again.');
        setTimeout(() => navigate('/'), 3000);
        return;
      }
    });

    socket.on('driver_assigned', (data) => {
      console.log('Driver assigned:', data);
      setStatus('confirmed');
      toast.success('🎉 Captain assigned!');
      
      // Stop progress animation
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
      setProgress(100);

      // Navigate to ride confirmed
      setTimeout(() => {
        navigate('/ride-confirmed', {
          state: {
            rideId: rideId,
            driver: {
              name: data.driverName || 'Captain',
              phone: data.driverPhone || 'N/A',
              vehicle: data.vehicleNumber || 'OD02AY9553',
              rating: data.driverRating || 4.8,
              eta: 5,
            },
            source,
            destination,
            estimatedFare,
            pickupLat,
            pickupLon,
            dropoffLat,
            dropoffLon,
          }
        });
      }, 1500);
    });

    socket.on('ride_cancelled', (data) => {
      console.log('Ride cancelled:', data);
      toast.error('Ride cancelled. Please try again.');
      setTimeout(() => navigate('/'), 2000);
    });

    // Search timer
    timerRef.current = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);

    // Progress animation
    progressRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          return prev + 0.5;
        }
        return prev + 2;
      });
    }, 200);

    // Auto-navigate if no driver found after 30 seconds
    const timeout = setTimeout(() => {
      if (status === 'searching') {
        toast.warning('Still searching for a captain...');
      }
    }, 30000);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
      clearTimeout(timeout);
    };
  }, [rideId]);

  const handleCancel = async () => {
    setShowPopup(false);
    try {
      if (socketRef.current && rideId) {
        socketRef.current.emit('cancel_ride', { rideId });
      }
      toast.info('Ride cancelled');
      navigate('/');
    } catch (error) {
      console.error('Cancel error:', error);
      navigate('/');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center text-center px-4 relative">
      <div className="text-6xl mb-4">{icon || '🚗'}</div>
      
      {status === 'searching' ? (
        <>
          <h2 className="text-gray-400 mb-1">Looking for your</h2>
          <h1 className="text-3xl font-bold">{ride} ride</h1>
          <p className="text-gray-500 text-sm mt-2">Searching for nearby captains...</p>

          <div className="w-full max-w-md mt-6">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Searching</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          <p className="text-gray-500 text-sm mt-4">
            Searching for {formatTime(searchTime)}
          </p>

          <div className="mt-8 flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span>Finding the best captain for you</span>
          </div>
        </>
      ) : status === 'failed' ? (
        <>
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-8 max-w-md">
            <X className="text-red-400 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-bold text-red-400">No Captains Available</h2>
            <p className="text-gray-400 mt-2">Please try again in a few moments.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-yellow-400 text-gray-950 font-bold px-6 py-2 rounded-xl hover:bg-yellow-300 transition-all"
            >
              Go Home
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-8 max-w-md">
            <Loader2 className="text-green-400 mx-auto mb-4 animate-spin" size={48} />
            <h2 className="text-xl font-bold text-green-400">Captain Assigned!</h2>
            <p className="text-gray-400 mt-2">Your captain is on the way.</p>
          </div>
        </>
      )}

      {/* Cancel Button */}
      {status === 'searching' && (
        <button
          onClick={() => setShowPopup(true)}
          className="mt-10 text-red-400 border border-red-500/30 px-6 py-2 rounded-full hover:bg-red-500/10 transition-all"
        >
          Cancel Ride
        </button>
      )}

      {/* Cancel Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-gray-800">
            <div className="text-center">
              <X className="mx-auto text-red-400 mb-4" size={48} />
              <p className="text-lg font-bold mb-2">Cancel Ride?</p>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to cancel this ride? Cancellation fees may apply.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPopup(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 hover:bg-gray-800 transition-all"
                >
                  No, Keep It
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Info */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4 text-sm">
          <div className="flex-1 truncate">
            <span className="text-green-400">📍</span> {source}
          </div>
          <div className="text-gray-500">→</div>
          <div className="flex-1 truncate">
            <span className="text-red-400">📍</span> {destination}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideSearching;