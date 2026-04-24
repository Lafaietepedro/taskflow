import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'taskflow-field-session';

export async function loadSession() {
  const rawSession = await SecureStore.getItemAsync(SESSION_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession);
  } catch (_error) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return null;
  }
}

export async function saveSession(session) {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
