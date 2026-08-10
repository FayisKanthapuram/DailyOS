import { api } from '@/lib/api';
import { tokenStore } from '@/lib/token-store';
import type { User, AuthResponse, RegisterPayload, LoginPayload } from '../types/auth.types';

let pendingRefreshPromise: Promise<AuthResponse> | null = null;

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const userTimezone =
      payload.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const { data } = await api.post<AuthResponse>('/auth/register', {
      ...payload,
      timezone: userTimezone,
    });
    tokenStore.setAccessToken(data.accessToken);
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    tokenStore.setAccessToken(data.accessToken);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      tokenStore.clearAccessToken();
    }
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  /**
   * Performs silent token refresh.
   * Deduplicates concurrent calls so only ONE network request is sent at any time.
   */
  refreshToken(): Promise<AuthResponse> {
    if (pendingRefreshPromise) {
      return pendingRefreshPromise;
    }

    pendingRefreshPromise = (async () => {
      try {
        const { data } = await api.post<AuthResponse>('/auth/refresh');
        tokenStore.setAccessToken(data.accessToken);
        return data;
      } finally {
        pendingRefreshPromise = null;
      }
    })();

    return pendingRefreshPromise;
  },
};
