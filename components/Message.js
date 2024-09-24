import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Message({ text }) {
  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.messageText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  bubble: {
    backgroundColor: '#DCF8C6',
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 16,
  },
});
