import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

const CaptainApplicationScreen = ({ navigation }) => {
  const [vehicleModel, setVehicleModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');

  const handleApply = () => {
    Alert.alert("Success", "Application submitted! We will review your documents.");
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Drive with CabIndia</Text>
      <Text style={styles.subtitle}>Fill in your vehicle details to get started.</Text>
      
      <TextInput style={styles.input} placeholder="Vehicle Model (e.g. Maruti Swift)" value={vehicleModel} onChangeText={setVehicleModel} />
      <TextInput style={styles.input} placeholder="License Plate Number" value={plateNumber} onChangeText={setPlateNumber} />
      
      <TouchableOpacity style={styles.button} onPress={handleApply}>
        <Text style={styles.buttonText}>Submit Application</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 15 },
  button: { backgroundColor: '#FFD700', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: 'bold' }
});

export default CaptainApplicationScreen;
