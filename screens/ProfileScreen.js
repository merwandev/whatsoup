import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BACKEND_IP = '10.74.1.114';
const BACKEND_PORT = '3001';

const api = axios.create({
  baseURL: `http://${BACKEND_IP}:${BACKEND_PORT}`,
});

export default function ProfileScreen({ route }) {

  const { phoneNumber } = route.params;
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [userId, setUserId] = useState(null); 
  const [statusMessage, setStatusMessage] = useState(''); 

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const jwt = await AsyncStorage.getItem('jwtToken');
        const response = await api.get(`/user/${phoneNumber}`, {
          headers: {
            authorization: jwt,
          },
        });
        
        const user = response.data.user;
        setUserId(user.id);
        setName(user.name || '');
        setProfileImage(user.profile_image || null);
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        setStatusMessage('Erreur de chargement du profil.');
      }
    };

    fetchUserProfile();
  }, [phoneNumber]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      setStatusMessage("Permission refusée pour accéder à la galerie.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    if (!userId) {
      console.error('ID utilisateur introuvable.');
      setStatusMessage("Impossible de trouver l'utilisateur.");
      return;
    }

    try {
      const jwt = await AsyncStorage.getItem('jwtToken');

      const requestBody = {
        name: name || null,
        profile_image: profileImage || null,
      };

      const response = await api.patch(`/users/${userId}`, requestBody, {
        headers: {
          authorization: jwt,
        },
      });

      if (response.data.success) {
        setStatusMessage('Profil mis à jour avec succès.');
      } else {
        setStatusMessage(response.data.error || 'Erreur lors de la mise à jour du profil.');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setStatusMessage('Erreur lors de la mise à jour du profil.');
    }

    // Efface le message de statut après 3 secondes
    setTimeout(() => setStatusMessage(''), 3000);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={profileImage ? { uri: profileImage } : require('../assets/default-profile.jpg')}
          style={styles.profileImage}
        />
        <Text style={styles.changeImageText}>Changer l'image de profil</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Numéro de téléphone</Text>
      <TextInput
        style={styles.inputNonEditable}
        value={phoneNumber}
        editable={false}
      />

      <Text style={styles.label}>Nom</Text>
      <TextInput
        style={styles.inputEditable}
        value={name}
        onChangeText={setName}
        placeholder="Entrez votre nom"
      />

      <Button title="Enregistrer" onPress={handleSaveProfile} color="#25D366" />

      {/* Message de statut */}
      {statusMessage ? (
        <Text style={styles.statusMessage}>{statusMessage}</Text>
      ) : null}
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
  inputNonEditable: {
    height: 40,
    borderColor: '#075E54',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 5,
    backgroundColor: '#f2f2f2',
  },
  inputEditable: {
    height: 40,
    borderColor: '#075E54',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  statusMessage: {
    marginTop: 20,
    textAlign: 'center',
    color: '#075E54',
    fontSize: 16,
  },
});
