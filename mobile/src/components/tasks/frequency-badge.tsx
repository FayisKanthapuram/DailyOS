import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { RecurrenceFrequency } from '../../types/task.types';
import { colors, borderRadius } from '../../lib/theme';

const frequencyConfig: Record<RecurrenceFrequency, { label: string; color: string; bg: string }> = {
  DAILY: { label: '↻ Daily', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)' },
  WEEKLY: { label: '↻ Weekly', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.12)' },
  MONTHLY: { label: '↻ Monthly', color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)' },
};

interface FrequencyBadgeProps {
  frequency: RecurrenceFrequency;
  small?: boolean;
}

export function FrequencyBadge({ frequency, small = false }: FrequencyBadgeProps) {
  const config = frequencyConfig[frequency];
  if (!config) return null;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        small && styles.badgeSmall,
      ]}
    >
      <Text style={[styles.text, { color: config.color }, small && styles.textSmall]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 10,
  },
});
