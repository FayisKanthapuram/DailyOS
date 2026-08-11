import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../auth/auth.store';
import { authService } from '../auth/auth.service';
import type { LoginPayload, RegisterPayload } from '../types/auth.types';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
  });

  return {
    user,
    isAuthenticated,
    isInitializing,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
