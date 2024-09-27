import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatInput from '../components/ChatInput';
import Message from '../components/Message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Pour l'icône d'édition

const BACKEND_IP = '10.74.1.114';
const BACKEND_PORT = '3001';

const api = axios.create({
  baseURL: `http://${BACKEND_IP}:${BACKEND_PORT}`,
});

export default function ChatScreen({ route }) {
  const { messages: initialMessages, title, phoneNumber, conversations_id, conversation_image } = route.params;
  const [messages, setMessages] = useState(initialMessages);
  const navigation = useNavigation();


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
      console.error(`Erreur lors de la récupération des informations utilisateur pour ${fullPhone}:`, error);
      return null;
    }
  };

  const sendMessage = async (content) => {
    try {
      const jwt = await AsyncStorage.getItem('jwtToken');
      const user_id = await fetchUserId(phoneNumber); 


      if (!user_id) {
        console.error('Impossible de récupérer l\'userId pour le numéro de téléphone.');
        return;
      }

      const requestBody = {
        conversation_id: conversations_id,
        user_id,
        content,
        conversation_image: null,
        video_url: null,
        audio_url: null,
      };

      const response = await api.post('/messages', requestBody, {
        headers: {
          authorization: jwt,
        },
      });

      if (response.data.success) {
        setMessages([{ message_id: messages.length + 1, content, user_id, created_at: new Date().toISOString() }, ...messages]);
      } else {
        console.error('Erreur lors de l\'envoi du message:', response.data);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const jwt = await AsyncStorage.getItem('jwtToken');
        const response = await api.get(`/conversations/${phoneNumber}`, {
          headers: {
            authorization: jwt,
          },
        });

        const conversation = response.data.conversations.find(convo => convo.title === title);
        if (conversation) {
          setMessages(conversation.messages);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des messages:', error);
      }
    };

    fetchMessages();

    const interval = setInterval(fetchMessages, 50);

    return () => clearInterval(interval);
  }, [phoneNumber, title]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.chatHeader}>
        <Image 
          source={conversation_image ? { uri: conversation_image } : require('../assets/default-profile.jpg')} 
          style={styles.chatImage} 
        />
        <Text style={styles.chatTitle}>{title}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditConversation', { conversations_id, title, phoneNumber, conversation_image, phoneNumber })}
        >
          <Icon name="pencil" size={24} color="#fff" />
        </TouchableOpacity>

      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.message_id.toString()}
        renderItem={({ item }) => (
          <Message
            message={item}
            isUserMessage={item.phone_number === phoneNumber}
            profile_image={item.profile_image}
            user_name={item.user_name}
            phoneNumber={item.phone_number}
          />
        )}
        inverted
      />

      <ChatInput onSendMessage={sendMessage} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE5DD',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#075E54',
    justifyContent: 'space-between',
  },
  chatImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1, // Pour que le titre prenne l'espace disponible
  },
  editButton: {
    padding: 10,
  },
});
