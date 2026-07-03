// cabindia-mobile/src/screens/WelcomeScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { COLORS, SIZES, GLOBAL_STYLES } from '../styles/theme';
import { Feather } from '@expo/vector-icons';

export default function WelcomeScreen({ navigation }) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  const handleGetFare = () => {
    if (!source || !destination) return alert("Enter locations");
    navigation.navigate('FareDetails', { source, destination });
  };

  return (
    <View style={GLOBAL_STYLES.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>GET YOUR <Text style={styles.highlight}>FIRST RIDE</Text> NOW</Text>
        <Text style={styles.subtitle}>AUTO • BIKES • CARS</Text>

        <View style={styles.form}>
          <TextInput 
            style={styles.input} 
            placeholder="Source Location" 
            placeholderTextColor="#666"
            value={source}
            onChangeText={setSource}
          />
          <View style={styles.dots}><Text style={{color: '#fff'}}>• • •</Text></View>
          <TextInput 
            style={styles.input} 
            placeholder="Destination" 
            placeholderTextColor="#666"
            value={destination}
            onChangeText={setDestination}
          />
          
          <TouchableOpacity style={styles.button} onPress={handleGetFare}>
            <Text style={styles.buttonText}>Get Your Fare</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Support Chat Floating Button Preview */}
      <TouchableOpacity 
        style={styles.chatFab} 
        onPress={() => navigation.navigate('Chat')}
      >
        <Feather name="message-circle" size={24} color={COLORS.background} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { color: '#fff', fontSize: 32, fontWeight: '900', textAlign: 'center' },
  highlight: { color: COLORS.primary, fontStyle: 'italic' },
  subtitle: { color: '#fff', marginTop: 10, letterSpacing: 2, fontSize: 12 },
  form: { width: '100%', marginTop: 40, gap: 15 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 15, fontSize: 16, color: '#000' },
  dots: { alignItems: 'center' },
  button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 12, alignItems: 'center' },
  buttonText: { fontWeight: 'bold', fontSize: 16 },
  chatFab: { position: 'absolute', bottom: 30, right: 20, backgroundColor: COLORS.primary, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 }
});
