'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Clock,
  Tag,
  Repeat2,
  RotateCcw,
  Ban,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriorityBadge } from './priority-badge';
import { CategoryBadge } from './category-badge';
import { TagChip } from './tag-chip';
import { SubtaskList } from './subtask-list';
import type { UnifiedTask } from '../types/task.types';

interface UnifiedTaskCardProps {
  task: UnifiedTask;
  onToggleStatus: (task: UnifiedTask) => void;
  onSkip?: (task: UnifiedTask) => void;
  onUndoSkip?: (task: UnifiedTask) => void;
  onEdit: (task: UnifiedTask) => void;
  onDelete: (task: UnifiedTask) => void;
  isUpdating?: boolean;
}

export function UnifiedTaskCard({
  task,
  onToggleStatus,
  onSkip,
  onUndoSkip,
  onEdit,
  onDelete,
  isUpdating = false,
}: UnifiedTaskCardProps) {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const isDaily = task.source === 'DAILY';
  const isCompleted = task.completed;
  const isSkipped = task.skipped;
  const isFuture = task.isFutureProjection;

  const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length ?? 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative rounded-xl border bg-[hsl(var(--card))] px-4 py-3.5 transition-all duration-200',
        isSkipped
          ? 'border-dashed border-[hsl(var(--border))] bg-[hsl(var(--background-secondary)/0.5)] opacity-60'
          : isFuture
            ? 'border-dashed border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.03)]'
            : isCompleted
              ? 'border-[hsl(var(--border))] opacity-60'
              : task.isOverdue
                ? 'border-[hsl(var(--destructive)/0.4)] hover:border-[hsl(var(--destructive)/0.6)]'
                : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:shadow-xs',
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox / Status icon */}
        {isFuture ? (
          <span
            className="mt-0.5 flex-shrink-0 text-[hsl(var(--foreground-muted))]"
            title="Future habit projection (Read-only)"
          >
            <Lock size={20} className="text-[hsl(var(--primary)/0.7)]" />
          </span>
        ) : isSkipped ? (
          <span
            className="mt-0.5 flex-shrink-0 text-[hsl(var(--foreground-muted))]"
            title="Skipped for this date"
          >
            <Ban size={20} className="text-[hsl(var(--foreground-muted))]" />
          </span>
        ) : (
          <button
            onClick={() => onToggleStatus(task)}
            disabled={isUpdating}
            className={cn(
              'mt-0.5 flex-shrink-0 transition-colors disabled:opacity-50',
              isCompleted
                ? 'text-[hsl(var(--primary))]'
                : 'text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--primary))]',
            )}
            aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
          >
            {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
          </button>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'text-sm font-medium leading-snug',
                isCompleted || isSkipped
                  ? 'text-[hsl(var(--foreground-muted))] line-through'
                  : 'text-[hsl(var(--foreground))]',
              )}
            >
              {task.title}
            </span>

            {/* Daily Habit badge */}
            {isDaily && (
              <span
                className="flex items-center gap-1 rounded-full bg-[hsl(var(--primary)/0.1)] px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--primary))] capitalize"
                title={`Recurring ${task.frequency || 'DAILY'} Habit`}
              >
                <Repeat2 size={11} />
                {task.frequency ? task.frequency.toLowerCase() : 'daily'}
              </span>
            )}

            <PriorityBadge priority={task.priority} />
            {task.category && <CategoryBadge category={task.category} />}
          </div>

          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-[hsl(var(--foreground-muted))]">
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[hsl(var(--foreground-muted))]">
            {task.dueTime && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {task.dueTime}
              </span>
            )}

            {task.isOverdue && (
              <span className="font-semibold text-[hsl(var(--destructive))]">Overdue</span>
            )}

            {task.subtasks && task.subtasks.length > 0 && (
              <button
                onClick={() => setShowSubtasks((v) => !v)}
                className="flex items-center gap-1 transition-colors hover:text-[hsl(var(--primary))]"
              >
                {showSubtasks ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                {completedSubtasks}/{task.subtasks.length} subtasks
              </button>
            )}

            {task.tags.length > 0 && (
              <span className="flex items-center gap-1">
                <Tag size={11} />
                <span className="flex flex-wrap gap-1">
                  {task.tags.map(({ tag }) => (
                    <TagChip key={tag.id} tag={tag} />
                  ))}
                </span>
              </span>
            )}
          </div>

          <AnimatePresence>
            {showSubtasks && task.subtasks && task.subtasks.length > 0 && task.originalTask && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <SubtaskList taskId={task.originalTask.id} subtasks={task.subtasks} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
          {/* Skip / Undo Skip button for Daily Tasks */}
          {isDaily &&
            !isCompleted &&
            (isSkipped ? (
              <button
                onClick={() => onUndoSkip?.(task)}
                className="flex h-9 px-2.5 items-center gap-1 rounded-lg border border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--primary))] transition-colors hover:bg-[hsl(var(--primary)/0.1)] md:h-7 md:px-2 md:text-[11px]"
                title="Undo skip for this date"
              >
                <RotateCcw size={12} />
                Undo Skip
              </button>
            ) : (
              <button
                onClick={() => onSkip?.(task)}
                className="flex h-9 px-2.5 items-center gap-1 rounded-lg border border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--foreground-muted))] transition-colors hover:bg-[hsl(var(--background-secondary))] hover:text-[hsl(var(--foreground))] md:h-7 md:px-2 md:text-[11px]"
                title="Skip habit for this date"
              >
                <Ban size={12} />
                Skip
              </button>
            ))}

          {/* Edit button */}
          <button
            onClick={() => onEdit(task)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[hsl(var(--foreground-muted))] transition-colors hover:bg-[hsl(var(--background-secondary))] hover:text-[hsl(var(--foreground))] md:h-7 md:w-7"
            aria-label="Edit task"
          >
            <Pencil size={14} />
          </button>

          {/* Delete button */}
          <button
            onClick={() => onDelete(task)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[hsl(var(--foreground-muted))] transition-colors hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))] md:h-7 md:w-7"
            aria-label="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
