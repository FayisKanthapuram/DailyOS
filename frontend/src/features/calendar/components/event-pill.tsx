'use client';

import { CheckCircle2, Circle, Clock, Repeat2, AlertCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendarEventItem } from '../types/calendar.types';

interface EventPillProps {
  event: CalendarEventItem;
  onToggleStatus?: (event: CalendarEventItem) => void;
  onClick?: (event: CalendarEventItem) => void;
  compact?: boolean;
}

export function EventPill({ event, onToggleStatus, onClick, compact = false }: EventPillProps) {
  const isProjection = event.type === 'daily_projection';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(event);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isProjection) return; // Future projections are read-only
    onToggleStatus?.(event);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-all cursor-pointer select-none',
        isProjection
          ? 'border border-dashed border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.06)] text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--primary)/0.12)]'
          : event.isCompleted
            ? 'bg-[hsl(var(--background-tertiary))] text-[hsl(var(--foreground-muted))] line-through opacity-70'
            : event.isOverdue
              ? 'border border-[hsl(var(--destructive)/0.5)] bg-[hsl(var(--destructive)/0.08)] text-[hsl(var(--destructive))]'
              : 'bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary)/0.5)] hover:shadow-xs',
        compact && 'py-0.5 px-1 text-[11px]',
      )}
    >
      {/* Icon / Status Checkbox */}
      {isProjection ? (
        <span
          className="flex-shrink-0 text-[hsl(var(--foreground-muted))]"
          title="Future habit projection (Read-only)"
        >
          <Lock size={compact ? 11 : 13} className="text-[hsl(var(--primary)/0.7)]" />
        </span>
      ) : (
        <button
          onClick={handleToggle}
          className={cn(
            'flex-shrink-0 transition-colors',
            event.isCompleted
              ? 'text-[hsl(var(--primary))]'
              : 'text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--primary))]',
          )}
        >
          {event.isCompleted ? (
            <CheckCircle2 size={compact ? 12 : 14} />
          ) : (
            <Circle size={compact ? 12 : 14} />
          )}
        </button>
      )}

      {/* Category indicator dot */}
      {event.category && !isProjection && (
        <span
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: event.category.color }}
          title={event.category.name}
        />
      )}

      {/* Title */}
      <span className="truncate flex-1 font-medium">{event.title}</span>

      {/* Habit badge for daily tasks */}
      {(event.type === 'daily_instance' || isProjection) && (
        <Repeat2 size={11} className="flex-shrink-0 opacity-60" />
      )}

      {/* Time badge if present */}
      {event.time && (
        <span className="flex flex-shrink-0 items-center gap-0.5 text-[10px] text-[hsl(var(--foreground-muted))]">
          <Clock size={10} />
          {event.time}
        </span>
      )}

      {/* Overdue badge */}
      {event.isOverdue && (
        <AlertCircle size={11} className="flex-shrink-0 text-[hsl(var(--destructive))]" />
      )}
    </div>
  );
}
