import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_IP = '10.74.1.114';
const BACKEND_PORT = '3001';

const api = axios.create({
  baseURL: `http://${BACKEND_IP}:${BACKEND_PORT}`,
});

export default function NewChatScreen({ route, navigation }) {
  const { phoneNumber } = route.params;
  const [contactInfo, setContactInfo] = useState('');
  const [conversationName, setConversationName] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [userIds, setUserIds] = useState([]);

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

  const fetchUserInfo = async (phone) => {
    try {

      const jwt = await AsyncStorage.getItem('jwtToken');

      var fullPhone = phone.startsWith('+33') ? phone : '+33' + phone;
      const response = await api.get(`/user/${fullPhone}`, {
        headers: {
          authorization: jwt,
        },
      });
      const userId = response.data.user.id;

      setUserIds((prevUserIds) => {
        if (!prevUserIds.includes(userId)) {
          return [...prevUserIds, userId];
        }
        return prevUserIds;
      });
    } catch (error) {
      console.error(`Erreur lors de la récupération des informations utilisateur pour ${fullPhone}:`, error);
    }
  };

  const handleNewChat = async () => {
    if (contactInfo.trim() && conversationName.trim()) {
      try {
        await fetchUserInfo(contactInfo);
        await fetchUserInfo(phoneNumber);

        const jwt = await AsyncStorage.getItem('jwtToken');
        const requestBody = {
          title: conversationName,
          user_ids: userIds,
          image_url: imageUri || 'https://inout-cotedazur.com/wp-content/uploads/2016/09/Tete.jpg',
        };
        
        const response = await api.post('/conversations', requestBody, {
          headers: {
            authorization: jwt,
          },
        });

        if (response.data.success) {
          navigation.navigate('Chats', { userId: contactInfo });
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
