// src/Pages/CustomerProfile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { User, Mail, Phone, Edit2, Save, X, Camera, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CustomerProfile() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ 
    name: '', 
    email: '', 
    mobile: '',
    createdAt: ''
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/user/profile');
      if (response.data.success) {
        setProfile(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    try {
      const response = await api.put('/api/user/profile', {
        name: profile.name,
        email: profile.email,
        mobile: profile.mobile
      });
      if (response.data.success) {
        await login(response.data.user, response.data.token);
        toast.success('✅ Profile updated successfully');
        setEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-yellow-400 text-gray-950 font-bold rounded-xl hover:bg-yellow-300 transition-all flex items-center gap-2"
            >
              <Edit2 size={16} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(false);
                  fetchProfile();
                }}
                className="px-4 py-2 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-yellow-400 text-gray-950 font-bold rounded-xl hover:bg-yellow-300 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={16} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-yellow-400/10 border-2 border-yellow-400/30 flex items-center justify-center text-3xl font-bold text-yellow-400">
              {profile.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{profile.name || 'User'}</h2>
              <p className="text-gray-400">{profile.email}</p>
              <p className="text-gray-500 text-sm mt-1">
                Member since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-1">
                Full Name <span className="text-yellow-400">*</span>
              </label>
              {editing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-yellow-400/50 transition-all"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-white text-lg">{profile.name || '—'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 block mb-1">
                Email Address <span className="text-yellow-400">*</span>
              </label>
              {editing ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-yellow-400/50 transition-all"
                  placeholder="you@email.com"
                />
              ) : (
                <p className="text-white">{profile.email || '—'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 block mb-1">
                Phone Number
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={profile.mobile}
                  onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-yellow-400/50 transition-all"
                  placeholder="9876543210"
                />
              ) : (
                <p className="text-white">{profile.mobile || '—'}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="py-3 rounded-xl border border-gray-700 text-gray-400 hover:bg-gray-800 transition-all font-medium"
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}