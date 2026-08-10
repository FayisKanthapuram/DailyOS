'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Repeat2, Plus, Pencil, Trash2, Power } from 'lucide-react';
import { PriorityBadge } from './priority-badge';
import { CategoryBadge } from './category-badge';
import { TagChip } from './tag-chip';
import { EmptyState } from './empty-state';
import {
  useDailyTaskTemplates,
  useUpdateDailyTask,
  useDeleteDailyTaskPermanently,
} from '../hooks/use-daily-tasks';
import type { DailyTaskTemplate, RecurrenceFrequency } from '../types/task.types';

interface HabitManagementDrawerProps {
  open: boolean;
  onClose: () => void;
  onNewHabit: () => void;
  onEditHabit: (template: DailyTaskTemplate) => void;
}

export function HabitManagementDrawer({
  open,
  onClose,
  onNewHabit,
  onEditHabit,
}: HabitManagementDrawerProps) {
  const { data: templates = [], isLoading } = useDailyTaskTemplates();
  const updateTemplate = useUpdateDailyTask();
  const deletePermanent = useDeleteDailyTaskPermanently();

  const handleToggleActive = async (template: DailyTaskTemplate) => {
    await updateTemplate.mutateAsync({
      id: template.id,
      payload: { isActive: !template.isActive },
    });
  };

  const handleDelete = async (template: DailyTaskTemplate) => {
    if (confirm(`Delete recurring habit "${template.title}" permanently?`)) {
      await deletePermanent.mutateAsync(template.id);
    }
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
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] w-full flex-col rounded-t-2xl border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-2xl pb-[max(1rem,env(safe-area-inset-bottom))] md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:max-w-md md:rounded-none md:border-l md:border-t-0 md:pb-0"
          >
            {/* Mobile drag handle */}
            <div className="mx-auto my-2 h-1 w-12 rounded-full bg-[hsl(var(--border))] md:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-4">
              <div className="flex items-center gap-2">
                <Repeat2 size={18} className="text-[hsl(var(--primary))]" />
                <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
                  Manage Recurring Habits ({templates.length})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--background-secondary))]"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <button
                onClick={() => {
                  onClose();
                  onNewHabit();
                }}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.05)] p-3 text-xs font-semibold text-[hsl(var(--primary))] transition-all hover:bg-[hsl(var(--primary)/0.1)]"
              >
                <Plus size={15} />
                Create New Recurring Habit
              </button>

              {isLoading ? (
                <div className="h-40 animate-pulse rounded-xl bg-[hsl(var(--background-secondary))]" />
              ) : templates.length === 0 ? (
                <EmptyState
                  icon={<Repeat2 size={24} />}
                  title="No recurring habits"
                  description="Create your first daily habit to automatically generate daily occurrences!"
                />
              ) : (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5 shadow-xs transition-all hover:border-[hsl(var(--primary)/0.3)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-sm font-medium ${template.isActive ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--foreground-muted))] line-through'}`}
                            >
                              {template.title}
                            </span>
                            <span className="rounded-full bg-[hsl(var(--primary)/0.1)] px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--primary))] uppercase">
                              ↻ {template.frequency || 'DAILY'}
                            </span>
                            <PriorityBadge priority={template.priority} />
                            {template.category && <CategoryBadge category={template.category} />}
                          </div>

                          <div className="mt-2 flex items-center gap-2">
                            <label className="text-[10px] font-semibold text-[hsl(var(--foreground-muted))]">
                              Frequency:
                            </label>
                            <select
                              value={template.frequency || 'DAILY'}
                              onChange={(e) =>
                                updateTemplate.mutate({
                                  id: template.id,
                                  payload: { frequency: e.target.value as RecurrenceFrequency },
                                })
                              }
                              className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-0.5 text-xs text-[hsl(var(--foreground))] transition-colors focus:border-[hsl(var(--primary))] focus:outline-none"
                            >
                              <option value="DAILY">Daily</option>
                              <option value="WEEKLY">Weekly</option>
                              <option value="MONTHLY">Monthly</option>
                            </select>
                          </div>

                          {template.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-[hsl(var(--foreground-muted))]">
                              {template.description}
                            </p>
                          )}

                          {template.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {template.tags.map(({ tag }) => (
                                <TagChip key={tag.id} tag={tag} />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleActive(template)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${template.isActive ? 'text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.1)]' : 'text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--background-secondary))]'}`}
                            title={template.isActive ? 'Deactivate habit' : 'Reactivate habit'}
                          >
                            <Power size={14} />
                          </button>
                          <button
                            onClick={() => {
                              onClose();
                              onEditHabit(template);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--background-secondary))] hover:text-[hsl(var(--foreground))]"
                            title="Edit habit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(template)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))]"
                            title="Delete habit"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
