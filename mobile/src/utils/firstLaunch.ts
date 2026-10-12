import AsyncStorage from '@react-native-async-storage/async-storage';

const WELCOME_SEEN_KEY = 'welcome-seen';

// Storage failures resolve to "not seen": showing the welcome screen twice
// is harmless, while a rejected read would leave the app on the splash.
export async function hasSeenWelcome(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(WELCOME_SEEN_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function markWelcomeSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(WELCOME_SEEN_KEY, 'true');
  } catch {
    // Non-fatal: the welcome screen just shows again on the next launch.
  }
}
