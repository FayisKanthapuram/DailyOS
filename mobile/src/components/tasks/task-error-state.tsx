import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../../lib/theme';

interface TaskErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function TaskErrorState({
  title = "Couldn't load your tasks",
  message = 'Check your connection and try again.',
  onRetry,
}: TaskErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBadge}>
        <WifiOff size={24} color={colors.mutedForeground} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.7}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <RefreshCw size={14} color={colors.primary} />
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  retryText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
