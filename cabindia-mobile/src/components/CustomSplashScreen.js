// cabindia-mobile/src/components/CustomSplashScreen.js
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const CustomSplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/splash.png')} 
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default CustomSplashScreen;