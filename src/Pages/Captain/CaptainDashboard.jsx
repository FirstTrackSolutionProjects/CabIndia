// src/Pages/Captain/CaptainDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Car, DollarSign, Calendar, Star, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-yellow-400/30 transition-all">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-xs">{title}</p>
        <p className="text-xl font-bold text-white">{value}</p>
        {subtitle && <p className="text-gray-600 text-xs mt-1">{subtitle}</p>}
      </div>
      <div className={`p-2 rounded-xl ${color}`}>
        <Icon className="text-white" size={20} />
      </div>
    </div>
  </div>
);

export default function CaptainDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayRides: 0,
    todayEarnings: 0,
    totalRides: 0,
    rating: 0,
    status: 'offline',
    isAvailable: false,
  });
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/drivers/stats');
      if (response.data.success) {
        setStats(response.data.data);
        setIsOnline(response.data.data.isAvailable || false);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline;
      const response = await api.post('/api/drivers/status', { online: newStatus });
      if (response.data.success) {
        setIsOnline(newStatus);
        setStats(prev => ({ ...prev, isAvailable: newStatus, status: newStatus ? 'online' : 'offline' }));
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
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
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Captain Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, {user?.name}</p>
          </div>
          <button
            onClick={toggleOnlineStatus}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              isOnline ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white' : 'bg-white'}`} />
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Today's Rides" 
            value={stats.todayRides} 
            icon={Car} 
            color="bg-blue-500/20" 
          />
          <StatCard 
            title="Today's Earnings" 
            value={`₹${stats.todayEarnings}`} 
            icon={DollarSign} 
            color="bg-green-500/20" 
          />
          <StatCard 
            title="Total Rides" 
            value={stats.totalRides} 
            icon={Calendar} 
            color="bg-purple-500/20" 
          />
          <StatCard 
            title="Rating" 
            value={`${stats.rating}★`} 
            icon={Star} 
            color="bg-yellow-500/20" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/captain/requests" className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-yellow-400/30 transition-all text-center">
            <Car className="mx-auto text-yellow-400" size={32} />
            <h3 className="text-lg font-bold mt-2">Ride Requests</h3>
            <p className="text-gray-500 text-sm">View and accept new rides</p>
          </Link>
          <Link to="/captain/history" className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-yellow-400/30 transition-all text-center">
            <Clock className="mx-auto text-yellow-400" size={32} />
            <h3 className="text-lg font-bold mt-2">Ride History</h3>
            <p className="text-gray-500 text-sm">View your completed rides</p>
          </Link>
          <Link to="/captain/profile" className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-yellow-400/30 transition-all text-center">
            <User className="mx-auto text-yellow-400" size={32} />
            <h3 className="text-lg font-bold mt-2">Profile</h3>
            <p className="text-gray-500 text-sm">Manage your account</p>
          </Link>
        </div>

        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <p className="text-sm text-gray-500">
            Status: <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}