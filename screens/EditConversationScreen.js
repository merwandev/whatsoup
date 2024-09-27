import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Image, TouchableOpacity, FlatList, Alert } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_IP = '10.74.1.114';
const BACKEND_PORT = '3001';

const api = axios.create({
  baseURL: `http://${BACKEND_IP}:${BACKEND_PORT}`,
});

export default function EditConversationScreen({ route, navigation }) {
  const { conversations_id, title, phoneNumber, conversation_image } = route.params;
  const [conversationName, setConversationName] = useState(title);
  const [imageUri, setImageUri] = useState(conversation_image || null);
  const [newUserPhone, setNewUserPhone] = useState('');
  const [users, setUsers] = useState([]); // Stocker les détails des utilisateurs

  // Requête pour récupérer les informations de la conversation, y compris les user_ids et l'image
  useEffect(() => {
    const fetchConversationDetails = async () => {
      try {
        const jwt = await AsyncStorage.getItem('jwtToken');
        const response = await api.get(`/conversations/${phoneNumber}`, {
          headers: {
            authorization: jwt,
          },
        });

        const conversation = response.data.conversations;
        // if (conversation) {
          setConversationName(conversation.title);
          setImageUri(conversation.image_url || null);
          fetchUsersFromIds(conversation.user_ids); // Récupérer les utilisateurs à partir des user_ids
        // }
      } catch (error) {
        console.error('Erreur lors de la récupération des détails de la conversation:', error);
        Alert.alert('Erreur', 'Impossible de charger les détails de la conversation.');
      }
    };

    fetchConversationDetails();
  }, [conversations_id]);

  // Récupérer les détails des utilisateurs à partir de leurs user_ids
  const fetchUsersFromIds = async (user_ids) => {
    try {
      const jwt = await AsyncStorage.getItem('jwtToken');
      const userDetails = await Promise.all(
        user_ids.map(async (user_id) => {
          const response = await api.get(`/user/${user_id}`, {
            headers: {
              authorization: jwt,
            },
          });
          return response.data.user;
        })
      );
      setUsers(userDetails); // Stocker les détails des utilisateurs
      console.log('Détails des utilisateurs:', userDetails);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    }
  };

  const fetchUserId = async (phone) => {
    try {
      const jwt = await AsyncStorage.getItem('jwtToken');
      const fullPhone = phone.startsWith('+33') ? phone : '+33' + phone;

      const response = await api.get(`/user/${fullPhone}`, {
        headers: {
          authorization: jwt,
        },
      });

      const userId = response.data.user.id;
      return userId;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur pour ${phone}:`, error);
      return null;
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission refusée', 'Vous devez permettre l\'accès à votre galerie.');
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

  const updateConversation = async () => {
    try {
      const jwt = await AsyncStorage.getItem('jwtToken');

      let newUserId = null;
      if (newUserPhone.trim()) {
        newUserId = await fetchUserId(newUserPhone);
        if (!newUserId) {
          Alert.alert('Erreur', 'Utilisateur introuvable pour le numéro fourni.');
          return;
        }
      }

      const updatedUserIds = newUserId ? [...users.map(user => user.id), newUserId] : users.map(user => user.id);

      const requestBody = {
        title: conversationName,
        user_ids: updatedUserIds,
        image_url: imageUri || null,
      };

      const response = await api.patch(`/conversations/${conversations_id}`, requestBody, {
        headers: {
          authorization: jwt,
        },
      });

      if (response.data.success) {
        Alert.alert('Succès', 'Conversation mise à jour.');
        navigation.goBack();
      } else {
        Alert.alert('Erreur', response.data.error || 'Erreur lors de la mise à jour de la conversation.');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la conversation:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour de la conversation.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nom de la conversation</Text>
      <TextInput
        style={styles.input}
        value={conversationName}
        onChangeText={setConversationName}
      />

      <Text style={styles.label}>Ajouter un utilisateur par téléphone</Text>
      <TextInput
        style={styles.input}
        placeholder="Numéro de téléphone"
        value={newUserPhone}
        onChangeText={setNewUserPhone}
        keyboardType="phone-pad"
      />

      <TouchableOpacity onPress={pickImage}>
        <Image
          source={imageUri ? { uri: imageUri } : require('../assets/default-profile.jpg')}
          style={styles.image}
        />
        <Text style={styles.changeImageText}>Changer l'image de la conversation</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Utilisateurs dans la conversation</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text style={styles.userItem}>{item.name || item.phone_number}</Text>
        )}
      />

      <Button title="Mettre à jour" onPress={updateConversation} color="#25D366" />
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
  image: {
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
  userItem: {
    padding: 10,
    fontSize: 16,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
});
