'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Inbox } from 'lucide-react';
import { PriorityBadge } from '@/features/tasks/components/priority-badge';
import { CategoryBadge } from '@/features/tasks/components/category-badge';
import { TagChip } from '@/features/tasks/components/tag-chip';
import { EmptyState } from '@/features/tasks/components/empty-state';
import { useUpdateTask } from '@/features/tasks/hooks/use-tasks';
import type { Task } from '@/features/tasks/types/task.types';

interface UnscheduledDrawerProps {
  open: boolean;
  onClose: () => void;
  unscheduledTasks: Task[];
  onTaskScheduled?: () => void;
}

export function UnscheduledDrawer({
  open,
  onClose,
  unscheduledTasks,
  onTaskScheduled,
}: UnscheduledDrawerProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState<string>('');
  const updateTask = useUpdateTask();

  const handleSchedule = async (taskId: string, date: string) => {
    if (!date) return;
    await updateTask.mutateAsync({
      id: taskId,
      payload: { dueDate: date },
    });
    setSelectedTaskId(null);
    setTargetDate('');
    onTaskScheduled?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] w-full flex-col rounded-t-2xl border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-2xl pb-[max(1rem,env(safe-area-inset-bottom))] md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:max-w-sm md:rounded-none md:border-l md:border-t-0 md:pb-0"
          >
            {/* Mobile drag handle indicator */}
            <div className="mx-auto my-2 h-1 w-12 rounded-full bg-[hsl(var(--border))] md:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-4">
              <div className="flex items-center gap-2">
                <Inbox size={18} className="text-[hsl(var(--primary))]" />
                <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
                  Unscheduled Tasks ({unscheduledTasks.length})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--background-secondary))]"
              >
                <X size={16} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-5">
              {unscheduledTasks.length === 0 ? (
                <EmptyState
                  icon={<Inbox size={24} />}
                  title="No unscheduled tasks"
                  description="All your one-time tasks have assigned due dates!"
                />
              ) : (
                <div className="space-y-3">
                  {unscheduledTasks.map((task) => {
                    const isSelected = selectedTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5 shadow-xs transition-all hover:border-[hsl(var(--primary)/0.4)]"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                            {task.title}
                          </span>
                          <PriorityBadge priority={task.priority} />
                          {task.category && <CategoryBadge category={task.category} />}
                        </div>

                        {task.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-[hsl(var(--foreground-muted))]">
                            {task.description}
                          </p>
                        )}

                        {task.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {task.tags.map(({ tag }) => (
                              <TagChip key={tag.id} tag={tag} />
                            ))}
                          </div>
                        )}

                        {/* Date assignment picker */}
                        <div className="mt-3 flex items-center justify-between border-t border-[hsl(var(--border))] pt-2.5">
                          {isSelected ? (
                            <div className="flex w-full items-center gap-2">
                              <input
                                type="date"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                className="flex-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-xs text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--primary))]"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSchedule(task.id, targetDate)}
                                disabled={!targetDate || updateTask.isPending}
                                className="rounded-lg bg-[hsl(var(--primary))] px-3 py-1 text-xs font-medium text-[hsl(var(--primary-foreground))] disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setSelectedTaskId(null)}
                                className="rounded-lg border border-[hsl(var(--border))] px-2 py-1 text-xs text-[hsl(var(--foreground-muted))]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedTaskId(task.id);
                                setTargetDate(new Date().toISOString().slice(0, 10));
                              }}
                              className="flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--primary))] hover:underline"
                            >
                              <Calendar size={13} />
                              Assign Due Date
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
