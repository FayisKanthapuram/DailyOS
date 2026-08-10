'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EventPill } from './event-pill';
import type { CalendarEventItem } from '../types/calendar.types';

const WEEKDAYS_SUN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface MonthViewProps {
  gridDays: Array<{ date: string; isCurrentMonth: boolean; isToday: boolean }>;
  eventsByDate: Map<string, CalendarEventItem[]>;
  onToggleStatus: (event: CalendarEventItem) => void;
  onEventClick: (event: CalendarEventItem) => void;
  onDateClick: (date: string) => void;
}

export function MonthView({
  gridDays,
  eventsByDate,
  onToggleStatus,
  onEventClick,
  onDateClick,
}: MonthViewProps) {
  const [overflowDate, setOverflowDate] = useState<string | null>(null);

  const overflowEvents = overflowDate ? (eventsByDate.get(overflowDate) ?? []) : [];

  return (
    <div className="flex flex-col">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-[hsl(var(--border))] bg-[hsl(var(--background-secondary)/0.5)] py-2 text-center text-xs font-semibold text-[hsl(var(--foreground-muted))]">
        {WEEKDAYS_SUN.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Dynamic Month Grid */}
      <div
        className={cn(
          'grid grid-cols-7 border-l border-t border-[hsl(var(--border))] bg-[hsl(var(--border))] gap-[1px]',
        )}
      >
        {gridDays.map((dayObj) => {
          const events = eventsByDate.get(dayObj.date) ?? [];
          const visibleEvents = events.slice(0, 3);
          const overflowCount = events.length - 3;
          const dayNum = parseInt(dayObj.date.slice(8, 10), 10);

          return (
            <div
              key={dayObj.date}
              onClick={() => onDateClick(dayObj.date)}
              className={cn(
                'group relative flex min-h-[110px] flex-col bg-[hsl(var(--background))] p-1.5 transition-colors hover:bg-[hsl(var(--background-secondary)/0.3)]',
                !dayObj.isCurrentMonth && 'bg-[hsl(var(--background-secondary)/0.2)] opacity-40',
                dayObj.isToday && 'bg-[hsl(var(--primary)/0.04)]',
              )}
            >
              {/* Date number header */}
              <div className="flex items-center justify-between px-1 pb-1">
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                    dayObj.isToday
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                      : 'text-[hsl(var(--foreground-secondary))]',
                  )}
                >
                  {dayNum}
                </span>

                {/* Add button on cell hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDateClick(dayObj.date);
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded text-[hsl(var(--foreground-muted))] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[hsl(var(--background-secondary))] hover:text-[hsl(var(--foreground))]"
                  title="Add task on this date"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Event pills container */}
              <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                {visibleEvents.map((event) => (
                  <EventPill
                    key={event.id}
                    event={event}
                    onToggleStatus={onToggleStatus}
                    onClick={onEventClick}
                    compact
                  />
                ))}

                {overflowCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOverflowDate(dayObj.date);
                    }}
                    className="mt-auto rounded px-1 py-0.5 text-[10px] font-semibold text-[hsl(var(--primary))] hover:underline"
                  >
                    +{overflowCount} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overflow Modal */}
      <AnimatePresence>
        {overflowDate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOverflowDate(null)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
                <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Tasks for {overflowDate}
                </h3>
                <button
                  onClick={() => setOverflowDate(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--background-secondary))]"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="mt-3 max-h-80 space-y-1.5 overflow-y-auto pr-1">
                {overflowEvents.map((event) => (
                  <EventPill
                    key={event.id}
                    event={event}
                    onToggleStatus={onToggleStatus}
                    onClick={(evt) => {
                      setOverflowDate(null);
                      onEventClick(evt);
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
