import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Text } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatInput from '../components/ChatInput';
import Message from '../components/Message'; // Import du composant Message

const BACKEND_IP = '10.74.1.114';
const BACKEND_PORT = '3001';

const api = axios.create({
    baseURL: `http://${BACKEND_IP}:${BACKEND_PORT}`,
});

export default function ChatScreen({ route }) {
  const { messages: initialMessages, title, phoneNumber } = route.params;
  const [messages, setMessages] = useState(initialMessages);

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
        console.log(conversation);
        
        if (conversation) {
          setMessages(conversation.messages);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des messages:', error);
      }
    };

    fetchMessages();

    const interval = setInterval(fetchMessages, 500);

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
          />
        )}
        inverted
      />

      <ChatInput onSendMessage={(text) => setMessages([{ message_id: messages.length + 1, content: text, user_id: phoneNumber }, ...messages])} />
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
