import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';

export default function NewChatScreen({ navigation }) {
  const [contactInfo, setContactInfo] = useState('');

  const handleNewChat = () => {
    if (contactInfo.trim()) {
      Alert.alert('Nouveau Chat', `Démarrer un chat avec ${contactInfo}`);
      navigation.navigate('Chat', { userId: contactInfo });
    } else {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone ou sélectionner un contact.');
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
});
