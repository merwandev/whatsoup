import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native'; // Utilisation du hook useRoute

const BACKEND_IP = '10.74.1.114';
const BACKEND_PORT = '3001';

const api = axios.create({
    baseURL: `http://${BACKEND_IP}:${BACKEND_PORT}`,
});

export default function HomeScreen({route, navigate}) {
    // const route = useRoute(); // Utilise useRoute pour accéder aux paramètres
    console.log('Route:', route);
    console.log('Params:', route.params);
    const { phoneNumber } = route.params; // Récupérer le phoneNumber passé depuis VerificationScreen
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await api.get(`/conversations/${phoneNumber}`);
                setConversations(response.data);
                setLoading(false);
                console.log('PhoneNumber:', phoneNumber);
                console.log('Conversations:', response.data);
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
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
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
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
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
