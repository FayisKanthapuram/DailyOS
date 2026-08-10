import axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios';
import { tokenStore } from './token-store';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let activeRefreshPromise: Promise<string> | null = null;

// Request Interceptor: Attach Access Token if present
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Silent Token Refresh on 401 Unauthorized
api.interceptors.response.use(
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

      if (isRefreshing && activeRefreshPromise) {
        try {
          const newToken = await activeRefreshPromise;
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        } catch (refreshErr) {
          return Promise.reject(refreshErr);
        }
      }

      isRefreshing = true;

      activeRefreshPromise = (async () => {
        try {
          const { data } = await axios.post<{ accessToken: string }>(
            '/api/auth/refresh',
            {},
            { withCredentials: true },
          );
          const newAccessToken = data.accessToken;
          tokenStore.setAccessToken(newAccessToken);
          return newAccessToken;
        } catch (refreshErr) {
          tokenStore.clearAccessToken();
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
        return api(originalRequest);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  },
);
