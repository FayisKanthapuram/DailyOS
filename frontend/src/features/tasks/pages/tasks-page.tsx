'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Repeat2, ListTodo, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DailyTaskCard } from '../components/daily-task-card';
import { TaskCard } from '../components/task-card';
import { DailyTaskForm } from '../components/daily-task-form';
import { TaskForm } from '../components/task-form';
import { EmptyState } from '../components/empty-state';
import {
  useTodayInstances,
  useUpdateDailyInstance,
  useDeactivateDailyTask,
} from '../hooks/use-daily-tasks';
import { useTasks, useUpdateTask, useDeleteTask } from '../hooks/use-tasks';
import type { DailyTaskTemplate, Task, TaskStatus } from '../types/task.types';

type Tab = 'daily' | 'tasks';
type TaskStatusFilter = 'ALL' | TaskStatus;

const STATUS_TABS: Array<{ value: TaskStatusFilter; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Done' },
];

function getTodayLocalDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function TasksPage() {
  const [activeTab, setActiveTab] = useState<Tab>('daily');
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('ALL');
  const [dailyFormOpen, setDailyFormOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingDailyTemplate, setEditingDailyTemplate] = useState<DailyTaskTemplate | undefined>();
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const todayDate = getTodayLocalDate();

  // Daily tasks
  const { data: instances = [], isLoading: isDailyLoading } = useTodayInstances(todayDate);
  const updateInstance = useUpdateDailyInstance();
  const deactivateDailyTask = useDeactivateDailyTask();

  // Normal tasks
  const taskFilters = statusFilter === 'ALL' ? {} : { status: statusFilter as TaskStatus };
  const { data: tasks = [], isLoading: isTasksLoading } = useTasks(taskFilters);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const completedCount = instances.filter((i) => i.isCompleted).length;
  const totalCount = instances.length;

  const handleToggleInstance = (instanceId: string, isCompleted: boolean) => {
    updateInstance.mutate({ instanceId, payload: { isCompleted } });
  };

  const handleEditDailyTask = (templateId: string) => {
    const instance = instances.find((i) => i.templateId === templateId);
    if (instance) {
      setEditingDailyTemplate(instance.template);
      setDailyFormOpen(true);
    }
  };

  const handleDeleteDailyTask = (templateId: string) => {
    if (confirm('Deactivate this daily task? Historical completions will be preserved.')) {
      deactivateDailyTask.mutate(templateId);
    }
  };

  const handleTaskStatusChange = (taskId: string, completed: boolean) => {
    updateTask.mutate({
      id: taskId,
      payload: { status: completed ? 'COMPLETED' : 'TODO' },
    });
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setTaskFormOpen(true);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Delete this task? This cannot be undone.')) {
      deleteTask.mutate(taskId);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">Tasks</h1>
          <p className="mt-0.5 text-sm text-[hsl(var(--foreground-secondary))]">
            {activeTab === 'daily'
              ? `${formatDisplayDate(todayDate)} · ${completedCount}/${totalCount} complete`
              : 'Your one-time tasks'}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDailyTemplate(undefined);
            setEditingTask(undefined);
            if (activeTab === 'daily') setDailyFormOpen(true);
            else setTaskFormOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          {activeTab === 'daily' ? 'Daily Task' : 'Task'}
        </button>
      </motion.div>

      {/* Tab switcher */}
      <div className="mt-6 flex gap-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-secondary))] p-1">
        {(
          [
            { value: 'daily', label: 'Daily Tasks', icon: Repeat2 },
            { value: 'tasks', label: 'Tasks', icon: ListTodo },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all',
              activeTab === tab.value
                ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm'
                : 'text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground-secondary))]',
            )}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'daily' ? (
          <motion.div
            key="daily"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            {/* Progress bar */}
            {totalCount > 0 && (
              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between text-xs text-[hsl(var(--foreground-muted))]">
                  <span>
                    {completedCount} of {totalCount} completed
                  </span>
                  <span>{Math.round((completedCount / totalCount) * 100)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[hsl(var(--background-tertiary))]">
                  <motion.div
                    className="h-full rounded-full bg-[hsl(var(--primary))]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            {isDailyLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-xl bg-[hsl(var(--background-secondary))]"
                  />
                ))}
              </div>
            ) : instances.length === 0 ? (
              <EmptyState
                icon={<Repeat2 size={24} />}
                title="No daily tasks"
                description="Create your first daily task to start building consistent habits."
                action={
                  <button
                    onClick={() => setDailyFormOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))]"
                  >
                    <Plus size={14} />
                    Add daily task
                  </button>
                }
              />
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {instances.map((instance) => (
                    <DailyTaskCard
                      key={instance.id}
                      instance={instance}
                      onToggle={handleToggleInstance}
                      onEdit={handleEditDailyTask}
                      onDelete={handleDeleteDailyTask}
                      isToggling={updateInstance.isPending}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            {/* Status filter tabs */}
            <div className="mb-4 flex gap-1">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                    statusFilter === tab.value
                      ? 'bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]'
                      : 'text-[hsl(var(--foreground-muted))] hover:bg-[hsl(var(--background-secondary))] hover:text-[hsl(var(--foreground-secondary))]',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {isTasksLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-xl bg-[hsl(var(--background-secondary))]"
                  />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <EmptyState
                icon={<ListTodo size={24} />}
                title={
                  statusFilter === 'ALL'
                    ? 'No tasks yet'
                    : `No ${statusFilter.toLowerCase().replace('_', ' ')} tasks`
                }
                description={
                  statusFilter === 'ALL'
                    ? 'Create your first task to get started.'
                    : 'Try a different filter or create a new task.'
                }
                action={
                  statusFilter === 'ALL' ? (
                    <button
                      onClick={() => setTaskFormOpen(true)}
                      className="flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))]"
                    >
                      <Plus size={14} />
                      Create task
                    </button>
                  ) : (
                    <button
                      onClick={() => setStatusFilter('ALL')}
                      className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-sm text-[hsl(var(--foreground-secondary))]"
                    >
                      <RotateCcw size={14} />
                      Clear filter
                    </button>
                  )
                }
              />
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleTaskStatusChange}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      isUpdating={updateTask.isPending}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forms */}
      <DailyTaskForm
        open={dailyFormOpen}
        onClose={() => {
          setDailyFormOpen(false);
          setEditingDailyTemplate(undefined);
        }}
        editingTemplate={editingDailyTemplate}
      />
      <TaskForm
        open={taskFormOpen}
        onClose={() => {
          setTaskFormOpen(false);
          setEditingTask(undefined);
        }}
        editingTask={editingTask}
      />
    </div>
  );
}
