import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../../lib/theme';

function SkeletonRect({
  width,
  height,
  style,
}: {
  width: number | string;
  height: number;
  style?: object;
}) {
  return (
    <View
      style={[
        styles.skeleton,
        { width: width as number, height },
        style,
      ]}
    />
  );
}

function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.checkbox} />
      <View style={styles.content}>
        <SkeletonRect width="75%" height={14} />
        <SkeletonRect width="45%" height={11} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

interface TaskSkeletonProps {
  count?: number;
}

export function TaskSkeleton({ count = 4 }: TaskSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm + 2,
    minHeight: 64,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.secondary,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  skeleton: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.sm,
  },
});
