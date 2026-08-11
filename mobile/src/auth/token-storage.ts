import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'dailyos_access_token';
const REFRESH_TOKEN_KEY = 'dailyos_refresh_token';

// In-memory fallback for environments where SecureStore is unavailable
const memoryStore = new Map<string, string>();

async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      memoryStore.set(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  } catch (error) {
    console.warn(`[TokenStorage] Failed to set item ${key}:`, error);
    memoryStore.set(key, value);
  }
}

async function getSecureItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return memoryStore.get(key) ?? null;
    }
    const item = await SecureStore.getItemAsync(key);
    return item ?? memoryStore.get(key) ?? null;
  } catch (error) {
    console.warn(`[TokenStorage] Failed to get item ${key}:`, error);
    return memoryStore.get(key) ?? null;
  }
}

async function deleteSecureItem(key: string): Promise<void> {
  try {
    memoryStore.delete(key);
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.warn(`[TokenStorage] Failed to delete item ${key}:`, error);
  }
}

export const tokenStorage = {
  // Access Token
  async setAccessToken(token: string): Promise<void> {
    await setSecureItem(ACCESS_TOKEN_KEY, token);
  },

  async getAccessToken(): Promise<string | null> {
    return getSecureItem(ACCESS_TOKEN_KEY);
  },

  async removeAccessToken(): Promise<void> {
    await deleteSecureItem(ACCESS_TOKEN_KEY);
  },

  // Refresh Token
  async setRefreshToken(token: string): Promise<void> {
    await setSecureItem(REFRESH_TOKEN_KEY, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return getSecureItem(REFRESH_TOKEN_KEY);
  },

  async removeRefreshToken(): Promise<void> {
    await deleteSecureItem(REFRESH_TOKEN_KEY);
  },

  // Clear All
  async clearAll(): Promise<void> {
    await Promise.all([
      deleteSecureItem(ACCESS_TOKEN_KEY),
      deleteSecureItem(REFRESH_TOKEN_KEY),
    ]);
  },
};
