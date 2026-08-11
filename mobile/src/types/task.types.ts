export type TaskSource = 'NORMAL' | 'DAILY';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
}

export interface TaskTag {
  tagId: string;
  tag: { id: string; name: string; color: string };
}

export interface UnifiedTaskItem {
  id: string;
  source: TaskSource;
  title: string;
  description?: string | null;
  status: string;
  completed: boolean;
  skipped: boolean;
  priority: TaskPriority;
  frequency?: RecurrenceFrequency;
  category?: TaskCategory | null;
  tags: TaskTag[];
  dueDate?: string | null;
  dueTime?: string | null;
  templateId?: string | null;
  instanceId?: string | null;
  isFutureProjection?: boolean;
  isOverdue?: boolean;
  originalTask?: Record<string, unknown>;
  originalInstance?: Record<string, unknown>;
  originalTemplate?: Record<string, unknown>;
}

export interface UnifiedTaskStats {
  total: number;
  completed: number;
  skipped: number;
  overdue: number;
}

export interface UnifiedTasksResponse {
  date: string;
  today: string;
  userTimezone: string;
  tasks: UnifiedTaskItem[];
  stats: UnifiedTaskStats;
}

export interface DailyTaskTemplate {
  id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  frequency: RecurrenceFrequency;
  time?: string | null;
  isActive: boolean;
  categoryId?: string | null;
  category?: TaskCategory | null;
  tags: TaskTag[];
  createdAt: string;
  updatedAt: string;
}

// Creation/Update DTOs

export interface CreateNormalTaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  categoryId?: string;
  dueDate?: string;
  dueTime?: string;
  tagIds?: string[];
}

export interface UpdateNormalTaskDto extends Partial<CreateNormalTaskDto> {
  status?: TaskStatus;
}

export interface CreateRecurringTaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  frequency?: RecurrenceFrequency;
  categoryId?: string;
  time?: string;
  tagIds?: string[];
}

export interface UpdateRecurringTaskDto extends Partial<CreateRecurringTaskDto> {
  isActive?: boolean;
}
