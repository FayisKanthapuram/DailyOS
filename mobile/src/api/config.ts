import { Platform } from 'react-native';

/**
 * Resolves and normalizes the API Base URL for the mobile application.
 *
 * Rules:
 * 1. Reads `process.env.EXPO_PUBLIC_API_URL`.
 * 2. If missing, throws a clear developer-friendly error — prevents accidental production backend usage.
 * 3. Safely strips trailing slashes.
 * 4. Automatically maps `localhost` → `10.0.2.2` when running on Android Emulator.
 * 5. Logs resolved URL in development (no secrets).
 */
export function getApiBaseUrl(): string {
  const rawUrl = process.env.EXPO_PUBLIC_API_URL;

  if (!rawUrl || !rawUrl.trim()) {
    const errorMsg =
      '\n❌ [DailyOS Mobile] Missing EXPO_PUBLIC_API_URL environment variable.\n' +
      '   Please create a mobile/.env.local file with your target backend URL.\n\n' +
      '   Examples:\n' +
      '   - iOS Simulator / Expo Web:  EXPO_PUBLIC_API_URL=http://localhost:3001/api\n' +
      '   - Android Emulator:          EXPO_PUBLIC_API_URL=http://10.0.2.2:3001/api\n' +
      '   - Physical Device (LAN):     EXPO_PUBLIC_API_URL=http://192.168.x.x:3001/api\n' +
      '   - Deployed Production:       EXPO_PUBLIC_API_URL=https://dailyos-api.onrender.com/api\n';
    console.error(errorMsg);
    throw new Error('EXPO_PUBLIC_API_URL is missing. Check mobile/.env.local.');
  }

  let normalizedUrl = rawUrl.trim().replace(/\/+$/, '');

  // Android Emulator: automatically remap localhost → 10.0.2.2 (the host machine)
  if (Platform.OS === 'android' && normalizedUrl.includes('localhost')) {
    normalizedUrl = normalizedUrl.replace('localhost', '10.0.2.2');
  }

  if (__DEV__) {
    console.log(`[DailyOS API] Connecting to: ${normalizedUrl} (platform: ${Platform.OS})`);
  }

  return normalizedUrl;
}
