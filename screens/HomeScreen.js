import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BACKEND_IP = '10.74.1.114';
const BACKEND_PORT = '3001';

const api = axios.create({
    baseURL: `http://${BACKEND_IP}:${BACKEND_PORT}`,
});

export default function HomeScreen({ route, navigation }) {
    const { phoneNumber } = route.params;
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletedConversations, setDeletedConversations] = useState([]);
    const [openedRows, setOpenedRows] = useState({}); // État pour les lignes ouvertes

    useEffect(() => {
        const loadDeletedConversations = async () => {
            try {
                const storedDeletedConversations = await AsyncStorage.getItem('deletedConversations');
                if (storedDeletedConversations) {
                    setDeletedConversations(JSON.parse(storedDeletedConversations));
                }
            } catch (error) {
                console.error('Erreur lors du chargement des conversations supprimées', error);
            }
        };

        loadDeletedConversations();
    }, []);

    const saveDeletedConversations = async (updatedDeletedConversations) => {
        try {
            await AsyncStorage.setItem('deletedConversations', JSON.stringify(updatedDeletedConversations));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des conversations supprimées', error);
        }
    };

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const jwt = await AsyncStorage.getItem('jwtToken');
                const response = await api.get(`/conversations/${phoneNumber}`, {
                    headers: {
                        authorization: jwt,
                    },
                });

                const filteredConversations = response.data.conversations.filter(
                    (conv) => !deletedConversations.includes(conv.conversation_id)
                );

                setConversations(filteredConversations);

                setLoading(false);
            } catch (error) {
                console.error('Erreur lors de la récupération des conversations:', error);
            }
        };

        if (phoneNumber) {
            fetchConversations();
            const interval = setInterval(fetchConversations, 50);

            return () => clearInterval(interval);
        } else {
            console.error('Numéro de téléphone non défini');
        }
    }, [phoneNumber, deletedConversations]);

    const deleteConversation = async (conversation_id) => {
        const updatedDeletedConversations = [...deletedConversations, conversation_id];

        setDeletedConversations(updatedDeletedConversations);
        await saveDeletedConversations(updatedDeletedConversations);

        setConversations(conversations.filter(item => item.conversation_id !== conversation_id));
    };

    const handleRowOpen = (rowKey) => {
        setOpenedRows((prev) => ({ ...prev, [rowKey]: true }));
    };

    const handleRowClose = (rowKey) => {
        setOpenedRows((prev) => {
            const newRows = { ...prev };
            delete newRows[rowKey];
            return newRows;
        });
    };

    const handleNewMessage = (conversation) => {
        if (deletedConversations.includes(conversation.conversation_id)) {
            const updatedDeletedConversations = deletedConversations.filter(
                (id) => id !== conversation.conversation_id
            );
            setDeletedConversations(updatedDeletedConversations);
            saveDeletedConversations(updatedDeletedConversations);
        }

        setConversations((prevConversations) => {
            const existingConv = prevConversations.find(conv => conv.conversation_id === conversation.conversation_id);
            if (!existingConv) {
                return [conversation, ...prevConversations];
            }
            return prevConversations;
        });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Chargement des conversations...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SwipeListView
                data={conversations}
                keyExtractor={(item) => item.conversation_id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate('Chat', {
                                messages: item.messages,
                                title: item.title,
                                phoneNumber,
                                conversations_id: item.conversation_id,
                                conversation_image: item.conversation_image,
                            })
                        }
                    >
                        <View style={styles.item}>
                            <Image source={{ uri: item.conversation_image }} style={styles.avatar} />
                            <View style={styles.messageInfo}>
                                <Text style={styles.name}>{item.title}</Text>
                                <Text style={styles.lastMessage}>{item.last_message}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                renderHiddenItem={({ item }) => (
                    <View style={styles.rowBack}>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => deleteConversation(item.conversation_id)}
                        >
                            <Text style={[
                                styles.deleteButtonText,
                                { display: openedRows[item.conversation_id] ? 'flex' : 'none' } // Affiche le texte uniquement si la ligne est glissée
                            ]}>
                                Supprimer
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
                leftOpenValue={0}
                rightOpenValue={-75}
                onRowOpen={handleRowOpen}
                onRowClose={handleRowClose}
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
    rowBack: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingRight: 15,
    },
    deleteButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 75,
        height: '100%',
    },
    deleteButtonText: {
        color: 'black',
        fontWeight: 'bold',
    },
});