// src/Pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, Car, DollarSign, Ticket, CheckCircle, Clock, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StatsCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-yellow-400/30 transition-all">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtitle && <p className="text-gray-600 text-xs mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    drivers: 0,
    rides: 0,
    revenue: 0,
    pendingCaptains: 0,
    openTickets: 0,
    completedRides: 0,
    pendingRides: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentRides, setRecentRides] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentRides();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentRides = async () => {
    try {
      const response = await api.get('/api/admin/rides?limit=5');
      setRecentRides(response.data.rides || []);
    } catch (error) {
      console.error('Error fetching recent rides:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, {user?.name || 'Admin'}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/captains" className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-yellow-400/20 transition-all">
              Verify Captains
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Total Users" 
            value={stats.users} 
            icon={Users} 
            color="bg-blue-500/20" 
          />
          <StatsCard 
            title="Total Captains" 
            value={stats.drivers} 
            icon={Car} 
            color="bg-green-500/20"
            subtitle={`${stats.pendingCaptains} pending verification`}
          />
          <StatsCard 
            title="Total Rides" 
            value={stats.rides} 
            icon={Ticket} 
            color="bg-purple-500/20"
            subtitle={`${stats.completedRides} completed`}
          />
          <StatsCard 
            title="Revenue" 
            value={`₹${stats.revenue || 0}`} 
            icon={DollarSign} 
            color="bg-yellow-500/20" 
          />
          <StatsCard 
            title="Pending Captains" 
            value={stats.pendingCaptains} 
            icon={Clock} 
            color="bg-orange-500/20" 
          />
          <StatsCard 
            title="Open Tickets" 
            value={stats.openTickets} 
            icon={AlertCircle} 
            color="bg-red-500/20" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/admin/users" className="bg-gray-800 hover:bg-gray-750 rounded-xl p-4 text-center transition-all hover:border-yellow-400/30 border border-gray-700">
                <Users className="mx-auto text-yellow-400" size={24} />
                <span className="text-sm mt-2 block">Manage Users</span>
              </Link>
              <Link to="/admin/captains" className="bg-gray-800 hover:bg-gray-750 rounded-xl p-4 text-center transition-all hover:border-yellow-400/30 border border-gray-700">
                <UserCheck className="mx-auto text-yellow-400" size={24} />
                <span className="text-sm mt-2 block">Verify Captains</span>
              </Link>
              <Link to="/admin/rides" className="bg-gray-800 hover:bg-gray-750 rounded-xl p-4 text-center transition-all hover:border-yellow-400/30 border border-gray-700">
                <Car className="mx-auto text-yellow-400" size={24} />
                <span className="text-sm mt-2 block">View Rides</span>
              </Link>
              <Link to="/admin/support" className="bg-gray-800 hover:bg-gray-750 rounded-xl p-4 text-center transition-all hover:border-yellow-400/30 border border-gray-700">
                <Ticket className="mx-auto text-yellow-400" size={24} />
                <span className="text-sm mt-2 block">Support Tickets</span>
              </Link>
            </div>
          </div>

          {/* Recent Rides */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Recent Rides</h3>
              <Link to="/admin/rides" className="text-yellow-400 text-sm hover:text-yellow-300">View All →</Link>
            </div>
            <div className="space-y-3">
              {recentRides.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent rides</p>
              ) : (
                recentRides.map((ride) => (
                  <div key={ride.id} className="flex justify-between items-center bg-gray-800/50 rounded-xl p-3">
                    <div>
                      <p className="text-sm font-medium">{ride.user_name || 'User'}</p>
                      <p className="text-xs text-gray-500">{ride.pickup_address} → {ride.dropoff_address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold">₹{ride.final_price || ride.estimated_price}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        ride.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        ride.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {ride.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}