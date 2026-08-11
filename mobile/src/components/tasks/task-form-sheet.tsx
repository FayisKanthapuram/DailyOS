import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Switch,
} from 'react-native';
import { X, ChevronDown } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { colors, spacing, borderRadius } from '../../lib/theme';
import type {
  TaskPriority,
  RecurrenceFrequency,
  CreateNormalTaskDto,
  CreateRecurringTaskDto,
} from '../../types/task.types';

type TaskType = 'ONE_TIME' | 'RECURRING';

const PRIORITIES: { label: string; value: TaskPriority; color: string }[] = [
  { label: 'None', value: 'NONE', color: colors.subtleForeground },
  { label: 'Low', value: 'LOW', color: '#3b82f6' },
  { label: 'Medium', value: 'MEDIUM', color: '#eab308' },
  { label: 'High', value: 'HIGH', color: '#f97316' },
  { label: 'Urgent', value: 'URGENT', color: '#ef4444' },
];

const FREQUENCIES: { label: string; value: RecurrenceFrequency; desc: string }[] = [
  { label: 'Daily', value: 'DAILY', desc: 'Every day' },
  { label: 'Weekly', value: 'WEEKLY', desc: 'Once a week' },
  { label: 'Monthly', value: 'MONTHLY', desc: 'Once a month' },
];

interface TaskFormSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateNormalTaskDto | CreateRecurringTaskDto, type: TaskType) => Promise<void>;
  selectedDate: string;
  isSubmitting?: boolean;
}

export function TaskFormSheet({
  visible,
  onClose,
  onSubmit,
  selectedDate,
  isSubmitting = false,
}: TaskFormSheetProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('ONE_TIME');
  const [priority, setPriority] = useState<TaskPriority>('NONE');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('DAILY');
  const [dueDate, setDueDate] = useState(selectedDate);
  const [dueTime, setDueTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setTaskType('ONE_TIME');
    setPriority('NONE');
    setFrequency('DAILY');
    setDueDate(selectedDate);
    setDueTime('');
    setError(null);
  }, [selectedDate]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please enter a task title.');
      return;
    }

    setError(null);

    try {
      if (taskType === 'RECURRING') {
        const dto: CreateRecurringTaskDto = {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          frequency,
          time: dueTime || undefined,
        };
        await onSubmit(dto, 'RECURRING');
      } else {
        const dto: CreateNormalTaskDto = {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          dueDate: dueDate || selectedDate,
          dueTime: dueTime || undefined,
        };
        await onSubmit(dto, 'ONE_TIME');
      }
      handleClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.message)
          ? err.response.data.message[0]
          : null) ||
        'Failed to create task. Please try again.';
      setError(typeof msg === 'string' ? msg : 'Failed to create task.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.inner}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>New Task</Text>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessible
                  accessibilityLabel="Close"
                >
                  <X size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Error Banner */}
                {error && (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {/* Task Type Toggle */}
                <View style={styles.typeToggle}>
                  <TouchableOpacity
                    style={[styles.typeTab, taskType === 'ONE_TIME' && styles.typeTabActive]}
                    onPress={() => setTaskType('ONE_TIME')}
                    accessible
                    accessibilityRole="tab"
                    accessibilityState={{ selected: taskType === 'ONE_TIME' }}
                  >
                    <Text
                      style={[
                        styles.typeTabText,
                        taskType === 'ONE_TIME' && styles.typeTabTextActive,
                      ]}
                    >
                      One-Time
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeTab, taskType === 'RECURRING' && styles.typeTabActive]}
                    onPress={() => setTaskType('RECURRING')}
                    accessible
                    accessibilityRole="tab"
                    accessibilityState={{ selected: taskType === 'RECURRING' }}
                  >
                    <Text
                      style={[
                        styles.typeTabText,
                        taskType === 'RECURRING' && styles.typeTabTextActive,
                      ]}
                    >
                      Recurring ↻
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Title */}
                <Input
                  label="Task Title *"
                  placeholder="What needs to be done?"
                  value={title}
                  onChangeText={setTitle}
                  autoFocus
                  returnKeyType="next"
                />

                {/* Description */}
                <Input
                  label="Description"
                  placeholder="Optional notes or details..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  style={styles.textArea}
                />

                {/* Priority Selector */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Priority</Text>
                  <View style={styles.pillRow}>
                    {PRIORITIES.map((p) => (
                      <TouchableOpacity
                        key={p.value}
                        style={[
                          styles.pill,
                          priority === p.value && {
                            backgroundColor: p.color + '22',
                            borderColor: p.color,
                          },
                        ]}
                        onPress={() => setPriority(p.value)}
                        accessible
                        accessibilityRole="radio"
                        accessibilityState={{ checked: priority === p.value }}
                        accessibilityLabel={p.label + ' priority'}
                      >
                        <View
                          style={[
                            styles.priorityDot,
                            { backgroundColor: priority === p.value ? p.color : colors.border },
                          ]}
                        />
                        <Text
                          style={[
                            styles.pillText,
                            priority === p.value && { color: p.color, fontWeight: '600' },
                          ]}
                        >
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Frequency (Recurring only) */}
                {taskType === 'RECURRING' && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Recurrence</Text>
                    <View style={styles.freqRow}>
                      {FREQUENCIES.map((f) => (
                        <TouchableOpacity
                          key={f.value}
                          style={[
                            styles.freqCard,
                            frequency === f.value && styles.freqCardActive,
                          ]}
                          onPress={() => setFrequency(f.value)}
                          accessible
                          accessibilityRole="radio"
                          accessibilityState={{ checked: frequency === f.value }}
                          accessibilityLabel={`${f.label}: ${f.desc}`}
                        >
                          <Text
                            style={[
                              styles.freqLabel,
                              frequency === f.value && styles.freqLabelActive,
                            ]}
                          >
                            {f.label}
                          </Text>
                          <Text style={styles.freqDesc}>{f.desc}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Due Date (One-time only) */}
                {taskType === 'ONE_TIME' && (
                  <Input
                    label="Due Date"
                    placeholder="YYYY-MM-DD"
                    value={dueDate}
                    onChangeText={setDueDate}
                    keyboardType="numeric"
                  />
                )}

                {/* Due Time */}
                <Input
                  label={taskType === 'RECURRING' ? 'Time (optional)' : 'Due Time (optional)'}
                  placeholder="HH:MM (e.g. 09:00)"
                  value={dueTime}
                  onChangeText={setDueTime}
                  keyboardType="numeric"
                />
              </ScrollView>

              {/* Footer Actions */}
              <View style={styles.footer}>
                <Button variant="outline" onPress={handleClose} style={styles.footerBtn}>
                  Cancel
                </Button>
                <Button
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  style={styles.footerBtn}
                >
                  {taskType === 'RECURRING' ? 'Create Habit' : 'Create Task'}
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.foreground,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: colors.destructive,
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 13,
    textAlign: 'center',
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.md,
  },
  typeTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md - 2,
  },
  typeTabActive: {
    backgroundColor: colors.primary,
  },
  typeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  typeTabTextActive: {
    color: '#ffffff',
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: spacing.xs + 2,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  freqRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  freqCard: {
    flex: 1,
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    gap: 2,
  },
  freqCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  freqLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  freqLabelActive: {
    color: colors.primary,
  },
  freqDesc: {
    fontSize: 10,
    color: colors.subtleForeground,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerBtn: {
    flex: 1,
  },
});
