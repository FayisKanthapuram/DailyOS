'use client';

import { useMemo } from 'react';
import { DateTime } from 'luxon';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EventPill } from './event-pill';
import { getTodayInUserTimezone } from '../utils/calendar-date.utils';
import type { CalendarEventItem } from '../types/calendar.types';

interface MobileCalendarStripProps {
  selectedDate: string; // "YYYY-MM-DD"
  userTimezone: string;
  onSelectDate: (date: string) => void;
  eventsByDate: Map<string, CalendarEventItem[]>;
  onToggleStatus: (event: CalendarEventItem) => void;
  onEventClick: (event: CalendarEventItem) => void;
  onAddClick: (date: string) => void;
}

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MobileCalendarStrip({
  selectedDate,
  userTimezone,
  onSelectDate,
  eventsByDate,
  onToggleStatus,
  onEventClick,
  onAddClick,
}: MobileCalendarStripProps) {
  const todayStr = useMemo(() => getTodayInUserTimezone(userTimezone), [userTimezone]);

  // Windowed 15-day date strip (7 days before selectedDate, selectedDate, 7 days after)
  const stripDays = useMemo(() => {
    const dt = DateTime.fromISO(selectedDate, { zone: userTimezone });
    const days: Array<{
      date: string;
      dayNum: number;
      weekdayName: string;
      isToday: boolean;
      hasTasks: boolean;
    }> = [];

    const start = dt.minus({ days: 7 });
    let cursor = start;

    for (let i = 0; i < 15; i++) {
      const dateStr = cursor.toISODate() || '';
      const dayOfWeekIndex = cursor.weekday % 7; // 0 = Sun in JS/Luxon mapping adjustment
      const dayTasks = eventsByDate.get(dateStr) ?? [];

      days.push({
        date: dateStr,
        dayNum: cursor.day,
        weekdayName: WEEKDAYS_SHORT[dayOfWeekIndex],
        isToday: dateStr === todayStr,
        hasTasks: dayTasks.length > 0,
      });

      cursor = cursor.plus({ days: 1 });
    }

    return days;
  }, [selectedDate, userTimezone, eventsByDate, todayStr]);

  const selectedDateEvents = eventsByDate.get(selectedDate) ?? [];

  const handlePrevDay = () => {
    const dt = DateTime.fromISO(selectedDate, { zone: userTimezone }).minus({ days: 1 });
    onSelectDate(dt.toISODate() || selectedDate);
  };

  const handleNextDay = () => {
    const dt = DateTime.fromISO(selectedDate, { zone: userTimezone }).plus({ days: 1 });
    onSelectDate(dt.toISODate() || selectedDate);
  };

  const formattedSelectedHeader = DateTime.fromISO(selectedDate, { zone: userTimezone }).toFormat(
    'cccc, MMMM d',
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Date Header & Navigation bar */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
            {formattedSelectedHeader}
          </h2>
          <p className="text-xs text-[hsl(var(--foreground-muted))]">
            {selectedDate === todayStr ? 'Today' : `${selectedDateEvents.length} items scheduled`}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevDay}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--background-secondary))]"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => onSelectDate(todayStr)}
            className="rounded-lg border border-[hsl(var(--border))] px-2.5 py-1 text-xs font-medium text-[hsl(var(--foreground))]"
          >
            Today
          </button>

          <button
            onClick={handleNextDay}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--background-secondary))]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Horizontal 15-Day Date Strip */}
      <div className="no-scrollbar flex overflow-x-auto gap-2 py-1 snap-x scroll-smooth">
        {stripDays.map((day) => {
          const isSelected = day.date === selectedDate;

          return (
            <button
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              className={cn(
                'flex flex-col items-center justify-between min-w-[48px] py-2 px-1.5 rounded-xl border transition-all snap-center select-none',
                isSelected
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))] shadow-sm'
                  : day.isToday
                    ? 'bg-[hsl(var(--primary)/0.08)] border-[hsl(var(--primary)/0.3)] text-[hsl(var(--foreground))]'
                    : 'bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--foreground-secondary))] hover:border-[hsl(var(--primary)/0.3)]',
              )}
            >
              <span className="text-[10px] font-semibold uppercase opacity-75">
                {day.weekdayName}
              </span>
              <span className="text-sm font-bold my-0.5">{day.dayNum}</span>

              {/* Task Indicator Dot */}
              <span className="h-1.5 w-1.5 rounded-full">
                {day.hasTasks && (
                  <span
                    className={cn(
                      'block h-1.5 w-1.5 rounded-full',
                      isSelected
                        ? 'bg-[hsl(var(--primary-foreground))]'
                        : 'bg-[hsl(var(--primary))]',
                    )}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Agenda List */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-xs">
        <div className="mb-3 flex items-center justify-between border-b border-[hsl(var(--border))] pb-2">
          <span className="text-xs font-semibold text-[hsl(var(--foreground-secondary))] uppercase">
            Day Agenda ({selectedDateEvents.length})
          </span>
          <button
            onClick={() => onAddClick(selectedDate)}
            className="flex items-center gap-1 text-xs font-medium text-[hsl(var(--primary))] hover:underline"
          >
            <Plus size={13} />
            Add item
          </button>
        </div>

        {selectedDateEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarIcon
              size={28}
              className="text-[hsl(var(--foreground-muted))] opacity-40 mb-2"
            />
            <p className="text-xs font-medium text-[hsl(var(--foreground-muted))]">
              No tasks scheduled for this day
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDateEvents.map((event) => (
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
