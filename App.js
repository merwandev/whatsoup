import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import NewChatScreen from './screens/NewChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import VerificationScreen from './screens/VerificationScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Constants from 'expo-constants';

const BACKEND_IP = '10.74.1.114';
const BACKEND_PORT = '3001';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const registerForPushNotificationsAsync = async () => {
  try {
    let token;

    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission de notification non accordée.');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig.extra.eas.projectId })).data;
    console.log('Token Expo pour les notifications:', token);

    return token;
  } catch (error) {
    console.error('Erreur lors de la récupération du token de notification:', error);
    return null;
  }
};

const updatePushToken = async () => {
  const expoPushToken = await registerForPushNotificationsAsync();
  const jwt = await AsyncStorage.getItem('jwtToken');

  if (expoPushToken && jwt) {
    try {
      await axios.post(
        `http://${BACKEND_IP}:${BACKEND_PORT}/users/push-token`,
        { expoPushToken },
        { headers: { authorization: jwt } }
      );
      console.log('Token de notification mis à jour sur le backend');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du token sur le backend:', error);
    }
  }
};

function HomeTabs({ route }) {
  const { phoneNumber } = route.params;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Chats') {
            iconName = 'message-text';
          } else if (route.name === 'NewChat') {
            iconName = 'account-plus';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#25D366',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Chats" component={HomeScreen} initialParams={{ phoneNumber }} />
      <Tab.Screen name="NewChat" component={NewChatScreen} initialParams={{ phoneNumber }} />
      <Tab.Screen name="Profile" component={ProfileScreen} initialParams={{ phoneNumber }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login', headerLeft: null }} />
        <Stack.Screen name="Verification" component={VerificationScreen} />
        <Stack.Screen
          name="Home"
          component={HomeTabs}
          options={{ title: 'WhatsApp', headerShown: false }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ title: 'Chat' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
