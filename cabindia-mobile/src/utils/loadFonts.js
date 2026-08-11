// cabindia-mobile/src/utils/loadFonts.js
import * as Font from 'expo-font';

export const loadIcons = async () => {
  try {
    await Font.loadAsync({
      'Ionicons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
    });
    console.log('✅ Icons loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load icons:', error);
  }
};