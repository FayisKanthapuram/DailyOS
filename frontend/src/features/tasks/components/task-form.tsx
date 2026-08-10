'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createTaskSchema, type CreateTaskFormValues } from '../schemas/task.schemas';
import { useCategories } from '../hooks/use-categories';
import { useTags } from '../hooks/use-tags';
import { useCreateTask, useUpdateTask } from '../hooks/use-tasks';
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
}

export function TaskForm({ open, onClose, editingTask }: TaskFormProps) {
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();

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
      dueDate: '',
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
        dueDate: '',
        dueTime: '',
        tagIds: [],
      });
    }
  }, [editingTask, reset, open]);

  const onSubmit = async (values: CreateTaskFormValues) => {
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
    onClose();
  };

  const inputCls =
    'w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder-[hsl(var(--foreground-muted))] outline-none focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary)/0.3)] transition-all';
  const labelCls = 'block text-xs font-medium text-[hsl(var(--foreground-secondary))] mb-1';
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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-4">
              <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--foreground-muted))] transition-colors hover:bg-[hsl(var(--background-secondary))]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-5">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className={labelCls}>
                    Title <span className="text-[hsl(var(--destructive))]">*</span>
                  </label>
                  <input
                    {...register('title')}
                    className={inputCls}
                    placeholder="Task title..."
                    autoFocus
                  />
                  {errors.title && <p className={errorCls}>{errors.title.message}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    {...register('description')}
                    className={`${inputCls} resize-none`}
                    placeholder="Optional details..."
                    rows={3}
                  />
                </div>

                {/* Status & Priority row */}
                <div className="grid grid-cols-2 gap-3">
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
                </div>

                {/* Category */}
                <div>
                  <label className={labelCls}>Category</label>
                  <select {...register('categoryId')} className={inputCls}>
                    <option value="">No category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due date & time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Due date</label>
                    <input {...register('dueDate')} type="date" className={inputCls} />
                    {errors.dueDate && <p className={errorCls}>{errors.dueDate.message}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Due time</label>
                    <input {...register('dueTime')} type="time" className={inputCls} />
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
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => {
                            const selected = field.value?.includes(tag.id);
                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => {
                                  const current = field.value ?? [];
                                  field.onChange(
                                    selected
                                      ? current.filter((id) => id !== tag.id)
                                      : [...current, tag.id],
                                  );
                                }}
                                className="rounded-full px-2.5 py-1 text-xs font-medium transition-all"
                                style={{
                                  backgroundColor: selected ? `${tag.color}33` : `${tag.color}11`,
                                  color: tag.color,
                                  border: `1px solid ${selected ? tag.color : `${tag.color}44`}`,
                                }}
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

              <div className="mt-6 flex items-center gap-3 border-t border-[hsl(var(--border))] pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg bg-[hsl(var(--primary))] py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-sm text-[hsl(var(--foreground-secondary))] transition-colors hover:bg-[hsl(var(--background-secondary))]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
