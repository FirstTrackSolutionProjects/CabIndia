// src/Components/GoogleLoginButton.jsx (NEW)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function GoogleLoginButton({ type = 'login', onSuccess }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // Get user info from Google
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        const userInfo = await userInfoResponse.json();

        // Send to backend
        const response = await api.post('/api/auth/google', {
          idToken: tokenResponse.access_token,
          email: userInfo.email,
          name: userInfo.name || userInfo.given_name || userInfo.email.split('@')[0],
          picture: userInfo.picture,
        });

        if (response.data.success) {
          await login(response.data.user, response.data.token);
          toast.success(`🎉 Welcome ${response.data.user.name || 'CabIndia rider'}!`);
          onSuccess && onSuccess(response.data.user);
          navigate(type === 'login' ? '/dashboard' : '/');
        } else {
          toast.error(response.data.message || 'Google authentication failed');
        }
      } catch (error) {
        console.error('Google login error:', error);
        toast.error('Failed to login with Google. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
      toast.error('Google sign-in failed. Please try again.');
      setLoading(false);
    },
    flow: 'implicit',
    scope: 'email profile openid',
  });

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-white font-semibold text-sm py-3 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <>
          <FcGoogle style={{ fontSize: 20, flexShrink: 0 }} />
          <span>Continue with Google</span>
        </>
      )}
    </button>
  );
}