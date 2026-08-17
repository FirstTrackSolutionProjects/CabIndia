// src/Pages/Admin/AdminCaptains.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Check, X, Eye, User, Car, FileText, Clock, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminCaptains() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/api/admin/drivers');
      setDrivers(response.data.drivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to load captains');
    } finally {
      setLoading(false);
    }
  };

  const verifyDriver = async (driverId, status) => {
    try {
      await api.put(`/api/admin/drivers/${driverId}/verify`, { status });
      toast.success(`Captain ${status === 'verified' ? 'approved' : 'rejected'} successfully`);
      fetchDrivers();
    } catch (error) {
      console.error('Error verifying driver:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'online': 'bg-green-500/20 text-green-400',
      'offline': 'bg-gray-500/20 text-gray-400',
      'on_trip': 'bg-blue-500/20 text-blue-400',
      'pending_verification': 'bg-yellow-500/20 text-yellow-400',
      'verified': 'bg-green-500/20 text-green-400',
      'rejected': 'bg-red-500/20 text-red-400',
    };
    return styles[status] || 'bg-gray-500/20 text-gray-400';
  };

  const filteredDrivers = drivers.filter(driver =>
    (driver.name?.toLowerCase().includes(search.toLowerCase()) ||
     driver.email?.toLowerCase().includes(search.toLowerCase()) ||
     driver.license_plate?.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'all' || driver.status === filter)
  );

  const pendingCount = drivers.filter(d => d.status === 'pending_verification').length;

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
            <h1 className="text-3xl font-bold">Captain Verification</h1>
            <p className="text-gray-500 text-sm">
              {pendingCount} pending verification • {drivers.length} total captains
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === 'all' ? 'bg-yellow-400 text-gray-950' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending_verification')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === 'pending_verification' ? 'bg-yellow-400 text-gray-950' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Pending ({pendingCount})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or vehicle number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 outline-none focus:border-yellow-400/50 transition-all"
          />
        </div>

        {/* Drivers Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr>
                  <th className="text-left p-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Captain</th>
                  <th className="text-left p-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Vehicle</th>
                  <th className="text-left p-4 text-gray-500 text-xs font-bold uppercase tracking-wider">License</th>
                  <th className="text-left p-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Joined</th>
                  <th className="text-left p-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 font-bold">
                          {driver.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-medium">{driver.name}</p>
                          <p className="text-xs text-gray-500">{driver.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Car size={14} className="text-gray-500" />
                        <span>{driver.model || '—'}</span>
                        <span className="text-xs text-gray-500">({driver.license_plate || '—'})</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-400">{driver.license_number || '—'}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(driver.status)}`}>
                        {driver.status?.replace('_', ' ') || 'unknown'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(driver.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedDriver(driver);
                            setShowDetailModal(true);
                          }}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                        >
                          <Eye size={16} />
                        </button>
                        {driver.status === 'pending_verification' && (
                          <>
                            <button
                              onClick={() => verifyDriver(driver.id, 'verified')}
                              className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => verifyDriver(driver.id, 'rejected')}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedDriver && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Captain Details</h2>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-gray-800/50 rounded-xl p-4">
                  <div className="w-16 h-16 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 text-2xl font-bold">
                    {selectedDriver.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <p className="text-lg font-bold">{selectedDriver.name}</p>
                    <p className="text-gray-400">{selectedDriver.email}</p>
                    <p className="text-gray-400 text-sm">{selectedDriver.mobile}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                    <p className={`mt-1 font-semibold ${getStatusBadge(selectedDriver.status)}`}>
                      {selectedDriver.status?.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Joined</p>
                    <p className="mt-1">{new Date(selectedDriver.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Car size={16} className="text-yellow-400" />
                    Vehicle Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="text-gray-500">Model:</span> {selectedDriver.model || '—'}</p>
                    <p><span className="text-gray-500">Type:</span> {selectedDriver.vehicle_type || '—'}</p>
                    <p><span className="text-gray-500">License Plate:</span> {selectedDriver.license_plate || '—'}</p>
                    <p><span className="text-gray-500">License Number:</span> {selectedDriver.license_number || '—'}</p>
                  </div>
                </div>

                {selectedDriver.status === 'pending_verification' && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        verifyDriver(selectedDriver.id, 'verified');
                        setShowDetailModal(false);
                      }}
                      className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Check size={18} /> Approve
                    </button>
                    <button
                      onClick={() => {
                        verifyDriver(selectedDriver.id, 'rejected');
                        setShowDetailModal(false);
                      }}
                      className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                    >
                      <X size={18} /> Reject
                    </button>
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