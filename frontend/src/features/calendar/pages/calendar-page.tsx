'use client';

import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarHeader } from '../components/calendar-header';
import { MonthView } from '../components/month-view';
import { WeekView } from '../components/week-view';
import { DayView } from '../components/day-view';
import { MobileCalendarStrip } from '../components/mobile-calendar-strip';
import { UnscheduledDrawer } from '../components/unscheduled-drawer';
import { TaskForm } from '@/features/tasks/components/task-form';
import { DailyTaskForm } from '@/features/tasks/components/daily-task-form';
import { useCalendarData } from '../hooks/use-calendar';
import {
  calculateMonthGridRange,
  calculateWeekRange,
  calculateDayRange,
  projectEventsForGrid,
  getTodayInUserTimezone,
} from '../utils/calendar-date.utils';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useUpdateDailyInstance } from '@/features/tasks/hooks/use-daily-tasks';
import { useUpdateTask } from '@/features/tasks/hooks/use-tasks';
import type { CalendarViewMode, CalendarEventItem } from '../types/calendar.types';
import type { Task, DailyTaskTemplate } from '@/features/tasks/types/task.types';
import { usePageMeta } from '@/lib/use-page-meta';

export function CalendarPage() {
  usePageMeta({ title: 'Calendar — DailyOS', robots: 'noindex, nofollow' });
  const qc = useQueryClient();
  const { user } = useAuth();
  const userTimezone = user?.timezone || 'UTC';

  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    getTodayInUserTimezone(userTimezone),
  );
  const [unscheduledOpen, setUnscheduledOpen] = useState(false);

  // Forms modals
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [dailyFormOpen, setDailyFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DailyTaskTemplate | undefined>();

  // Range calculation based on viewMode
  const monthRange = useMemo(
    () => calculateMonthGridRange(selectedDate, userTimezone, 'sunday'),
    [selectedDate, userTimezone],
  );

  const weekRange = useMemo(
    () => calculateWeekRange(selectedDate, userTimezone, 'sunday'),
    [selectedDate, userTimezone],
  );

  const dayRange = useMemo(() => calculateDayRange(selectedDate), [selectedDate]);

  const currentRange = useMemo(() => {
    if (viewMode === 'month')
      return { startDate: monthRange.startDate, endDate: monthRange.endDate };
    if (viewMode === 'week') return { startDate: weekRange.startDate, endDate: weekRange.endDate };
    return { startDate: dayRange.startDate, endDate: dayRange.endDate };
  }, [viewMode, monthRange, weekRange, dayRange]);

  // Query unified calendar data
  const { data: calendarData, isLoading } = useCalendarData(
    currentRange.startDate,
    currentRange.endDate,
  );

  // Mutations
  const updateDailyInstance = useUpdateDailyInstance();
  const updateTask = useUpdateTask();

  // Project events into grid map
  const eventsByDate = useMemo(() => {
    if (!calendarData) return new Map<string, CalendarEventItem[]>();
    return projectEventsForGrid(calendarData);
  }, [calendarData]);

  // Navigation handlers
  const handlePrev = () => {
    const dt = new Date(`${selectedDate}T00:00:00`);
    if (viewMode === 'month') dt.setMonth(dt.getMonth() - 1);
    else if (viewMode === 'week') dt.setDate(dt.getDate() - 7);
    else dt.setDate(dt.getDate() - 1);
    setSelectedDate(dt.toISOString().slice(0, 10));
  };

  const handleNext = () => {
    const dt = new Date(`${selectedDate}T00:00:00`);
    if (viewMode === 'month') dt.setMonth(dt.getMonth() + 1);
    else if (viewMode === 'week') dt.setDate(dt.getDate() + 7);
    else dt.setDate(dt.getDate() + 1);
    setSelectedDate(dt.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    setSelectedDate(getTodayInUserTimezone(userTimezone));
  };

  // Header Title
  const headerTitle = useMemo(() => {
    const dt = new Date(`${selectedDate}T00:00:00`);
    if (viewMode === 'month') {
      return dt.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    }
    if (viewMode === 'week') {
      const startDt = new Date(`${weekRange.startDate}T00:00:00`);
      const endDt = new Date(`${weekRange.endDate}T00:00:00`);
      return `${startDt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${endDt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return dt.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDate, viewMode, weekRange]);

  // Event interaction
  const handleToggleStatus = (event: CalendarEventItem) => {
    if (event.type === 'daily_instance' && event.originalInstance) {
      updateDailyInstance.mutate({
        instanceId: event.originalInstance.id,
        payload: { isCompleted: !event.isCompleted },
      });
    } else if (event.type === 'normal' && event.originalTask) {
      updateTask.mutate({
        id: event.originalTask.id,
        payload: { status: event.isCompleted ? 'TODO' : 'COMPLETED' },
      });
    }
  };

  const handleEventClick = (event: CalendarEventItem) => {
    if (event.type === 'normal' && event.originalTask) {
      setEditingTask(event.originalTask);
      setTaskFormOpen(true);
    } else if (
      (event.type === 'daily_instance' && event.originalInstance?.template) ||
      (event.type === 'daily_projection' && event.originalTemplate)
    ) {
      const template = event.originalInstance?.template || event.originalTemplate;
      setEditingTemplate(template);
      setDailyFormOpen(true);
    }
  };

  const handleDateClick = () => {
    setEditingTask(undefined);
    setTaskFormOpen(true);
  };

  const invalidateCalendar = () => {
    qc.invalidateQueries({ queryKey: ['calendar'] });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <CalendarHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        title={headerTitle}
        userTimezone={userTimezone}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onToggleUnscheduled={() => setUnscheduledOpen(true)}
        unscheduledCount={calendarData?.unscheduledTasks.length ?? 0}
      />

      {/* Main View Body */}
      <div className="mt-4">
        {isLoading ? (
          <div className="h-96 animate-pulse rounded-xl bg-[hsl(var(--background-secondary))]" />
        ) : (
          <>
            {/* Mobile Calendar Strip + Agenda View (< 768px) */}
            <div className="block md:hidden">
              <MobileCalendarStrip
                selectedDate={selectedDate}
                userTimezone={userTimezone}
                onSelectDate={setSelectedDate}
                eventsByDate={eventsByDate}
                onToggleStatus={handleToggleStatus}
                onEventClick={handleEventClick}
                onAddClick={(date) => {
                  setSelectedDate(date);
                  setEditingTask(undefined);
                  setTaskFormOpen(true);
                }}
              />
            </div>

            {/* Desktop Views (>= 768px) */}
            <div className="hidden md:block">
              <AnimatePresence mode="wait">
                {viewMode === 'month' && (
                  <motion.div
                    key="month"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MonthView
                      gridDays={monthRange.gridDays}
                      eventsByDate={eventsByDate}
                      onToggleStatus={handleToggleStatus}
                      onEventClick={handleEventClick}
                      onDateClick={handleDateClick}
                    />
                  </motion.div>
                )}

                {viewMode === 'week' && (
                  <motion.div
                    key="week"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <WeekView
                      days={weekRange.days}
                      eventsByDate={eventsByDate}
                      onToggleStatus={handleToggleStatus}
                      onEventClick={handleEventClick}
                      onDateClick={handleDateClick}
                    />
                  </motion.div>
                )}

                {viewMode === 'day' && (
                  <motion.div
                    key="day"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DayView
                      date={selectedDate}
                      isToday={selectedDate === getTodayInUserTimezone(userTimezone)}
                      events={eventsByDate.get(selectedDate) ?? []}
                      onToggleStatus={handleToggleStatus}
                      onEventClick={handleEventClick}
                      onAddClick={handleDateClick}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* Slide-over Drawers & Forms */}
      <UnscheduledDrawer
        open={unscheduledOpen}
        onClose={() => setUnscheduledOpen(false)}
        unscheduledTasks={calendarData?.unscheduledTasks ?? []}
        onTaskScheduled={invalidateCalendar}
      />

      <TaskForm
        open={taskFormOpen}
        onClose={() => {
          setTaskFormOpen(false);
          setEditingTask(undefined);
          invalidateCalendar();
        }}
        editingTask={editingTask}
      />

      <DailyTaskForm
        open={dailyFormOpen}
        onClose={() => {
          setDailyFormOpen(false);
          setEditingTemplate(undefined);
          invalidateCalendar();
        }}
        editingTemplate={editingTemplate}
      />
    </div>
  );
}
