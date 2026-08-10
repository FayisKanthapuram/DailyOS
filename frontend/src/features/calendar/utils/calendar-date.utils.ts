import { DateTime } from 'luxon';
import type { CalendarDataResponse, CalendarEventItem } from '../types/calendar.types';

export function getTodayInUserTimezone(timezone: string): string {
  try {
    return DateTime.now().setZone(timezone).toISODate() || '';
  } catch {
    return DateTime.now().toUTC().toISODate() || '';
  }
}

/**
 * Dynamically computes the visible Month Grid range (4, 5, or 6 weeks)
 * based on selectedDate, userTimezone, and starting day of week.
 */
export function calculateMonthGridRange(
  selectedDate: string, // "YYYY-MM-DD"
  timezone: string,
  startOfWeekDay: 'sunday' | 'monday' = 'sunday',
) {
  const dt = DateTime.fromISO(selectedDate, { zone: timezone });
  const firstOfMonth = dt.startOf('month');
  const lastOfMonth = dt.endOf('month');

  let gridStart = firstOfMonth.startOf('week'); // Luxon defaults weeks to Monday start
  if (startOfWeekDay === 'sunday') {
    gridStart =
      firstOfMonth.weekday === 7
        ? firstOfMonth
        : firstOfMonth.minus({ days: firstOfMonth.weekday });
  }

  let gridEnd = lastOfMonth.endOf('week');
  if (startOfWeekDay === 'sunday') {
    const daysUntilSat = (6 - (lastOfMonth.weekday % 7)) % 7;
    gridEnd = lastOfMonth.plus({ days: daysUntilSat });
  }

  const totalDays = Math.round(gridEnd.diff(gridStart, 'days').days) + 1;
  const numWeeks = Math.ceil(totalDays / 7);

  const gridDays: Array<{ date: string; isCurrentMonth: boolean; isToday: boolean }> = [];
  let cursor = gridStart;
  const todayStr = getTodayInUserTimezone(timezone);

  for (let i = 0; i < totalDays; i++) {
    const dateStr = cursor.toISODate() || '';
    gridDays.push({
      date: dateStr,
      isCurrentMonth: cursor.month === dt.month,
      isToday: dateStr === todayStr,
    });
    cursor = cursor.plus({ days: 1 });
  }

  return {
    startDate: gridStart.toISODate() || '',
    endDate: gridEnd.toISODate() || '',
    totalDays,
    numWeeks,
    gridDays,
  };
}

export function calculateWeekRange(
  selectedDate: string,
  timezone: string,
  startOfWeekDay: 'sunday' | 'monday' = 'sunday',
) {
  const dt = DateTime.fromISO(selectedDate, { zone: timezone });
  let weekStart = dt.startOf('week');
  if (startOfWeekDay === 'sunday') {
    weekStart = dt.weekday === 7 ? dt : dt.minus({ days: dt.weekday });
  }
  const weekEnd = weekStart.plus({ days: 6 });

  const days: Array<{ date: string; isToday: boolean }> = [];
  const todayStr = getTodayInUserTimezone(timezone);
  let cursor = weekStart;

  for (let i = 0; i < 7; i++) {
    const dateStr = cursor.toISODate() || '';
    days.push({
      date: dateStr,
      isToday: dateStr === todayStr,
    });
    cursor = cursor.plus({ days: 1 });
  }

  return {
    startDate: weekStart.toISODate() || '',
    endDate: weekEnd.toISODate() || '',
    days,
  };
}

export function calculateDayRange(selectedDate: string) {
  return {
    startDate: selectedDate,
    endDate: selectedDate,
  };
}

/**
 * Projects normal tasks, past daily instances, and future daily templates into a unified event list.
 */
export function projectEventsForGrid(data: CalendarDataResponse): Map<string, CalendarEventItem[]> {
  const eventsByDate = new Map<string, CalendarEventItem[]>();

  const addEvent = (date: string, item: CalendarEventItem) => {
    const existing = eventsByDate.get(date) ?? [];
    existing.push(item);
    eventsByDate.set(date, existing);
  };

  const todayStr = data.today;
  const currentTimeStr = DateTime.now().setZone(data.userTimezone).toFormat('HH:mm');

  // 1. Normal tasks
  for (const task of data.normalTasks) {
    if (!task.dueDate) continue;

    const isOverdue =
      task.status !== 'COMPLETED' &&
      task.status !== 'ARCHIVED' &&
      (task.dueDate < todayStr ||
        (task.dueDate === todayStr && !!task.dueTime && task.dueTime < currentTimeStr));

    addEvent(task.dueDate, {
      id: `task-${task.id}`,
      type: 'normal',
      title: task.title,
      date: task.dueDate,
      time: task.dueTime ?? null,
      isCompleted: task.status === 'COMPLETED',
      priority: task.priority,
      category: task.category,
      tags: task.tags,
      isOverdue,
      originalTask: task,
    });
  }

  // 2. Daily task instances (for date <= today)
  for (const inst of data.dailyInstances) {
    addEvent(inst.date, {
      id: `inst-${inst.id}`,
      type: 'daily_instance',
      title: inst.snapshotTitle,
      date: inst.date,
      time: inst.template.time ?? null,
      isCompleted: inst.isCompleted,
      priority: inst.template.priority,
      category: inst.template.category,
      tags: inst.template.tags,
      originalInstance: inst,
    });
  }

  // 3. Daily task templates projected on future dates (date > today)
  // Only project if template is active and targetDate >= max(createdAtDate, today + 1)
  for (const template of data.dailyTemplates) {
    if (!template.isActive) continue;

    const templateCreatedDate =
      DateTime.fromISO(template.createdAt, { zone: data.userTimezone }).toISODate() || '';
    const startDateDt = DateTime.fromISO(data.startDate, { zone: data.userTimezone });
    const endDateDt = DateTime.fromISO(data.endDate, { zone: data.userTimezone });

    let cursor = startDateDt;
    while (cursor <= endDateDt) {
      const dateStr = cursor.toISODate() || '';

      // Future date condition: dateStr > today AND dateStr >= templateCreatedDate
      if (dateStr > todayStr && dateStr >= templateCreatedDate) {
        addEvent(dateStr, {
          id: `proj-${template.id}-${dateStr}`,
          type: 'daily_projection',
          title: template.title,
          date: dateStr,
          time: template.time ?? null,
          isCompleted: false,
          priority: template.priority,
          category: template.category,
          tags: template.tags,
          isReadOnlyFuture: true,
          originalTemplate: template,
        });
      }
      cursor = cursor.plus({ days: 1 });
    }
  }

  // Sort events per date by time (timed items first, then untimed)
  eventsByDate.forEach((list) => {
    list.sort((a, b) => {
      if (a.time && !b.time) return -1;
      if (!a.time && b.time) return 1;
      if (a.time && b.time) return a.time.localeCompare(b.time);
      return 0;
    });
  });

  return eventsByDate;
}
