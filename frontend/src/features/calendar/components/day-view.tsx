'use client';

import { Calendar, Plus } from 'lucide-react';
import { EventPill } from './event-pill';
import { EmptyState } from '@/features/tasks/components/empty-state';
import type { CalendarEventItem } from '../types/calendar.types';

interface DayViewProps {
  date: string;
  isToday: boolean;
  events: CalendarEventItem[];
  onToggleStatus: (event: CalendarEventItem) => void;
  onEventClick: (event: CalendarEventItem) => void;
  onAddClick: (date: string) => void;
}

export function DayView({
  date,
  isToday,
  events,
  onToggleStatus,
  onEventClick,
  onAddClick,
}: DayViewProps) {
  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">{formattedDate}</h2>
          <p className="text-xs text-[hsl(var(--foreground-muted))]">
            {isToday ? "Today's schedule" : 'Scheduled tasks for this day'}
          </p>
        </div>

        <button
          onClick={() => onAddClick(date)}
          className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--primary-foreground))] shadow-xs transition-opacity hover:opacity-90"
        >
          <Plus size={14} />
          Add Task
        </button>
      </div>

      <div className="mt-4">
        {events.length === 0 ? (
          <EmptyState
            icon={<Calendar size={24} />}
            title="No tasks scheduled"
            description="Add a task or assign a due date to see it on this day."
            action={
              <button
                onClick={() => onAddClick(date)}
                className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--primary-foreground))]"
              >
                <Plus size={14} />
                Schedule task
              </button>
            }
          />
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <EventPill
                key={event.id}
                event={event}
                onToggleStatus={onToggleStatus}
                onClick={onEventClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
