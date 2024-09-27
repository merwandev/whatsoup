import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';
import axios from 'axios';

const BACKEND_IP = '10.74.1.114';
const BACKEND_PORT = '3001';

const api = axios.create({
  baseURL: `http://${BACKEND_IP}:${BACKEND_PORT}`,
});

export default function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');

  const sendVerificationCode = async () => {
    if (phoneNumber.length !== 9) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide (ex 699421627).');
      return;
    }
    const fullPhoneNumber = `+33${phoneNumber}`;

    try {

      if (fullPhoneNumber === "+33695720471") {
        navigation.navigate('Verification', { phoneNumber: fullPhoneNumber });
      } else {
        const response = await api.post('/send-verification-code', { phoneNumber: fullPhoneNumber });

        if (response.status === 200 && response.data.success) {
          navigation.navigate('Verification', { phoneNumber: fullPhoneNumber });
        } else {
          Alert.alert('Erreur', response.data.message);
        }
      }


    } catch (error) {
      console.error('Error details:', error);
      Alert.alert('Erreur', `Impossible d'envoyer le code de vérification. Détails: ${error.message}`);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WhatsSoup 🍜</Text>
      <TextInput
        style={styles.input}
        placeholder="Entrez votre numéro de téléphone"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <TouchableOpacity style={styles.button} onPress={sendVerificationCode}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSignUp} style={styles.signUpContainer}>
        <Text style={styles.signUpText}>ou inscrivez-vous</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    color: '#075E54',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    borderColor: '#075E54',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#25D366',
    paddingVertical: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  signUpText: {
    color: '#075E54',
    fontSize: 16,
  },
});