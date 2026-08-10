'use client';

import { cn } from '@/lib/utils';
import { EventPill } from './event-pill';
import type { CalendarEventItem } from '../types/calendar.types';

interface WeekViewProps {
  days: Array<{ date: string; isToday: boolean }>;
  eventsByDate: Map<string, CalendarEventItem[]>;
  onToggleStatus: (event: CalendarEventItem) => void;
  onEventClick: (event: CalendarEventItem) => void;
  onDateClick: (date: string) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeekView({
  days,
  eventsByDate,
  onToggleStatus,
  onEventClick,
  onDateClick,
}: WeekViewProps) {
  return (
    <div className="flex flex-col border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--card))] overflow-hidden shadow-xs">
      {/* 7-column day headers */}
      <div className="grid grid-cols-7 border-b border-[hsl(var(--border))] bg-[hsl(var(--background-secondary)/0.5)]">
        {days.map((dayObj, index) => {
          const dt = new Date(`${dayObj.date}T00:00:00`);
          const dayNum = dt.getDate();

          return (
            <div
              key={dayObj.date}
              onClick={() => onDateClick(dayObj.date)}
              className={cn(
                'flex flex-col items-center py-3 cursor-pointer transition-colors hover:bg-[hsl(var(--background-secondary)/0.7)]',
                dayObj.isToday && 'bg-[hsl(var(--primary)/0.06)]',
              )}
            >
              <span className="text-xs font-semibold text-[hsl(var(--foreground-muted))] uppercase">
                {WEEKDAYS[index]}
              </span>
              <span
                className={cn(
                  'mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold',
                  dayObj.isToday
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'text-[hsl(var(--foreground))]',
                )}
              >
                {dayNum}
              </span>
            </div>
          );
        })}
      </div>

      {/* Grid columns for events */}
      <div className="grid grid-cols-7 divide-x divide-[hsl(var(--border))] min-h-[450px]">
        {days.map((dayObj) => {
          const events = eventsByDate.get(dayObj.date) ?? [];

          return (
            <div
              key={dayObj.date}
              onClick={() => onDateClick(dayObj.date)}
              className={cn(
                'flex flex-col gap-1.5 p-2 transition-colors hover:bg-[hsl(var(--background-secondary)/0.2)]',
                dayObj.isToday && 'bg-[hsl(var(--primary)/0.03)]',
              )}
            >
              {events.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-[11px] text-[hsl(var(--foreground-muted))] opacity-40">
                  No tasks
                </div>
              ) : (
                events.map((event) => (
                  <EventPill
                    key={event.id}
                    event={event}
                    onToggleStatus={onToggleStatus}
                    onClick={onEventClick}
                    compact
                  />
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
