import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { CheckCircle2, Circle, Minus, AlertCircle } from 'lucide-react-native';
import type { UnifiedTaskItem } from '../../types/task.types';
import { FrequencyBadge } from './frequency-badge';
import { PriorityDot } from './priority-dot';
import { colors, spacing, borderRadius } from '../../lib/theme';

interface UnifiedTaskCardProps {
  task: UnifiedTaskItem;
  onToggleComplete: (task: UnifiedTaskItem) => void;
  onSkip?: (task: UnifiedTaskItem) => void;
  onUndoSkip?: (task: UnifiedTaskItem) => void;
  onPress?: (task: UnifiedTaskItem) => void;
  isLoading?: boolean;
}

export function UnifiedTaskCard({
  task,
  onToggleComplete,
  onSkip,
  onUndoSkip,
  onPress,
  isLoading = false,
}: UnifiedTaskCardProps) {
  const isCompleted = task.completed;
  const isSkipped = task.skipped;
  const isOverdue = task.isOverdue && !isCompleted && !isSkipped;
  const isFuture = task.isFutureProjection;

  const handleToggle = () => {
    if (isSkipped || isFuture || isLoading) return;
    onToggleComplete(task);
  };

  const renderCompletionIcon = () => {
    if (isSkipped) {
      return <Minus size={22} color={colors.subtleForeground} />;
    }
    if (isCompleted) {
      return <CheckCircle2 size={22} color={colors.primary} />;
    }
    if (isOverdue) {
      return <AlertCircle size={22} color={colors.destructive} />;
    }
    return <Circle size={22} color={colors.border} />;
  };

  const titleStyle = [
    styles.title,
    isCompleted && styles.titleCompleted,
    isSkipped && styles.titleSkipped,
  ];

  const categoryColor = task.category?.color ?? colors.subtleForeground;

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress ? () => onPress(task) : undefined}
      style={[
        styles.card,
        isCompleted && styles.cardCompleted,
        isSkipped && styles.cardSkipped,
        isOverdue && styles.cardOverdue,
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${task.title}. ${isCompleted ? 'Completed.' : isSkipped ? 'Skipped.' : 'Not done.'}`}
    >
      {/* Completion Toggle */}
      <TouchableOpacity
        onPress={handleToggle}
        style={styles.completionButton}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessible
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isCompleted }}
        accessibilityLabel={`Mark ${task.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
        disabled={isSkipped || isFuture || isLoading}
      >
        {renderCompletionIcon()}
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={titleStyle} numberOfLines={2}>
            {task.title}
          </Text>
          {task.priority !== 'NONE' && (
            <PriorityDot priority={task.priority} />
          )}
        </View>

        {/* Meta row */}
        <View style={styles.metaRow}>
          {/* Category */}
          {task.category && (
            <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
          )}

          {/* Frequency badge */}
          {task.frequency && (
            <FrequencyBadge frequency={task.frequency} small />
          )}

          {/* Due time */}
          {task.dueTime && (
            <Text style={styles.timeText}>{task.dueTime}</Text>
          )}

          {/* Overdue label */}
          {isOverdue && (
            <Text style={styles.overdueText}>Overdue</Text>
          )}

          {/* Skipped label */}
          {isSkipped && (
            <Text style={styles.skippedText}>Skipped</Text>
          )}
        </View>

        {/* Description (collapsed) */}
        {!!task.description && !isCompleted && !isSkipped && (
          <Text style={styles.description} numberOfLines={1}>
            {task.description}
          </Text>
        )}
      </View>

      {/* Right action: Skip / Undo Skip (recurring only) */}
      {task.source === 'DAILY' && task.templateId && (
        <View style={styles.rightAction}>
          {isSkipped ? (
            <TouchableOpacity
              onPress={() => onUndoSkip?.(task)}
              style={styles.actionButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Undo skip"
            >
              <Text style={styles.undoText}>Undo</Text>
            </TouchableOpacity>
          ) : (
            !isCompleted && !isFuture && (
              <TouchableOpacity
                onPress={() => onSkip?.(task)}
                style={styles.actionButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Skip for today"
              >
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      )}
    </TouchableOpacity>
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
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 64,
  },
  cardCompleted: {
    opacity: 0.6,
    borderColor: 'transparent',
  },
  cardSkipped: {
    opacity: 0.5,
    borderColor: 'transparent',
    backgroundColor: colors.card,
  },
  cardOverdue: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  completionButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
    flex: 1,
    lineHeight: 20,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.mutedForeground,
  },
  titleSkipped: {
    color: colors.subtleForeground,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    minHeight: 20,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timeText: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  overdueText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.destructive,
  },
  skippedText: {
    fontSize: 11,
    color: colors.subtleForeground,
  },
  description: {
    fontSize: 12,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
  rightAction: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  skipText: {
    fontSize: 12,
    color: colors.subtleForeground,
    fontWeight: '600',
  },
  undoText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
});
