import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Image, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_IP = '10.74.1.114';
const BACKEND_PORT = '3001';

const api = axios.create({
    baseURL: `http://${BACKEND_IP}:${BACKEND_PORT}`,
});

export default function ProfileScreen({ route }) {
  const { phoneNumber } = route.params; // Récupérer le numéro de téléphone depuis les paramètres
  const [name, setName] = useState('Nom par défaut');
  const [phone, setPhone] = useState(phoneNumber || 'Numéro par défaut');
  const [profileImage, setProfileImage] = useState(null); // URI de l'image de profil par défaut ou null

  // Charger les informations utilisateur depuis l'API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const jwt = await AsyncStorage.getItem('jwtToken');
        const response = await api.get(`/user/${phoneNumber}`, {
          headers: {
            authorization: jwt, // Utilisation du token JWT dans les headers
          },
        });
        const userData = response.data;
        setName(userData.name);
        setPhone(userData.phoneNumber);
        setProfileImage(userData.profile_image_url || null);
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
      }
    };

    if (phoneNumber) {
      fetchUserData();
    }
  }, [phoneNumber]);

  const handleSave = () => {
    Alert.alert('Profil mis à jour', 'Vos informations de profil ont été enregistrées.');
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission refusée", "Vous devez permettre l'accès à votre galerie pour changer l'image de profil.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri); // Mettre à jour l'URI de l'image choisie
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={profileImage ? { uri: profileImage } : require('../assets/default-profile.jpg')} // Utiliser l'image par défaut ou celle sélectionnée
          style={styles.profileImage}
        />
        <Text style={styles.changeImageText}>Changer l'image de profil</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Nom</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Téléphone</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        editable={false} // Empêche l'édition du numéro de téléphone
      />

      <Button title="Enregistrer" onPress={handleSave} color="#25D366" />
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
  changeImageText: {
    textAlign: 'center',
    color: '#075E54',
    marginBottom: 20,
  },
  label: {
    marginBottom: 10,
    fontSize: 18,
    color: '#075E54',
  },
  input: {
    height: 40,
    borderColor: '#075E54',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
});
