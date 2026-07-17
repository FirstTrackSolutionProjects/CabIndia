import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { COLORS, SIZES, FONTS } from '../styles/theme';

const CaptainApplicationScreen = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [vehicleModel, setVehicleModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!vehicleModel || !plateNumber) {
      Alert.alert("Error", "Please fill in all vehicle details.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/apply-captain', {
        userId: userData.id,
        vehicleModel,
        licensePlate: plateNumber,
        vehicleType
      });

      if (response.data.success) {
        Alert.alert("Success", "Application submitted! We will review your documents.");
        navigation.goBack();
      }
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to submit application.");
    } finally {
      setLoading(false);
    }
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
