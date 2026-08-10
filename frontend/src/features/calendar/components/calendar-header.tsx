'use client';

import { ChevronLeft, ChevronRight, Clock, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendarViewMode } from '../types/calendar.types';

interface CalendarHeaderProps {
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  title: string;
  userTimezone: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onToggleUnscheduled: () => void;
  unscheduledCount: number;
}

export function CalendarHeader({
  viewMode,
  onViewModeChange,
  title,
  userTimezone,
  onPrev,
  onNext,
  onToday,
  onToggleUnscheduled,
  unscheduledCount,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] pb-4">
      {/* Date title & Navigation */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">{title}</h1>

        <div className="flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0.5 shadow-xs">
          <button
            onClick={onPrev}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[hsl(var(--foreground-muted))] transition-colors hover:bg-[hsl(var(--background-secondary))] hover:text-[hsl(var(--foreground))]"
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={onToday}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--background-secondary))]"
          >
            Today
          </button>

          <button
            onClick={onNext}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[hsl(var(--foreground-muted))] transition-colors hover:bg-[hsl(var(--background-secondary))] hover:text-[hsl(var(--foreground))]"
            aria-label="Next"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* View Switcher, Timezone Badge & Unscheduled Drawer Trigger */}
      <div className="flex items-center gap-2">
        {/* Timezone badge */}
        <span
          className="hidden items-center gap-1 rounded-full bg-[hsl(var(--background-secondary))] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--foreground-muted))] sm:flex"
          title="Canonical user timezone"
        >
          <Clock size={11} />
          {userTimezone}
        </span>

        {/* Unscheduled drawer trigger */}
        <button
          onClick={onToggleUnscheduled}
          className="relative flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--foreground))] shadow-xs transition-colors hover:bg-[hsl(var(--background-secondary))]"
        >
          <Inbox size={14} className="text-[hsl(var(--primary))]" />
          <span className="hidden sm:inline">Unscheduled</span>
          {unscheduledCount > 0 && (
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[hsl(var(--primary))] px-1 text-[10px] font-semibold text-[hsl(var(--primary-foreground))]">
              {unscheduledCount}
            </span>
          )}
        </button>

        {/* View Mode Switcher */}
        <div className="flex gap-0.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background-secondary))] p-1">
          {(['month', 'week', 'day'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium capitalize transition-all',
                viewMode === mode
                  ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-xs'
                  : 'text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground-secondary))]',
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
