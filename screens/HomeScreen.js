import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_IP = '10.74.1.114';
const BACKEND_PORT = '3001';

const api = axios.create({
    baseURL: `http://${BACKEND_IP}:${BACKEND_PORT}`,
});

export default function HomeScreen({ route }) {
    const { phoneNumber } = route.params; // Récupérer le phoneNumber passé depuis VerificationScreen
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const jwt = await AsyncStorage.getItem('jwtToken');
                // console.log('JWT token:', jwt); // Vérification du token JWT

                const response = await api.get(`/conversations/${phoneNumber}`, {
                    headers: {
                        authorization: jwt, // Ajout du token JWT dans les headers
                    },
                });
                setConversations(response.data.conversations); // Met à jour avec les données des conversations
                setLoading(false);
                // console.log('PhoneNumber:', phoneNumber);
                // console.log('Conversations:', response.data.conversations);
            } catch (error) {
                console.error('Erreur lors de la récupération des conversations:', error);
            }
        };

        if (phoneNumber) {
            fetchConversations();
        } else {
            console.error('Numéro de téléphone non défini');
        }
    }, [phoneNumber]);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Chargement des conversations...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={conversations}
                keyExtractor={(item) => item.conversation_id.toString()} // Utilise conversation_id comme clé
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Image source={{ uri: item.image_url }} style={styles.avatar} />
                        <View style={styles.messageInfo}>
                            <Text style={styles.name}>{item.title}</Text>
                            <Text style={styles.lastMessage}>{item.last_message}</Text> 
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
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
