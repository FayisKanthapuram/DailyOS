import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings2,
} from 'lucide-react-native';

import { UnifiedTaskCard } from '../../src/components/tasks/unified-task-card';
import { TaskSkeleton } from '../../src/components/tasks/task-skeleton';
import { TaskErrorState } from '../../src/components/tasks/task-error-state';
import { TaskStatsBar } from '../../src/components/tasks/task-stats-bar';
import { TaskFormSheet } from '../../src/components/tasks/task-form-sheet';
import { HabitManagementSheet } from '../../src/components/tasks/habit-management-sheet';
import { colors, spacing, borderRadius } from '../../src/lib/theme';

import {
  useUnifiedTasks,
  useCompleteTask,
  useCompleteInstance,
  useSkipOccurrence,
  useUndoSkip,
  useCreateTask,
  useCreateTemplate,
  useUpdateTemplate,
  useDeactivateTemplate,
  useDeleteTemplatePermanently,
  useTemplates,
} from '../../src/hooks/use-tasks';
import type {
  UnifiedTaskItem,
  DailyTaskTemplate,
  CreateNormalTaskDto,
  CreateRecurringTaskDto,
} from '../../src/types/task.types';

// ── Date helpers ──────────────────────────────────────────────────────────────

function getLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return getLocalDateString(d);
}

function formatDateHeader(dateStr: string, today: string): { line1: string; line2: string } {
  const isToday = dateStr === today;
  const isTomorrow = dateStr === addDays(today, 1);
  const isYesterday = dateStr === addDays(today, -1);

  const d = new Date(dateStr + 'T12:00:00');
  const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  if (isToday) return { line1: 'Today', line2: `${dayName}, ${monthDay}` };
  if (isTomorrow) return { line1: 'Tomorrow', line2: `${dayName}, ${monthDay}` };
  if (isYesterday) return { line1: 'Yesterday', line2: `${dayName}, ${monthDay}` };
  return { line1: dayName, line2: monthDay };
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function TasksScreen() {
  const todayStr = getLocalDateString(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [showForm, setShowForm] = useState(false);
  const [showHabits, setShowHabits] = useState(false);

  // Queries
  const { data, isLoading, isError, refetch, isRefetching } = useUnifiedTasks(selectedDate);
  const { data: templates = [], isLoading: isLoadingTemplates } = useTemplates(true);

  // Mutations — normal tasks
  const createTask = useCreateTask(selectedDate);
  const completeTask = useCompleteTask(selectedDate);
  const completeInstance = useCompleteInstance(selectedDate);

  // Mutations — skip
  const skipOccurrence = useSkipOccurrence(selectedDate);
  const undoSkip = useUndoSkip(selectedDate);

  // Mutations — recurring templates
  const createTemplate = useCreateTemplate(selectedDate);
  const updateTemplate = useUpdateTemplate();
  const deactivateTemplate = useDeactivateTemplate();
  const deletePermanently = useDeleteTemplatePermanently();

  const isCreating = createTask.isPending || createTemplate.isPending;

  // Date navigation
  const goToPrev = useCallback(() => setSelectedDate((d) => addDays(d, -1)), []);
  const goToNext = useCallback(() => setSelectedDate((d) => addDays(d, 1)), []);
  const goToToday = useCallback(() => setSelectedDate(todayStr), [todayStr]);

  const today = data?.today ?? todayStr;
  const { line1, line2 } = formatDateHeader(selectedDate, today);
  const isToday = selectedDate === today;

  // Task handlers
  const handleToggleComplete = useCallback(
    (task: UnifiedTaskItem) => {
      if (task.source === 'NORMAL') {
        completeTask.mutate({ taskItem: task });
      } else {
        if (task.isFutureProjection) {
          // Future projections: no instance yet — show info
          Alert.alert('Upcoming', 'This is a future task occurrence. You can complete it on that day.');
          return;
        }
        if (!task.instanceId) {
          Alert.alert(
            'Not available',
            'No task instance exists for this date yet. Pull to refresh.',
          );
          return;
        }
        completeInstance.mutate({ taskItem: task });
      }
    },
    [completeTask, completeInstance],
  );

  const handleSkip = useCallback(
    (task: UnifiedTaskItem) => {
      if (!task.templateId) return;
      skipOccurrence.mutate({ templateId: task.templateId });
    },
    [skipOccurrence],
  );

  const handleUndoSkip = useCallback(
    (task: UnifiedTaskItem) => {
      if (!task.templateId) return;
      undoSkip.mutate({ templateId: task.templateId });
    },
    [undoSkip],
  );

  // Form submit handler
  const handleFormSubmit = useCallback(
    async (dto: CreateNormalTaskDto | CreateRecurringTaskDto, type: 'ONE_TIME' | 'RECURRING') => {
      if (type === 'RECURRING') {
        await createTemplate.mutateAsync(dto as CreateRecurringTaskDto);
      } else {
        await createTask.mutateAsync(dto as CreateNormalTaskDto);
      }
    },
    [createTask, createTemplate],
  );

  // Habit management handlers
  const handleDeactivate = useCallback(
    (templateId: string) => {
      deactivateTemplate.mutate(templateId);
    },
    [deactivateTemplate],
  );

  const handleReactivate = useCallback(
    (templateId: string) => {
      updateTemplate.mutate({ templateId, dto: { isActive: true } });
    },
    [updateTemplate],
  );

  const handleDeletePermanently = useCallback(
    (templateId: string) => {
      deletePermanently.mutate(templateId);
    },
    [deletePermanently],
  );

  const handleEditTemplate = useCallback((template: DailyTaskTemplate) => {
    // TODO Phase 3: open edit sheet pre-populated
    Alert.alert('Edit Habit', `Editing "${template.title}" will be available in the next update.`);
  }, []);

  const tasks = data?.tasks ?? [];
  const stats = data?.stats;

  const renderItem = useCallback(
    ({ item }: { item: UnifiedTaskItem }) => (
      <UnifiedTaskCard
        task={item}
        onToggleComplete={handleToggleComplete}
        onSkip={handleSkip}
        onUndoSkip={handleUndoSkip}
      />
    ),
    [handleToggleComplete, handleSkip, handleUndoSkip],
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    if (isError) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>
          {isToday ? 'Nothing planned for today' : `No tasks for ${line2}`}
        </Text>
        <Text style={styles.emptyDesc}>Enjoy the clear schedule.</Text>
        <TouchableOpacity
          style={styles.emptyAddButton}
          onPress={() => setShowForm(true)}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Add a new task"
        >
          <Plus size={16} color={colors.primary} />
          <Text style={styles.emptyAddText}>New Task</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      {/* Date Navigation */}
      <View style={styles.dateNav}>
        <TouchableOpacity
          onPress={goToPrev}
          style={styles.navButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessible
          accessibilityLabel="Previous day"
        >
          <ChevronLeft size={22} color={colors.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goToToday}
          style={styles.dateCenter}
          accessible
          accessibilityLabel={`${line1}, ${line2}. Tap to go to today.`}
        >
          <Text style={styles.dateLine1}>{line1}</Text>
          <Text style={styles.dateLine2}>{line2}</Text>
          {!isToday && (
            <View style={styles.todayPill}>
              <Text style={styles.todayPillText}>Today</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goToNext}
          style={styles.navButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessible
          accessibilityLabel="Next day"
        >
          <ChevronRight size={22} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
      {stats && <TaskStatsBar stats={stats} />}

      {/* Divider */}
      <View style={styles.divider} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Screen Header */}
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Tasks</Text>
        <TouchableOpacity
          onPress={() => setShowHabits(true)}
          style={styles.habitsButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessible
          accessibilityLabel="Manage recurring habits"
        >
          <Settings2 size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Error state */}
      {isError && !isLoading && (
        <TaskErrorState onRetry={() => void refetch()} />
      )}

      {/* Loading skeletons */}
      {isLoading && !isError && (
        <View style={styles.skeletonContainer}>
          {renderHeader()}
          <TaskSkeleton count={4} />
        </View>
      )}

      {/* Task list */}
      {!isLoading && (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
          maxToRenderPerBatch={16}
          windowSize={5}
        />
      )}

      {/* FAB */}
      {!showForm && !showHabits && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowForm(true)}
          activeOpacity={0.85}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Add new task"
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Task Form Sheet */}
      <TaskFormSheet
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
        selectedDate={selectedDate}
        isSubmitting={isCreating}
      />

      {/* Habit Management Sheet */}
      <HabitManagementSheet
        visible={showHabits}
        onClose={() => setShowHabits(false)}
        templates={templates}
        isLoading={isLoadingTemplates}
        onDeactivate={handleDeactivate}
        onReactivate={handleReactivate}
        onDeletePermanently={handleDeletePermanently}
        onEdit={handleEditTemplate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.foreground,
  },
  habitsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  dateLine1: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
  },
  dateLine2: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  todayPill: {
    marginTop: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  todayPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  listContent: {
    paddingBottom: 100,
  },
  skeletonContainer: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  emptyAddText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
