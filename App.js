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

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs({ route }) {
  // Récupère le phoneNumber depuis la route.params
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
      {/* On passe phoneNumber en tant que prop à HomeScreen */}
      <Tab.Screen name="Chats" component={HomeScreen} initialParams={{ phoneNumber }} />
      <Tab.Screen name="NewChat" component={NewChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} initialParams={{ phoneNumber }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login', headerLeft: null  }} />
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
