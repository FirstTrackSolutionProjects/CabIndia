// src/Components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, adminOnly = false, captainOnly = false }) {
  const { user, loading, isAdmin, isCaptain } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  if (captainOnly && !isCaptain() && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
}