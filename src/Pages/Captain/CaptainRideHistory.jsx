// src/Pages/Captain/CaptainRideHistory.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, MapPin, DollarSign, User, Clock, Search } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CaptainRideHistory() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const response = await api.get('/api/drivers/rides');
      setRides(response.data.rides || []);
    } catch (error) {
      console.error('Error fetching rides:', error);
      toast.error('Failed to load ride history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'completed': 'bg-green-500/20 text-green-400',
      'pending': 'bg-yellow-500/20 text-yellow-400',
      'accepted': 'bg-blue-500/20 text-blue-400',
      'started': 'bg-purple-500/20 text-purple-400',
      'cancelled': 'bg-red-500/20 text-red-400',
    };
    return styles[status] || 'bg-gray-500/20 text-gray-400';
  };

  const filteredRides = rides.filter(ride =>
    (ride.pickup_address?.toLowerCase().includes(search.toLowerCase()) ||
     ride.dropoff_address?.toLowerCase().includes(search.toLowerCase()) ||
     ride.customer_name?.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'all' || ride.status === filter)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Ride History</h1>
            <p className="text-gray-500 text-sm">{filteredRides.length} rides found</p>
          </div>
          <div className="flex gap-2">
            {['all', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === status ? 'bg-yellow-400 text-gray-950' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by location or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 outline-none focus:border-yellow-400/50 transition-all"
          />
        </div>

        {/* Rides List */}
        <div className="space-y-4">
          {filteredRides.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
              <Calendar className="mx-auto text-gray-600" size={48} />
              <p className="text-gray-500 mt-4">No rides found</p>
            </div>
          ) : (
            filteredRides.map((ride) => (
              <div key={ride.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-yellow-400/30 transition-all">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(ride.requested_at).toLocaleString()}
                      </span>
                      {ride.customer_name && (
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {ride.customer_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-start gap-2 mb-1">
                      <MapPin size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{ride.pickup_address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{ride.dropoff_address}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-yellow-400 font-bold text-xl">₹{ride.final_price || ride.estimated_price || '0'}</div>
                    <span className={`text-xs px-2 py-1 rounded-full inline-block ${getStatusBadge(ride.status)}`}>
                      {ride.status}
                    </span>
                    {ride.distance_km && (
                      <p className="text-xs text-gray-500 mt-1">{ride.distance_km} km</p>
                    )}
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