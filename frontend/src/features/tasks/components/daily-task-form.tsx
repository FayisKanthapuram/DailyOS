'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createDailyTaskSchema, type CreateDailyTaskFormValues } from '../schemas/task.schemas';
import { useCategories } from '../hooks/use-categories';
import { useTags } from '../hooks/use-tags';
import { useCreateDailyTask, useUpdateDailyTask } from '../hooks/use-daily-tasks';
import type { DailyTaskTemplate } from '../types/task.types';

const PRIORITY_OPTIONS = [
  { value: 'NONE', label: 'None' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
] as const;

interface DailyTaskFormProps {
  open: boolean;
  onClose: () => void;
  editingTemplate?: DailyTaskTemplate;
}

export function DailyTaskForm({ open, onClose, editingTemplate }: DailyTaskFormProps) {
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();
  const createMutation = useCreateDailyTask();
  const updateMutation = useUpdateDailyTask();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateDailyTaskFormValues>({
    resolver: zodResolver(createDailyTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'NONE',
      categoryId: '',
      time: '',
      tagIds: [],
    },
  });

  useEffect(() => {
    if (editingTemplate) {
      reset({
        title: editingTemplate.title,
        description: editingTemplate.description ?? '',
        priority: editingTemplate.priority,
        categoryId: editingTemplate.categoryId ?? '',
        time: editingTemplate.time ?? '',
        tagIds: editingTemplate.tags.map((t) => t.tag.id),
      });
    } else {
      reset({
        title: '',
        description: '',
        priority: 'NONE',
        categoryId: '',
        time: '',
        tagIds: [],
      });
    }
  }, [editingTemplate, reset, open]);

  const onSubmit = async (values: CreateDailyTaskFormValues) => {
    const payload = {
      title: values.title,
      description: values.description || undefined,
      priority: values.priority,
      categoryId: values.categoryId || undefined,
      time: values.time || undefined,
      tagIds: values.tagIds,
    };

    if (editingTemplate) {
      await updateMutation.mutateAsync({ id: editingTemplate.id, payload });
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-4">
              <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
                {editingTemplate ? 'Edit Daily Task' : 'New Daily Task'}
              </h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--foreground-muted))] transition-colors hover:bg-[hsl(var(--background-secondary))]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
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
                    placeholder="e.g. Morning workout"
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

                {/* Priority */}
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

                {/* Time */}
                <div>
                  <label className={labelCls}>Target time (optional)</label>
                  <input
                    {...register('time')}
                    type="time"
                    className={inputCls}
                    placeholder="HH:MM"
                  />
                  {errors.time && <p className={errorCls}>{errors.time.message}</p>}
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

              {/* Footer */}
              <div className="mt-6 flex items-center gap-3 border-t border-[hsl(var(--border))] pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg bg-[hsl(var(--primary))] py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity disabled:opacity-60"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : editingTemplate
                      ? 'Save Changes'
                      : 'Create Daily Task'}
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
