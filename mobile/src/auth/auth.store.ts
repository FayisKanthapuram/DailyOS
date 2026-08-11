import { create } from 'zustand';
import type { User } from '../types/auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setUser: (user: User | null) => void;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  setInitializing: (isInitializing: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setAuth: (user, accessToken) =>
    set({
      user,
      isAuthenticated: true,
      isInitializing: false,
    }),

  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      isInitializing: false,
    }),

  setInitializing: (isInitializing) =>
    set({
      isInitializing,
    }),
}));
