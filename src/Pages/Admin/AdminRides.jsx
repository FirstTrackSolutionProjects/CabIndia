// src/Pages/Admin/AdminRides.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Filter, Calendar, MapPin, User, Car, Eye, X } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedRide, setSelectedRide] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const response = await api.get('/api/admin/rides');
      setRides(response.data.rides);
    } catch (error) {
      console.error('Error fetching rides:', error);
      toast.error('Failed to load rides');
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
    (ride.user_name?.toLowerCase().includes(search.toLowerCase()) ||
     ride.pickup_address?.toLowerCase().includes(search.toLowerCase()) ||
     ride.dropoff_address?.toLowerCase().includes(search.toLowerCase()) ||
     ride.id?.toString().includes(search)) &&
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
            <h1 className="text-3xl font-bold">Ride Management</h1>
            <p className="text-gray-500 text-sm">{filteredRides.length} rides found</p>
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'accepted', 'started', 'completed', 'cancelled'].map((status) => (
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
            placeholder="Search by user, location, or ride ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 outline-none focus:border-yellow-400/50 transition-all"
          />
        </div>

        {/* Rides Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr>
                  <th className="text-left p-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Ride ID</th>
                  <th className="text-left p-4 text-gray-500 text-xs font-bold uppercase tracking-wider">User</th>
                  <th className="text-left p-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Route</th>
                  <th className="text-left p-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Fare</th>
                  <th className="text-left p-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Date</th>
                  <th className="text-left p-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredRides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 text-sm font-mono">#{ride.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 text-xs font-bold">
                          {ride.user_name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm">{ride.user_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm max-w-xs">
                        <p className="truncate">{ride.pickup_address}</p>
                        <p className="text-gray-500 text-xs">→ {ride.dropoff_address}</p>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-yellow-400">₹{ride.final_price || ride.estimated_price || '0'}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(ride.status)}`}>
                        {ride.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(ride.requested_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setSelectedRide(ride);
                          setShowDetailModal(true);
                        }}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedRide && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Ride Details #{selectedRide.id}</h2>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">User</p>
                    <p className="mt-1 font-semibold">{selectedRide.user_name || 'Unknown'}</p>
                    <p className="text-sm text-gray-400">{selectedRide.user_email}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                    <p className={`mt-1 font-semibold ${getStatusBadge(selectedRide.status)}`}>
                      {selectedRide.status}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Route</p>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{selectedRide.pickup_address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{selectedRide.dropoff_address}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Fare</p>
                    <p className="mt-1 text-lg font-bold text-yellow-400">₹{selectedRide.final_price || selectedRide.estimated_price}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Vehicle</p>
                    <p className="mt-1">{selectedRide.vehicle_model || '—'}</p>
                    <p className="text-sm text-gray-400">{selectedRide.vehicle_type || '—'}</p>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Timeline</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="text-gray-500">Requested:</span> {new Date(selectedRide.requested_at).toLocaleString()}</p>
                    {selectedRide.accepted_at && <p><span className="text-gray-500">Accepted:</span> {new Date(selectedRide.accepted_at).toLocaleString()}</p>}
                    {selectedRide.started_at && <p><span className="text-gray-500">Started:</span> {new Date(selectedRide.started_at).toLocaleString()}</p>}
                    {selectedRide.completed_at && <p><span className="text-gray-500">Completed:</span> {new Date(selectedRide.completed_at).toLocaleString()}</p>}
                    {selectedRide.cancelled_at && <p><span className="text-gray-500">Cancelled:</span> {new Date(selectedRide.cancelled_at).toLocaleString()}</p>}
                  </div>
                </div>

                {selectedRide.cancellation_reason && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Cancellation Reason</p>
                    <p className="mt-1 text-sm">{selectedRide.cancellation_reason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}