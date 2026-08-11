import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/lib/query-client';
import { useAuthStore } from '../src/auth/auth.store';
import { authService } from '../src/auth/auth.service';
import { LoadingState } from '../src/components/ui/loading-state';

function NavigationGuard() {
  const { isAuthenticated, isInitializing } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Restore session on app boot
    authService.restoreSession();
  }, []);

  useEffect(() => {
    if (isInitializing) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if user is not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app dashboard if user is authenticated
      router.replace('/(app)');
    }
  }, [isAuthenticated, isInitializing, segments, router]);

  if (isInitializing) {
    return <LoadingState message="Starting DailyOS..." />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0f172a' },
        animation: 'fade',
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor="#0f172a" />
        <NavigationGuard />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
