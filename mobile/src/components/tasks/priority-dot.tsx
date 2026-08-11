import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { TaskPriority } from '../../types/task.types';

const priorityColors: Record<TaskPriority, string> = {
  URGENT: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#3b82f6',
  NONE: 'transparent',
};

interface PriorityDotProps {
  priority: TaskPriority;
}

export function PriorityDot({ priority }: PriorityDotProps) {
  const color = priorityColors[priority] || 'transparent';
  if (priority === 'NONE') return null;

  return <View style={[styles.dot, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
