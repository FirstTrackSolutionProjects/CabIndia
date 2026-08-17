// src/Pages/Captain/CaptainEarnings.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DollarSign, Calendar, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CaptainEarnings() {
  const [stats, setStats] = useState({
    todayRides: 0,
    todayEarnings: 0,
    totalRides: 0,
    rating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [weeklyEarnings, setWeeklyEarnings] = useState([]);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await api.get('/api/drivers/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Failed to load earnings');
    } finally {
      setLoading(false);
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Earnings</h1>
            <p className="text-gray-500 text-sm">Your earnings overview</p>
          </div>
          <button
            onClick={fetchEarnings}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-yellow-400/20">
                <DollarSign className="text-yellow-400" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Today's Earnings</p>
                <p className="text-2xl font-bold">₹{stats.todayEarnings}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Calendar className="text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Today's Rides</p>
                <p className="text-2xl font-bold">{stats.todayRides}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500/20">
                <TrendingUp className="text-green-400" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Rides</p>
                <p className="text-2xl font-bold">{stats.totalRides}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Your Rating</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.rating}★</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">Based on {stats.totalRides} rides</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <p className="text-gray-500 text-sm text-center">
            Keep driving to earn more! 🚗
          </p>
        </div>
      </div>
    </div>
  );
}