import type { Task, DailyTaskInstance, DailyTaskTemplate } from '@/features/tasks/types/task.types';

export type CalendarViewMode = 'month' | 'week' | 'day';

export interface CalendarDataResponse {
  startDate: string;
  endDate: string;
  today: string;
  userTimezone: string;
  normalTasks: Task[];
  dailyInstances: DailyTaskInstance[];
  dailyTemplates: DailyTaskTemplate[];
  unscheduledTasks: Task[];
}

export interface CalendarEventItem {
  id: string;
  type: 'normal' | 'daily_instance' | 'daily_projection';
  title: string;
  date: string; // YYYY-MM-DD
  time: string | null; // HH:MM or null
  isCompleted: boolean;
  priority: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: { id: string; name: string; color: string; icon: string | null } | null;
  tags: Array<{ tag: { id: string; name: string; color: string } }>;
  isOverdue?: boolean;
  isReadOnlyFuture?: boolean;
  originalTask?: Task;
  originalInstance?: DailyTaskInstance;
  originalTemplate?: DailyTaskTemplate;
}
