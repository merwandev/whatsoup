import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import jwtDecode from 'jwt-decode'; // Installe cette bibliothèque pour décoder le JWT

const conversations = [
  {
    id: '1',
    name: 'John Doe',
    lastMessage: 'Hello, how are you?',
    readReceipt: '✔✔',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    id: '2',
    name: 'Jane Smith',
    lastMessage: 'See you tomorrow!',
    readReceipt: '✔',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
  },
];

export default function HomeScreen({ navigation }) {
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        Alert.alert('Session expirée', 'Veuillez vous reconnecter.');
        navigation.navigate('LoginScreen');
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          Alert.alert('Session expirée', 'Veuillez vous reconnecter.');
          navigation.navigate('LoginScreen');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        Alert.alert('Erreur', 'Une erreur s\'est produite lors de la vérification du token.');
      }
    };

    checkToken();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('Chat', { userId: item.id })}>
            <View style={styles.item}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={styles.messageInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.lastMessage}>{item.lastMessage}</Text>
              </View>
              <Icon name="check-all" size={20} color={item.readReceipt === '✔✔' ? "#34B7F1" : "#777"} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  messageInfo: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  lastMessage: {
    color: 'gray',
    marginTop: 4,
  },
});
