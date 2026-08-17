// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cabindia-token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await api.get('/api/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth load error:', error);
          localStorage.removeItem('cabindia-token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (userData, userToken) => {
    localStorage.setItem('cabindia-token', userToken);
    setToken(userToken);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    localStorage.removeItem('cabindia-token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const isAdmin = () => user?.role === 'admin';
  const isCaptain = () => user?.role === 'captain';

  const value = { user, token, login, logout, loading, isAdmin, isCaptain };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider, AuthContext };