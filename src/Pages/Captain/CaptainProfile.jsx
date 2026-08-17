// src/Pages/Captain/CaptainProfile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { User, Mail, Phone, Car, Shield, Edit2, Save, X, Camera } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CaptainProfile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    mobile: '',
    vehicleType: '',
    vehicleModel: '',
    licensePlate: '',
  });
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchVehicleDetails();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/user/profile');
      if (response.data.success) {
        setProfile(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchVehicleDetails = async () => {
    try {
      const response = await api.get('/api/drivers/vehicle');
      if (response.data.success) {
        setVehicleDetails(response.data.vehicle);
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await api.put('/api/user/profile', {
        name: profile.name,
        email: profile.email,
        mobile: profile.mobile,
      });
      if (response.data.success) {
        toast.success('Profile updated successfully');
        setEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
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
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Profile</h1>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 rounded-xl bg-yellow-400 text-gray-950 font-bold hover:bg-yellow-300 transition-all flex items-center gap-2"
            >
              <Edit2 size={16} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-yellow-400 text-gray-950 font-bold hover:bg-yellow-300 transition-all flex items-center gap-2"
              >
                <Save size={16} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-3xl font-bold text-yellow-400">
              {profile.name?.charAt(0) || 'C'}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-gray-400">{profile.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 block mb-1">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-yellow-400/50"
                />
              ) : (
                <p className="text-white">{profile.name}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-500 block mb-1">Email</label>
              {editing ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-yellow-400/50"
                />
              ) : (
                <p className="text-white">{profile.email}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-500 block mb-1">Phone</label>
              {editing ? (
                <input
                  type="text"
                  value={profile.mobile}
                  onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white outline-none focus:border-yellow-400/50"
                />
              ) : (
                <p className="text-white">{profile.mobile || '—'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Car className="text-yellow-400" size={20} />
            Vehicle Details
          </h3>

          {vehicleDetails ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span>{vehicleDetails.vehicleType || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Model</span>
                <span>{vehicleDetails.vehicleModel || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">License Plate</span>
                <span className="font-mono">{vehicleDetails.licensePlate || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Color</span>
                <span>{vehicleDetails.vehicleColor || '—'}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No vehicle details added yet</p>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold hover:bg-red-500/20 transition-all"
        >
          Logout
        </button>
      </div>
    </div>
  );
}