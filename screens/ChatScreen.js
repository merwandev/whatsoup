import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import ChatInput from '../components/ChatInput';
import Message from '../components/Message';

export default function ChatScreen({ route }) {
  const { userId } = route.params;
  const [messages, setMessages] = useState([]);

  const handleSendMessage = (text) => {
    const newMessage = { id: messages.length + 1, text, senderId: userId };
    setMessages([newMessage, ...messages]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Message text={item.text} />}
        inverted
      />
      <ChatInput onSendMessage={handleSendMessage} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE5DD',
  },
});
