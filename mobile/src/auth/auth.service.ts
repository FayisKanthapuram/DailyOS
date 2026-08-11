import { apiClient, setUnauthenticatedHandler } from '../api/client';
import { tokenStorage } from './token-storage';
import { useAuthStore } from './auth.store';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth.types';

// Wire up API client 401 callback to clear Zustand auth state
setUnauthenticatedHandler(() => {
  useAuthStore.getState().clearAuth();
});

export const authService = {
  /**
   * Log in with email and password
   */
  async login(payload: LoginPayload): Promise<User> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);

    await tokenStorage.setAccessToken(data.accessToken);
    if (data.refreshToken) {
      await tokenStorage.setRefreshToken(data.refreshToken);
    }

    useAuthStore.getState().setAuth(data.user, data.accessToken);
    return data.user;
  },

  /**
   * Register a new user account
   */
  async register(payload: RegisterPayload): Promise<User> {
    const userTimezone =
      payload.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    const { data } = await apiClient.post<AuthResponse>('/auth/register', {
      ...payload,
      timezone: userTimezone,
    });

    await tokenStorage.setAccessToken(data.accessToken);
    if (data.refreshToken) {
      await tokenStorage.setRefreshToken(data.refreshToken);
    }

    useAuthStore.getState().setAuth(data.user, data.accessToken);
    return data.user;
  },

  /**
   * Fetch current authenticated user profile
   */
  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me');
    useAuthStore.getState().setUser(data);
    return data;
  },

  /**
   * Restore user authentication session on app boot
   */
  async restoreSession(): Promise<boolean> {
    const store = useAuthStore.getState();
    store.setInitializing(true);

    try {
      const accessToken = await tokenStorage.getAccessToken();
      if (!accessToken) {
        // Try refreshing with stored refresh token if access token is missing
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) {
          store.clearAuth();
          return false;
        }
      }

      // Fetch user profile to validate session
      const user = await authService.getMe();
      const token = (await tokenStorage.getAccessToken()) || '';
      store.setAuth(user, token);
      return true;
    } catch {
      await tokenStorage.clearAll();
      store.clearAuth();
      return false;
    } finally {
      store.setInitializing(false);
    }
  },

  /**
   * Log out current user and clear secure token storage
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    } finally {
      await tokenStorage.clearAll();
      useAuthStore.getState().clearAuth();
    }
  },
};
