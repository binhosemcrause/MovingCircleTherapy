import Constants from 'expo-constants';

const API_PORT = 3000;

// Metro's dev server host (e.g. "192.168.1.20:8081") is on the same machine as
// the backend, so reusing its IP lets simulators, emulators, and physical
// devices on Expo Go all reach the API without hardcoding a platform-specific URL.
function resolveApiBaseUrl(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];
  return `http://${host ?? 'localhost'}:${API_PORT}/v1`;
}

export const API_BASE_URL = resolveApiBaseUrl();
