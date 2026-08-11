/**
 * DailyOS Mobile — Theme Design System
 * Matches the DailyOS Web dark mode design language.
 */

export const colors = {
  // Backgrounds
  background: '#0f172a', // slate-900
  card: '#1e293b',       // slate-800
  cardHover: '#334155',  // slate-700
  popover: '#1e293b',

  // Foregrounds / Text
  foreground: '#f8fafc', // slate-50
  mutedForeground: '#94a3b8', // slate-400
  subtleForeground: '#64748b', // slate-500

  // Primary Action Accent
  primary: '#3b82f6', // blue-500
  primaryForeground: '#ffffff',
  primaryMuted: 'rgba(59, 130, 246, 0.15)',

  // Secondary
  secondary: '#334155',
  secondaryForeground: '#f8fafc',

  // Status & Priority Colors
  destructive: '#ef4444', // red-500
  destructiveMuted: 'rgba(239, 68, 68, 0.15)',
  success: '#10b981', // emerald-500
  successMuted: 'rgba(16, 185, 129, 0.15)',
  warning: '#f59e0b', // amber-500
  warningMuted: 'rgba(245, 158, 11, 0.15)',

  // Priorities
  priorityP1: '#ef4444', // Urgent / P1
  priorityP2: '#f97316', // High / P2
  priorityP3: '#3b82f6', // Normal / P3
  priorityP4: '#64748b', // Low / P4

  // Borders & Inputs
  border: '#334155',
  input: '#1e293b',
  ring: '#3b82f6',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
};

export const theme = {
  colors,
  spacing,
  borderRadius,
};

export type Theme = typeof theme;
