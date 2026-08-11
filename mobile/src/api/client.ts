import axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios';
import { tokenStorage } from '../auth/token-storage';
import { getApiBaseUrl } from './config';

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let isRefreshing = false;
let activeRefreshPromise: Promise<string> | null = null;
let onUnauthenticatedCallback: (() => void) | null = null;

export function setUnauthenticatedHandler(handler: () => void): void {
  onUnauthenticatedCallback = handler;
}

// Request Interceptor: Attach Access Token if available
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Silent Token Refresh on 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      // Handle deduplicated concurrent refresh requests
      if (isRefreshing && activeRefreshPromise) {
        try {
          const newToken = await activeRefreshPromise;
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        } catch (refreshErr) {
          return Promise.reject(refreshErr);
        }
      }

      isRefreshing = true;

      activeRefreshPromise = (async () => {
        try {
          const refreshToken = await tokenStorage.getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const baseUrl = getApiBaseUrl();

          // Call refresh endpoint with refreshToken in body & header for maximum compatibility
          const { data } = await axios.post<{ accessToken: string; refreshToken?: string }>(
            `${baseUrl}/auth/refresh`,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
                'x-refresh-token': refreshToken,
              },
            },
          );

          const newAccessToken = data.accessToken;
          await tokenStorage.setAccessToken(newAccessToken);

          if (data.refreshToken) {
            await tokenStorage.setRefreshToken(data.refreshToken);
          }

          return newAccessToken;
        } catch (refreshErr) {
          await tokenStorage.clearAll();
          onUnauthenticatedCallback?.();
          throw refreshErr;
        } finally {
          isRefreshing = false;
          activeRefreshPromise = null;
        }
      })();

      try {
        const newAccessToken = await activeRefreshPromise;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  },
);
