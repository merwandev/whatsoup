import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, Image, TouchableOpacity } from 'react-native';
import axios from 'axios'; // Importer axios pour faire les requêtes API
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_IP = '10.74.1.114'; // Remplacer par l'IP de ton serveur backend
const BACKEND_PORT = '3001'; // Remplacer par le port de ton serveur backend

const api = axios.create({
  baseURL: `http://${BACKEND_IP}:${BACKEND_PORT}`,
});

export default function NewChatScreen({ route, navigation }) {
  const { phoneNumber } = route.params; // Récupérer le phoneNumber passé via route.params
  const [contactInfo, setContactInfo] = useState('');
  const [conversationName, setConversationName] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [userIds, setUserIds] = useState([]);

  // Fonction pour sélectionner une image à partir de la galerie
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission refusée", "Vous devez permettre l'accès à votre galerie.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Fonction pour faire un GET sur /user/:phoneNumber
  const fetchUserInfo = async (phone) => {
    try {

      const jwt = await AsyncStorage.getItem('jwtToken');

      const response = await api.get(`/user/+33${phone}`, {
        headers: {
            authorization: jwt,
        },
      });
      const userId = response.data.user.id;
      console.log(`Infos utilisateur pour le numéro ${phone}:`, response.data);
      console.log(`ID de l'utilisateur:`, userId);

      setUserIds( [...prevUserIds, userId] );
      console.log(`UserIds:`, userIds);
    } catch (error) {
      console.error(`Erreur lors de la récupération des informations utilisateur pour ${phone}:`, error);
    }
  };

  const handleNewChat = async () => {
    if (contactInfo.trim() && conversationName.trim()) {
      try {
        // Rechercher les infos utilisateur pour le contact saisi et l'utilisateur connecté
        await fetchUserInfo(contactInfo); // Fetch les infos pour le contact
        await fetchUserInfo(phoneNumber); // Fetch les infos pour l'utilisateur connecté via route.params

        const jwt = await AsyncStorage.getItem('jwtToken');
        // Corps de la requête
        const requestBody = {
          title: conversationName,
          user_ids: userIds, // Remplacer par les vrais IDs
          image_url: imageUri || 'https://inout-cotedazur.com/wp-content/uploads/2016/09/Tete.jpg',
        };

        // Envoyer la requête POST à l'API
        const response = await api.post('/conversations', requestBody, {
          headers: {
              authorization: jwt,
          },
        });

        if (response.data.success) {
          Alert.alert('Nouveau Chat', `Chat démarré avec ${contactInfo}`);
          navigation.navigate('Chat', { userId: contactInfo });
        } else {
          Alert.alert('Erreur', 'Impossible de démarrer le chat.');
        }
      } catch (error) {
        console.error('Erreur lors de la création du chat:', error);
        Alert.alert('Erreur', 'Une erreur est survenue lors de la création du chat.');
      }
    } else {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone et un nom de conversation.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Entrez le numéro de téléphone ou sélectionnez un contact</Text>
      <TextInput
        style={styles.input}
        placeholder="Numéro de téléphone"
        value={contactInfo}
        onChangeText={setContactInfo}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Nom de la conversation</Text>
      <TextInput
        style={styles.input}
        placeholder="Nom de la conversation"
        value={conversationName}
        onChangeText={setConversationName}
      />

      <TouchableOpacity onPress={pickImage}>
        <View style={styles.imagePicker}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={styles.imageText}>Choisir une image pour la conversation</Text>
          )}
        </View>
      </TouchableOpacity>

      <Button title="Démarrer le chat" onPress={handleNewChat} color="#25D366" />
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
  imagePicker: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 10,
    borderRadius: 10,
    borderColor: '#075E54',
    borderWidth: 1,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imageText: {
    color: '#075E54',
    fontSize: 16,
  },
});
