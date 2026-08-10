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
  Calendar,
  Clock,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriorityBadge } from './priority-badge';
import { CategoryBadge } from './category-badge';
import { TagChip } from './tag-chip';
import { SubtaskList } from './subtask-list';
import type { Task } from '../types/task.types';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, completed: boolean) => void;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  isUpdating?: boolean;
}

function isOverdue(task: Task): boolean {
  if (!task.dueDate) return false;
  if (task.status === 'COMPLETED' || task.status === 'ARCHIVED') return false;
  const today = new Date().toISOString().slice(0, 10);
  return task.dueDate < today;
}

export function TaskCard({ task, onStatusChange, onEdit, onDelete, isUpdating }: TaskCardProps) {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const overdue = isOverdue(task);
  const isCompleted = task.status === 'COMPLETED';
  const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative rounded-xl border bg-[hsl(var(--card))] px-4 py-3.5 transition-all duration-200',
        isCompleted
          ? 'border-[hsl(var(--border))] opacity-60'
          : overdue
            ? 'border-[hsl(var(--destructive)/0.4)] hover:border-[hsl(var(--destructive)/0.6)]'
            : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:shadow-sm',
      )}
    >
      <div className="flex items-start gap-3">
        {/* Completion toggle */}
        <button
          onClick={() => onStatusChange(task.id, !isCompleted)}
          disabled={isUpdating}
          className={cn(
            'mt-0.5 flex-shrink-0 transition-colors disabled:opacity-50',
            isCompleted
              ? 'text-[hsl(var(--primary))]'
              : 'text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--primary))]',
          )}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-2">
            <span
              className={cn(
                'text-sm font-medium leading-snug',
                isCompleted
                  ? 'text-[hsl(var(--foreground-muted))] line-through'
                  : 'text-[hsl(var(--foreground))]',
              )}
            >
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

          {/* Meta row */}
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[hsl(var(--foreground-muted))]">
            {task.dueDate && (
              <span
                className={cn(
                  'flex items-center gap-1',
                  overdue && 'font-semibold text-[hsl(var(--destructive))]',
                )}
              >
                <Calendar size={11} />
                {overdue && 'Overdue · '}
                {task.dueDate}
                {task.dueTime && (
                  <>
                    <Clock size={11} className="ml-0.5" />
                    {task.dueTime}
                  </>
                )}
              </span>
            )}

            {task.subtasks.length > 0 && (
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
                <span className="flex gap-1">
                  {task.tags.map(({ tag }) => (
                    <TagChip key={tag.id} tag={tag} />
                  ))}
                </span>
              </span>
            )}
          </div>

          <AnimatePresence>
            {showSubtasks && task.subtasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <SubtaskList taskId={task.id} subtasks={task.subtasks} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onEdit(task.id)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[hsl(var(--foreground-muted))] transition-colors hover:bg-[hsl(var(--background-secondary))] hover:text-[hsl(var(--foreground))]"
            aria-label="Edit task"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[hsl(var(--foreground-muted))] transition-colors hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))]"
            aria-label="Delete task"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
