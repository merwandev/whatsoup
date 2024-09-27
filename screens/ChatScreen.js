import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Text } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatInput from '../components/ChatInput';
import Message from '../components/Message';

const BACKEND_IP = '10.74.1.114';
const BACKEND_PORT = '3001';

const api = axios.create({
    baseURL: `http://${BACKEND_IP}:${BACKEND_PORT}`,
});

export default function ChatScreen({ route }) {
  const { messages: initialMessages, title, phoneNumber, conversations_id } = route.params;
  const [messages, setMessages] = useState(initialMessages);

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
      console.log(`ID de l'utilisateur pour le numéro ${fullPhone}:`, userId);
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
      console.log('conversation_id:', conversations_id);
      const requestBody = {
        conversation_id: conversations_id,
        user_id,
        content,
        image_url: null, 
        video_url: null,
        audio_url: null,
      };

      console.log('Corps de la requête envoyée pour le message:', requestBody);

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
        <Text style={styles.chatTitle}>{title}</Text> 
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
    padding: 15,
    backgroundColor: '#075E54',
    alignItems: 'center',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
