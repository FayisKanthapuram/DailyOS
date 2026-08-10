'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Pencil, Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriorityBadge } from './priority-badge';
import { CategoryBadge } from './category-badge';
import { TagChip } from './tag-chip';
import type { DailyTaskInstance } from '../types/task.types';

interface DailyTaskCardProps {
  instance: DailyTaskInstance;
  onToggle: (instanceId: string, isCompleted: boolean) => void;
  onEdit: (templateId: string) => void;
  onDelete: (templateId: string) => void;
  isToggling?: boolean;
}

export function DailyTaskCard({
  instance,
  onToggle,
  onEdit,
  onDelete,
  isToggling = false,
}: DailyTaskCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const { template } = instance;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative rounded-xl border bg-[hsl(var(--card))] px-4 py-3.5 transition-all duration-200',
        instance.isCompleted
          ? 'border-[hsl(var(--border))] opacity-60'
          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:shadow-sm',
      )}
    >
      <div className="flex items-start gap-3">
        {/* Completion toggle */}
        <button
          onClick={() => onToggle(instance.id, !instance.isCompleted)}
          disabled={isToggling}
          className="mt-0.5 flex-shrink-0 text-[hsl(var(--foreground-muted))] transition-colors hover:text-[hsl(var(--primary))] disabled:opacity-50"
          aria-label={instance.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {instance.isCompleted ? (
            <CheckCircle2 size={20} className="text-[hsl(var(--primary))]" />
          ) : (
            <Circle size={20} />
          )}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'text-sm font-medium',
                instance.isCompleted
                  ? 'text-[hsl(var(--foreground-muted))] line-through'
                  : 'text-[hsl(var(--foreground))]',
              )}
            >
              {/* Show snapshotTitle for historical integrity */}
              {instance.snapshotTitle}
            </span>
            <PriorityBadge priority={template.priority} />
            {template.category && <CategoryBadge category={template.category} />}
          </div>

          {template.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {template.tags.map(({ tag }) => (
                <TagChip key={tag.id} tag={tag} />
              ))}
            </div>
          )}

          <div className="mt-1 flex items-center gap-3 text-xs text-[hsl(var(--foreground-muted))]">
            {template.time && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {template.time}
              </span>
            )}
            {instance.isCompleted && instance.completedAt && (
              <span>
                Done at{' '}
                {new Date(instance.completedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>

          {/* Notes toggle */}
          {instance.notes && (
            <button
              onClick={() => setShowNotes((v) => !v)}
              className="mt-1.5 flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline"
            >
              {showNotes ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showNotes ? 'Hide note' : 'Show note'}
            </button>
          )}

          <AnimatePresence>
            {showNotes && instance.notes && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 rounded-lg bg-[hsl(var(--background-secondary))] px-3 py-2 text-xs text-[hsl(var(--foreground-secondary))]"
              >
                {instance.notes}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onEdit(template.id)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[hsl(var(--foreground-muted))] transition-colors hover:bg-[hsl(var(--background-secondary))] hover:text-[hsl(var(--foreground))]"
            aria-label="Edit"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(template.id)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[hsl(var(--foreground-muted))] transition-colors hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))]"
            aria-label="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
