// Holds the signed-in user's access token for the lifetime of the app
// session. In-memory only — there's no rehydration on app restart, matching
// how the rest of the app's auth state (ProfileScreen's isLoggedIn) already
// resets on every launch. apiFetch (client.ts) reads this to attach
// Authorization headers automatically.
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearSession(): void {
  accessToken = null;
}
