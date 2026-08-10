'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Repeat2, ListTodo, Clock, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UnifiedTaskCard } from '../components/unified-task-card';
import { TaskForm } from '../components/task-form';
import { HabitManagementDrawer } from '../components/habit-management-drawer';
import { DailyTaskForm } from '../components/daily-task-form';
import { EmptyState } from '../components/empty-state';
import { useUnifiedTasks, useUpdateTask, useDeleteTask } from '../hooks/use-tasks';
import {
  useUpdateDailyInstance,
  useCreateDailyException,
  useDeleteDailyException,
} from '../hooks/use-daily-tasks';
import { useCategories } from '../hooks/use-categories';
import type { UnifiedTask, DailyTaskTemplate } from '../types/task.types';

export function TasksPage() {
  // Date selection state (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  // Query unified tasks for selected date
  const { data: unifiedData, isLoading, refetch } = useUnifiedTasks(selectedDate);
  const tasks = useMemo(() => unifiedData?.tasks ?? [], [unifiedData?.tasks]);
  const todayStr = unifiedData?.today ?? selectedDate;

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TODO' | 'COMPLETED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const { data: categories = [] } = useCategories();

  // Modals / Drawers
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<UnifiedTask | undefined>();
  const [habitDrawerOpen, setHabitDrawerOpen] = useState(false);
  const [dailyFormOpen, setDailyFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DailyTaskTemplate | undefined>();

  // Mutations
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const updateDailyInstance = useUpdateDailyInstance();
  const createException = useCreateDailyException();
  const deleteException = useDeleteDailyException();

  // Navigation handlers
  const handlePrevDate = () => {
    const dt = new Date(`${selectedDate}T00:00:00`);
    dt.setDate(dt.getDate() - 1);
    setSelectedDate(dt.toISOString().slice(0, 10));
  };

  const handleNextDate = () => {
    const dt = new Date(`${selectedDate}T00:00:00`);
    dt.setDate(dt.getDate() + 1);
    setSelectedDate(dt.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    setSelectedDate(todayStr);
  };

  // Header date text
  const formattedDateTitle = useMemo(() => {
    const dt = new Date(`${selectedDate}T00:00:00`);
    const isToday = selectedDate === todayStr;
    const dateText = dt.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    return isToday ? `Today · ${dateText}` : dateText;
  }, [selectedDate, todayStr]);

  // Filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Status filter
      if (statusFilter === 'TODO' && (t.completed || t.skipped)) return false;
      if (statusFilter === 'COMPLETED' && !t.completed) return false;

      // Category filter
      if (categoryFilter !== 'ALL' && t.category?.id !== categoryFilter) return false;

      return true;
    });
  }, [tasks, statusFilter, categoryFilter]);

  // Split into Overdue vs Main tasks
  const overdueTasks = useMemo(() => filteredTasks.filter((t) => t.isOverdue), [filteredTasks]);

  const mainTasks = useMemo(() => filteredTasks.filter((t) => !t.isOverdue), [filteredTasks]);

  // Status toggle
  const handleToggleStatus = async (task: UnifiedTask) => {
    if (task.source === 'DAILY' && task.instanceId) {
      await updateDailyInstance.mutateAsync({
        instanceId: task.instanceId,
        payload: { isCompleted: !task.completed },
      });
    } else if (task.source === 'NORMAL' && task.originalTask) {
      await updateTask.mutateAsync({
        id: task.originalTask.id,
        payload: { status: task.completed ? 'TODO' : 'COMPLETED' },
      });
    }
  };

  // Skip daily habit
  const handleSkip = async (task: UnifiedTask) => {
    if (task.templateId) {
      await createException.mutateAsync({
        templateId: task.templateId,
        date: selectedDate,
        type: 'SKIP',
      });
    }
  };

  // Undo skip daily habit
  const handleUndoSkip = async (task: UnifiedTask) => {
    if (task.templateId) {
      await deleteException.mutateAsync({
        templateId: task.templateId,
        date: selectedDate,
      });
    }
  };

  // Edit action
  const handleEdit = (task: UnifiedTask) => {
    if (task.source === 'NORMAL' && task.originalTask) {
      setEditingTask(task);
      setTaskFormOpen(true);
    } else if (task.originalTemplate || task.templateId) {
      const template = task.originalTemplate || task.originalInstance?.template;
      if (template) {
        setEditingTemplate(template);
        setDailyFormOpen(true);
      }
    }
  };

  // Delete action
  const handleDelete = async (task: UnifiedTask) => {
    if (task.source === 'NORMAL' && task.originalTask) {
      if (confirm(`Delete task "${task.title}"?`)) {
        await deleteTask.mutateAsync(task.originalTask.id);
      }
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Date Header & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            {formattedDateTitle}
          </h1>
          <p className="mt-0.5 text-xs text-[hsl(var(--foreground-muted))]">
            {unifiedData
              ? `${unifiedData.stats.completed}/${unifiedData.stats.total} completed · ${unifiedData.stats.skipped} skipped`
              : 'Loading tasks...'}
          </p>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-0.5 shadow-xs">
            <button
              onClick={handlePrevDate}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--background-secondary))]"
              aria-label="Previous date"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleToday}
              className="rounded-md px-2 py-1 text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--background-secondary))]"
            >
              Today
            </button>
            <button
              onClick={handleNextDate}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--background-secondary))]"
              aria-label="Next date"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Manage Habits trigger */}
          <button
            onClick={() => setHabitDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--foreground))] shadow-xs transition-colors hover:bg-[hsl(var(--background-secondary))]"
          >
            <Repeat2 size={14} className="text-[hsl(var(--primary))]" />
            <span className="hidden sm:inline">Manage Habits</span>
          </button>

          {/* Desktop "+ New Task" */}
          <button
            onClick={() => {
              setEditingTask(undefined);
              setTaskFormOpen(true);
            }}
            className="hidden md:flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--primary-foreground))] shadow-xs transition-opacity hover:opacity-90"
          >
            <Plus size={14} />
            New Task
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-y border-[hsl(var(--border))] py-3">
        {/* Status segment pills */}
        <div className="flex gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background-secondary))] p-0.5">
          {(['ALL', 'TODO', 'COMPLETED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-all',
                statusFilter === st
                  ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-xs'
                  : 'text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground-secondary))]',
              )}
            >
              {st === 'ALL' ? 'All' : st === 'TODO' ? 'To Do' : 'Completed'}
            </button>
          ))}
        </div>

        {/* Category filter dropdown */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            <Filter size={13} className="text-[hsl(var(--foreground-muted))]" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1 text-xs text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--primary))]"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Task List Content */}
      <div className="mt-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-16 animate-pulse rounded-xl bg-[hsl(var(--background-secondary))]" />
            <div className="h-16 animate-pulse rounded-xl bg-[hsl(var(--background-secondary))]" />
            <div className="h-16 animate-pulse rounded-xl bg-[hsl(var(--background-secondary))]" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            icon={<ListTodo size={24} />}
            title="No tasks for this day"
            description="Create a task or recurring habit to populate your daily workflow!"
            action={
              <button
                onClick={() => {
                  setEditingTask(undefined);
                  setTaskFormOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--primary-foreground))]"
              >
                <Plus size={14} />
                Create task
              </button>
            }
          />
        ) : (
          <>
            {/* Overdue Section (if viewing Today and overdue tasks exist) */}
            {overdueTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--destructive))]">
                  <Clock size={13} />
                  <span>OVERDUE ({overdueTasks.length})</span>
                </div>
                <div className="space-y-2">
                  {overdueTasks.map((task) => (
                    <UnifiedTaskCard
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleStatus}
                      onSkip={handleSkip}
                      onUndoSkip={handleUndoSkip}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Main Daily Task List */}
            {mainTasks.length > 0 && (
              <div className="space-y-2">
                {overdueTasks.length > 0 && (
                  <div className="pt-2 text-xs font-bold text-[hsl(var(--foreground-secondary))] uppercase">
                    SCHEDULED TASKS ({mainTasks.length})
                  </div>
                )}
                {mainTasks.map((task) => (
                  <UnifiedTaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={handleToggleStatus}
                    onSkip={handleSkip}
                    onUndoSkip={handleUndoSkip}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Forms & Drawers */}
      <TaskForm
        open={taskFormOpen}
        onClose={() => {
          setTaskFormOpen(false);
          setEditingTask(undefined);
          refetch();
        }}
        editingTask={editingTask?.originalTask}
        defaultDate={selectedDate}
      />

      <HabitManagementDrawer
        open={habitDrawerOpen}
        onClose={() => setHabitDrawerOpen(false)}
        onNewHabit={() => {
          setEditingTemplate(undefined);
          setDailyFormOpen(true);
        }}
        onEditHabit={(template) => {
          setEditingTemplate(template);
          setDailyFormOpen(true);
        }}
      />

      <DailyTaskForm
        open={dailyFormOpen}
        onClose={() => {
          setDailyFormOpen(false);
          setEditingTemplate(undefined);
          refetch();
        }}
        editingTemplate={editingTemplate}
      />
    </div>
  );
}
