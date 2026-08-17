// src/Pages/Captain/CaptainRideRequests.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { MapPin, DollarSign, Car, Clock, Check, X, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

export default function CaptainRideRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to socket
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('join_drivers');
    });

    socket.on('new_ride_request', (data) => {
      console.log('New ride request:', data);
      setRequests(prev => [{
        id: data.rideId || Date.now(),
        pickup_address: data.pickupAddress,
        dropoff_address: data.dropoffAddress,
        estimated_price: data.estimatedPrice,
        vehicle_type: data.vehicleType,
        pickup_lat: data.pickupLat,
        pickup_lon: data.pickupLon,
        ...data
      }, ...prev]);
      toast.info('New ride request available!');
    });

    socket.on('ride_taken', (data) => {
      setRequests(prev => prev.filter(r => r.id !== data.rideId));
    });

    fetchRequests();

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/api/drivers/requests');
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptRide = async (rideId) => {
    try {
      const response = await api.post(`/api/rides/${rideId}/accept`);
      if (response.data.success) {
        toast.success('Ride accepted successfully!');
        navigate('/captain/map', { state: { rideId } });
      }
    } catch (error) {
      console.error('Error accepting ride:', error);
      toast.error('Failed to accept ride');
    }
  };

  const declineRide = (rideId) => {
    setRequests(prev => prev.filter(r => r.id !== rideId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Ride Requests</h1>
            <p className="text-gray-500 text-sm">{requests.length} pending requests</p>
          </div>
          <button
            onClick={fetchRequests}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
              <Car className="mx-auto text-gray-600" size={48} />
              <p className="text-gray-500 mt-4">No ride requests at the moment</p>
              <p className="text-gray-600 text-sm">Stay online to receive requests</p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-yellow-400/30 transition-all">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <Clock size={14} />
                      {new Date(request.created_at || Date.now()).toLocaleString()}
                    </div>
                    <div className="flex items-start gap-2 mb-1">
                      <MapPin size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{request.pickup_address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{request.dropoff_address}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-yellow-400 font-bold">₹{request.estimated_price}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                        {request.vehicle_type || 'Cab'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => declineRide(request.id)}
                      className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-1"
                    >
                      <X size={16} /> Decline
                    </button>
                    <button
                      onClick={() => acceptRide(request.id)}
                      className="px-6 py-2 rounded-xl bg-yellow-400 text-gray-950 font-bold hover:bg-yellow-300 transition-all flex items-center gap-1"
                    >
                      <Check size={16} /> Accept
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}