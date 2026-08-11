import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../lib/theme';
import type { UnifiedTaskStats } from '../../types/task.types';

interface TaskStatsBarProps {
  stats: UnifiedTaskStats;
}

export function TaskStatsBar({ stats }: TaskStatsBarProps) {
  const { total, completed, skipped } = stats;
  if (total === 0 && skipped === 0) return null;

  const progress = total > 0 ? completed / total : 0;

  return (
    <View style={styles.container}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { flex: progress }]} />
      </View>
      <Text style={styles.text}>
        {completed} of {total} done
        {skipped > 0 ? ` · ${skipped} skipped` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  text: {
    fontSize: 12,
    color: colors.mutedForeground,
    minWidth: 90,
    textAlign: 'right',
  },
});
