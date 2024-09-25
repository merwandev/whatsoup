import React, { useState } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ChatInput from '../components/ChatInput';
import Message from '../components/Message';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(null); // Pour gérer l'enregistrement en cours
  const [isRecording, setIsRecording] = useState(false); // Pour empêcher plusieurs enregistrements simultanés

  // Fonction pour sauvegarder un fichier localement (images, vidéos, audio)
  const saveFileToLocal = async (uri, folder = 'data/audio') => {
    try {
      const fileName = uri.split('/').pop();
      const newPath = `${FileSystem.documentDirectory}${folder}/${fileName}`;
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}${folder}/`, { intermediates: true });
      await FileSystem.copyAsync({
        from: uri,
        to: newPath,
      });
      return newPath;
    } catch (error) {
      console.error('Error saving the file:', error);
      return null;
    }
  };

  // Fonction pour démarrer l'enregistrement audio
  const startRecording = async () => {
    if (isRecording) {
      Alert.alert('Enregistrement en cours', 'Un enregistrement est déjà en cours.');
      return;
    }

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        setIsRecording(true);
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(recording);
      } else {
        Alert.alert('Permission refusée', 'Vous devez permettre l\'accès au micro.');
      }
    } catch (err) {
      console.error('Erreur lors du démarrage de l\'enregistrement', err);
      setIsRecording(false);
    }
  };

  // Fonction pour arrêter l'enregistrement audio
  const stopRecording = async () => {
    if (!recording) {
      return; // Si l'enregistrement n'est pas initialisé, ne pas appeler stop
    }

    try {
      setIsRecording(false); // Arrête l'indicateur d'enregistrement actif
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI(); // URI de l'enregistrement
      const localUri = await saveFileToLocal(uri);
      if (localUri) {
        const newMessage = { id: messages.length + 1, text: localUri, type: 'audio' };
        setMessages([newMessage, ...messages]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'arrêt de l\'enregistrement', error);
    } finally {
      setRecording(null); // Réinitialise l'objet recording
    }
  };

  // Sélectionner et envoyer une image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const localUri = await saveFileToLocal(result.assets[0].uri, 'data/images');
      if (localUri) {
        const newMessage = { id: messages.length + 1, text: localUri, type: 'image' };
        setMessages([newMessage, ...messages]);
      }
    }
  };

  // Sélectionner et envoyer une vidéo
  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const localUri = await saveFileToLocal(result.assets[0].uri, 'data/videos');
      if (localUri) {
        const newMessage = { id: messages.length + 1, text: localUri, type: 'video' };
        setMessages([newMessage, ...messages]);
      }
    }
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
        renderItem={({ item }) => <Message message={item} />}
        inverted
      />

      <View style={styles.mediaOptions}>
        <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
          <Icon name="image" size={24} color="#25D366" />
        </TouchableOpacity>
        <TouchableOpacity onPress={pickVideo} style={styles.iconButton}>
          <Icon name="video" size={24} color="#25D366" />
        </TouchableOpacity>
        <TouchableOpacity
          onPressIn={startRecording}
          onPressOut={stopRecording}
          style={styles.iconButton}
        >
          <Icon name="microphone" size={24} color={isRecording ? "red" : "#25D366"} />
        </TouchableOpacity>
      </View>

      <ChatInput onSendMessage={(text) => setMessages([{ id: messages.length + 1, text, type: 'text' }, ...messages])} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE5DD',
  },
  mediaOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  iconButton: {
    paddingHorizontal: 10,
  },
});
