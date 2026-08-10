'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Repeat2, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createTaskSchema, type CreateTaskFormValues } from '../schemas/task.schemas';
import { useCategories } from '../hooks/use-categories';
import { useTags } from '../hooks/use-tags';
import { useCreateTask, useUpdateTask } from '../hooks/use-tasks';
import { useCreateDailyTask } from '../hooks/use-daily-tasks';
import { cn } from '@/lib/utils';
import type { Task } from '../types/task.types';

const PRIORITY_OPTIONS = [
  { value: 'NONE', label: 'None' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
] as const;

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
] as const;

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  editingTask?: Task;
  defaultDate?: string;
}

export function TaskForm({ open, onClose, editingTask, defaultDate }: TaskFormProps) {
  const [taskType, setTaskType] = useState<'ONE_TIME' | 'RECURRING'>('ONE_TIME');
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const createDailyMutation = useCreateDailyTask();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'NONE',
      status: 'TODO',
      categoryId: '',
      dueDate: defaultDate ?? '',
      dueTime: '',
      tagIds: [],
    },
  });

  useEffect(() => {
    if (editingTask) {
      reset({
        title: editingTask.title,
        description: editingTask.description ?? '',
        priority: editingTask.priority,
        status: editingTask.status,
        categoryId: editingTask.categoryId ?? '',
        dueDate: editingTask.dueDate ?? '',
        dueTime: editingTask.dueTime ?? '',
        tagIds: editingTask.tags.map((t) => t.tag.id),
      });
    } else {
      reset({
        title: '',
        description: '',
        priority: 'NONE',
        status: 'TODO',
        categoryId: '',
        dueDate: defaultDate ?? '',
        dueTime: '',
        tagIds: [],
      });
    }
  }, [editingTask, defaultDate, reset, open]);

  const onSubmit = async (values: CreateTaskFormValues) => {
    if (taskType === 'RECURRING' && !editingTask) {
      await createDailyMutation.mutateAsync({
        title: values.title,
        description: values.description || undefined,
        priority: values.priority,
        frequency,
        categoryId: values.categoryId || undefined,
        time: values.dueTime || undefined,
        tagIds: values.tagIds,
      });
    } else {
      const payload = {
        title: values.title,
        description: values.description || undefined,
        priority: values.priority,
        status: values.status,
        categoryId: values.categoryId || undefined,
        dueDate: values.dueDate || undefined,
        dueTime: values.dueTime || undefined,
        tagIds: values.tagIds,
      };

      if (editingTask) {
        await updateMutation.mutateAsync({ id: editingTask.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    }

    onClose();
  };

  const labelCls = 'block text-xs font-semibold text-[hsl(var(--foreground-secondary))] mb-1.5';
  const inputCls =
    'w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] transition-colors focus:border-[hsl(var(--primary))] focus:outline-none';
  const errorCls = 'mt-1 text-xs text-[hsl(var(--destructive))]';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] w-full flex-col rounded-t-2xl border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-2xl pb-[max(1rem,env(safe-area-inset-bottom))] md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:max-w-md md:rounded-none md:border-l md:border-t-0 md:pb-0"
          >
            {/* Mobile drag handle indicator */}
            <div className="mx-auto my-2 h-1 w-12 rounded-full bg-[hsl(var(--border))] md:hidden" />

            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-3 md:py-4">
              <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h2>
              <button
                onClick={onClose}
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--foreground-muted))] transition-colors hover:bg-[hsl(var(--background-secondary))]"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-5">
              {/* Type Switcher (Creation mode only) */}
              {!editingTask && (
                <div className="mb-5 flex rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-secondary))] p-1">
                  <button
                    type="button"
                    onClick={() => setTaskType('ONE_TIME')}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all',
                      taskType === 'ONE_TIME'
                        ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-xs'
                        : 'text-[hsl(var(--foreground-muted))]',
                    )}
                  >
                    <CheckSquare size={14} />
                    One-Time Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskType('RECURRING')}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all',
                      taskType === 'RECURRING'
                        ? 'bg-[hsl(var(--background))] text-[hsl(var(--primary))] shadow-xs'
                        : 'text-[hsl(var(--foreground-muted))]',
                    )}
                  >
                    <Repeat2 size={14} />
                    Recurring Daily Habit
                  </button>
                </div>
              )}

              {taskType === 'RECURRING' && !editingTask && (
                <div className="mb-5">
                  <label className={labelCls}>Recurrence Frequency</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'DAILY', label: 'Daily', desc: 'Every day' },
                      { value: 'WEEKLY', label: 'Weekly', desc: 'Once per week' },
                      { value: 'MONTHLY', label: 'Monthly', desc: 'Once per month' },
                    ].map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFrequency(f.value as 'DAILY' | 'WEEKLY' | 'MONTHLY')}
                        className={cn(
                          'flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all',
                          frequency === f.value
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] shadow-xs font-semibold'
                            : 'border-[hsl(var(--border))] text-[hsl(var(--foreground-secondary))] hover:bg-[hsl(var(--background-secondary))]',
                        )}
                      >
                        <span className="text-xs">{f.label}</span>
                        <span className="text-[10px] opacity-70">{f.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className={labelCls}>
                    Title <span className="text-[hsl(var(--destructive))]">*</span>
                  </label>
                  <input
                    {...register('title')}
                    placeholder={
                      taskType === 'RECURRING'
                        ? 'e.g. Go to gym, Drink water'
                        : 'e.g. Finish project proposal'
                    }
                    className={inputCls}
                    autoFocus
                  />
                  {errors.title && <p className={errorCls}>{errors.title.message}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    {...register('description')}
                    rows={2}
                    placeholder="Optional notes or context..."
                    className={inputCls}
                  />
                </div>

                {/* Priority & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Priority</label>
                    <select {...register('priority')} className={inputCls}>
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {taskType === 'ONE_TIME' && (
                    <div>
                      <label className={labelCls}>Status</label>
                      <select {...register('status')} className={inputCls}>
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className={labelCls}>Category</label>
                  <select {...register('categoryId')} className={inputCls}>
                    <option value="">No category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date & Time (One-Time Task) or Target Time (Recurring Habit) */}
                <div className="grid grid-cols-2 gap-3">
                  {taskType === 'ONE_TIME' && (
                    <div>
                      <label className={labelCls}>Due Date</label>
                      <input type="date" {...register('dueDate')} className={inputCls} />
                    </div>
                  )}

                  <div>
                    <label className={labelCls}>
                      {taskType === 'RECURRING' ? 'Target Time (Optional)' : 'Due Time (Optional)'}
                    </label>
                    <input type="time" {...register('dueTime')} className={inputCls} />
                  </div>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div>
                    <label className={labelCls}>Tags</label>
                    <Controller
                      name="tagIds"
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-wrap gap-1.5">
                          {tags.map((tag) => {
                            const isSelected = field.value?.includes(tag.id);
                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => {
                                  const current = field.value || [];
                                  field.onChange(
                                    isSelected
                                      ? current.filter((id) => id !== tag.id)
                                      : [...current, tag.id],
                                  );
                                }}
                                className={cn(
                                  'rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
                                  isSelected
                                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                                    : 'border border-[hsl(var(--border))] text-[hsl(var(--foreground-secondary))] hover:bg-[hsl(var(--background-secondary))]',
                                )}
                              >
                                {tag.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-[hsl(var(--border))] pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-xs font-medium text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--background-secondary))]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-xs font-medium text-[hsl(var(--primary-foreground))] shadow-xs transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
