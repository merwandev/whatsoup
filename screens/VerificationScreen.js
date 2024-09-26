    import React, { useState } from 'react';
    import { View, TextInput, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';
    import AsyncStorage from '@react-native-async-storage/async-storage';
    import axios from 'axios';

    const BACKEND_IP = '10.74.1.114';
    const BACKEND_PORT = '3001';

    const api = axios.create({
        baseURL: `http://${BACKEND_IP}:${BACKEND_PORT}`,
    });

    export default function VerificationScreen({ route, navigation }) {
        const { phoneNumber } = route.params;
        const [verificationCode, setVerificationCode] = useState('');

        const verifyCode = async () => {
            if (verificationCode.length === 0) {
                Alert.alert('Erreur', 'Veuillez entrer le code de vérification.');
                return;
            }

            try {
                console.log({ phoneNumber, verificationCode })
                const response = await api.post('/verify-code', { phoneNumber, verificationCode });
                if (response.data.success) {
                    await AsyncStorage.setItem('jwtToken', response.data.token);
                    navigation.navigate('Home', {
                        phoneNumber: phoneNumber,
                      });
                } else {
                    Alert.alert('Erreur', response.data.message);
                }
            } catch (error) {
                console.error('Error details:', error);
                Alert.alert('Erreur', `Erreur lors de la vérification du code. Détails: ${error.message}`);
            }
        };

        return (
            <View style={styles.container}>
                <Text style={styles.title}>Vérification du code</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Entrez le code de vérification"
                    keyboardType="numeric"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                />
                <TouchableOpacity style={styles.button} onPress={verifyCode}>
                    <Text style={styles.buttonText}>Vérifier</Text>
                </TouchableOpacity>
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
        title: {
            fontSize: 24,
            color: '#075E54',
            textAlign: 'center',
            marginBottom: 20,
            fontWeight: 'bold',
        },
        input: {
            height: 50,
            borderColor: '#075E54',
            borderWidth: 1,
            marginBottom: 20,
            paddingHorizontal: 10,
            borderRadius: 5,
        },
        button: {
            backgroundColor: '#25D366',
            paddingVertical: 15,
            borderRadius: 5,
        },
        buttonText: {
            color: '#fff',
            textAlign: 'center',
            fontSize: 16,
            fontWeight: 'bold',
        },
    });