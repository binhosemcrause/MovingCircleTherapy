import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import ServicesScreen from './src/screens/ServicesScreen';
import CreativeScreen from './src/screens/CreativeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { RootTabParamList } from './src/navigation/types';

const Tab = createBottomTabNavigator<RootTabParamList>();

type IoniconName = keyof typeof Ionicons.glyphMap;

function getTabIconName(routeName: keyof RootTabParamList, focused: boolean): IoniconName {
  switch (routeName) {
    case 'Home':
      return focused ? 'home' : 'home-outline';
    case 'Services':
      return focused ? 'medical' : 'medical-outline';
    case 'Creative':
      return focused ? 'color-palette' : 'color-palette-outline';
    case 'Profile':
      return focused ? 'person' : 'person-outline';
    default:
      return 'help-outline';
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={getTabIconName(route.name, focused)}
                size={size}
                color={color}
              />
            ),
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
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="Services"
            component={ServicesScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="Creative"
            component={CreativeScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
