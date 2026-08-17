// cabindia-mobile/src/utils/googleAuth.js (NEW)
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { 
  GOOGLE_CLIENT_ID, 
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_PROJECT_ID,
  GOOGLE_WEB_CLIENT_ID
} from '../config';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    projectId: GOOGLE_PROJECT_ID,
    clientId: GOOGLE_CLIENT_ID,
    redirectUri: Platform.select({
      ios: `com.cabindia.app:/oauth2redirect/google`,
      android: `com.cabindia.app:/oauth2redirect/google`,
      web: `https://cabindia.com/auth/callback`,
    }),
    scopes: ['profile', 'email'],
  });

  return { request, response, promptAsync };
};

export const getGoogleUserInfo = async (accessToken) => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching Google user info:', error);
    throw error;
  }
};