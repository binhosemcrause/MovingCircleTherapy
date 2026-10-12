import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { JosefinSans_400Regular, JosefinSans_600SemiBold } from '@expo-google-fonts/josefin-sans';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import ServicesScreen from './src/screens/ServicesScreen';
import CreativeScreen from './src/screens/CreativeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import { RootTabParamList } from './src/navigation/types';
import { colors, fonts } from './src/utils/theme';
import { hasSeenWelcome, markWelcomeSeen } from './src/utils/firstLaunch';

SplashScreen.preventAutoHideAsync();

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
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    JosefinSans_400Regular,
    JosefinSans_600SemiBold,
  });
  // null until the stored flag has been read, so the splash stays up
  // instead of flashing the welcome screen at returning users.
  const [welcomeSeen, setWelcomeSeen] = useState<boolean | null>(null);

  useEffect(() => {
    hasSeenWelcome().then(setWelcomeSeen);
  }, []);

  // A font failure falls back to system fonts rather than a stuck splash.
  const isReady = (fontsLoaded || !!fontError) && welcomeSeen !== null;

  const handleGetStarted = () => {
    setWelcomeSeen(true);
    markWelcomeSeen();
  };

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  if (!welcomeSeen) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <WelcomeScreen onGetStarted={handleGetStarted} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={getTabIconName(route.name, focused)}
                size={size}
                color={color}
              />
            ),
            tabBarActiveTintColor: colors.primaryDark,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: {
              fontFamily: fonts.body.semiBold,
              fontSize: 12,
            },
            tabBarStyle: {
              backgroundColor: colors.dominant1,
              borderTopColor: colors.border,
              borderTopWidth: 1,
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Services" component={ServicesScreen} />
          <Tab.Screen name="Creative" component={CreativeScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
