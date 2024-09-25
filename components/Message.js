import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

export default function Message({ message }) {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fonction pour lire l'audio
  const playSound = async () => {
    if (isPlaying) {
      // Si le son est déjà en train de jouer, on l'arrête
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }
      return;
    }

    try {
      // Charger et jouer le son
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: message.text });
      setSound(newSound);
      await newSound.playAsync();
      setIsPlaying(true);

      // Lorsque la lecture est terminée, réinitialiser l'état
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          setSound(null);
        }
      });
    } catch (error) {
      console.error('Erreur lors de la lecture de l\'audio', error);
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync(); // Décharger le son lorsque le composant est démonté ou le son change
        }
      : undefined;
  }, [sound]);

  // Affichage des différents types de messages
  if (message.type === 'text') {
    return (
      <View style={styles.textMessageContainer}>
        <Text style={styles.textMessage}>{message.text}</Text>
      </View>
    );
  }

  if (message.type === 'audio') {
    return (
      <View style={styles.audioMessageContainer}>
        <TouchableOpacity onPress={playSound}>
          <Text style={styles.audioMessage}>{isPlaying ? '⏸️ Arrêter' : '▶️ Écouter le message vocal'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  textMessageContainer: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-start',
    borderRadius: 10,
    maxWidth: '80%',
  },
  textMessage: {
    fontSize: 16,
  },
  audioMessageContainer: {
    alignSelf: 'flex-start',
    marginVertical: 5,
  },
  audioMessage: {
    fontSize: 16,
    color: '#25D366',
  },
});
