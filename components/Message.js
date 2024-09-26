import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Message = ({ message, isUserMessage, profile_image, user_name, phoneNumber }) => {

  useEffect(() => {

  }, [profile_image, user_name]);

  const displayName = user_name || phoneNumber;
  
  // Utiliser une image par défaut si profile_image est null
  const profileImage = profile_image ? { uri: profile_image } : require('../assets/default-profile.jpg');
  
  return (
    <View
      style={[
        styles.messageContainer,
        isUserMessage ? styles.userMessage : styles.otherMessage,
      ]}
    >
      <View style={styles.userInfoContainer}>
        <Image source={profileImage} style={styles.profileImage} />
        <Text style={styles.userName}>{displayName}</Text>
      </View>
      <Text style={styles.messageText}>{message.content}</Text>
      <Text style={styles.timestamp}>{new Date(message.created_at).toLocaleTimeString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#DCF8C6', // Vert pour les messages de l'utilisateur
    alignSelf: 'flex-end', // Aligner à droite pour l'utilisateur
  },
  otherMessage: {
    backgroundColor: '#fff', // Blanc pour les autres
    alignSelf: 'flex-start', // Aligner à gauche pour les autres
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  timestamp: {
    fontSize: 10,
    color: 'gray',
    marginTop: 5,
    textAlign: 'right',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});


export default Message;
