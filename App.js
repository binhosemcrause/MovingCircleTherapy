import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { auth } from './src/utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ServicesScreen from './src/screens/ServicesScreen';
import BookScreen from './src/screens/BookScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Services') {
          iconName = focused ? 'medical' : 'medical-outline';
        } else if (route.name === 'Book') {
          iconName = focused ? 'calendar' : 'calendar-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#F2A477',
      tabBarInactiveTintColor: '#8DB4D6',
      tabBarStyle: {
        backgroundColor: '#FEFAF5',
        borderTopColor: '#8DB4D6',
        borderTopWidth: 1,
      },
      headerStyle: {
        backgroundColor: '#FEFAF5',
      },
      headerTintColor: '#8DB4D6',
      headerTitleStyle: {
        fontFamily: 'JosefinSans-Bold',
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Moving Circle Therapy' }} />
    <Tab.Screen name="Services" component={ServicesScreen} options={{ title: 'Our Services' }} />
    <Tab.Screen name="Book" component={BookScreen} options={{ title: 'Book Appointment' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
  </Tab.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
