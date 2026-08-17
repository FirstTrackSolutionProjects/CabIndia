// src/Pages/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Car, Calendar, MapPin, User, ArrowRight } from 'lucide-react';

export default function UserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await api.get('/api/rides/history/user');
        setRides(response.data.rides || []);
      } catch (error) {
        console.error('Error fetching rides:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  if (authLoading || loading) {
    return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-6">My Dashboard</h1>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-2xl">
              <User className="text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Welcome back,</p>
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Rides</h2>
          <Link to="/book" className="text-yellow-400 text-sm font-semibold flex items-center gap-1 hover:text-yellow-300">
            Book New Ride <ArrowRight size={14} />
          </Link>
        </div>

        <div className="space-y-4">
          {rides.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <Car className="mx-auto text-gray-600" size={48} />
              <p className="text-gray-500 mt-4">You haven't taken any rides yet.</p>
              <Link to="/" className="inline-block mt-4 bg-yellow-400 text-gray-950 font-bold px-6 py-2 rounded-xl hover:bg-yellow-300 transition-all">
                Book Your First Ride
              </Link>
            </div>
          ) : (
            rides.slice(0, 5).map((ride) => (
              <div key={ride.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-yellow-400/30 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar size={14} />
                      {new Date(ride.requested_at).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin size={16} className="text-green-400 flex-shrink-0" />
                      <span className="text-sm">{ride.pickup_address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-red-400 flex-shrink-0" />
                      <span className="text-sm">{ride.dropoff_address}</span>
                    </div>
                    {ride.driver_name && (
                      <div className="flex items-center gap-2 mt-1 text-gray-500 text-xs">
                        <User size={12} />
                        <span>Captain: {ride.driver_name}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="text-yellow-400 font-bold">₹{ride.final_price || ride.estimated_price || '0'}</div>
                    <span className={`text-xs px-2 py-1 rounded-full inline-block ${
                      ride.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      ride.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                      ride.status === 'started' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {ride.status || 'pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
          {rides.length > 5 && (
            <div className="text-center">
              <Link to="/rides" className="text-gray-400 text-sm hover:text-yellow-400 transition-colors">
                View all {rides.length} rides →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}