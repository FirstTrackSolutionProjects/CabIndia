// src/config/googleAuth.js (NEW)
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 
  '79474403137-kf7plivtq1cgkkeapit16a45oskepvtb.apps.googleusercontent.com';

export const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || 
  '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';

export const googleAuthConfig = {
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: window.location.origin + '/auth/callback',
  scope: 'email profile',
};