// Task types matching the backend Prisma schema and DTOs

export type Priority = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';

// ─────────────────────────────────────────────
// Category & Tag
// ─────────────────────────────────────────────

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Daily Tasks
// ─────────────────────────────────────────────

export interface DailyTaskTemplate {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  priority: Priority;
  categoryId: string | null;
  time: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  category: Category | null;
  tags: Array<{ tag: Tag }>;
}

export interface DailyTaskInstance {
  id: string;
  templateId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  snapshotTitle: string;
  isCompleted: boolean;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  template: DailyTaskTemplate;
}

export interface CreateDailyTaskPayload {
  title: string;
  description?: string;
  priority?: Priority;
  categoryId?: string;
  time?: string;
  tagIds?: string[];
  order?: number;
}

export interface UpdateDailyTaskPayload {
  title?: string;
  description?: string;
  priority?: Priority;
  categoryId?: string | null;
  time?: string | null;
  tagIds?: string[];
  order?: number;
  isActive?: boolean;
}

export interface UpdateDailyInstancePayload {
  isCompleted?: boolean;
  notes?: string;
}

// ─────────────────────────────────────────────
// Normal Tasks
// ─────────────────────────────────────────────

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  categoryId: string | null;
  dueDate: string | null; // YYYY-MM-DD
  dueTime: string | null; // HH:MM
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category: Category | null;
  tags: Array<{ tag: Tag }>;
  subtasks: Subtask[];
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  categoryId?: string;
  dueDate?: string;
  dueTime?: string;
  tagIds?: string[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  categoryId?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  tagIds?: string[];
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  categoryId?: string;
  tagId?: string;
  search?: string;
  overdue?: boolean;
  limit?: number;
  cursor?: string;
}

export interface CreateSubtaskPayload {
  title: string;
  order?: number;
}

export interface UpdateSubtaskPayload {
  title?: string;
  isCompleted?: boolean;
  order?: number;
}

export interface ReorderSubtasksPayload {
  subtasks: Array<{ id: string; order: number }>;
}

// ─────────────────────────────────────────────
// Category / Tag payloads
// ─────────────────────────────────────────────

export interface CreateCategoryPayload {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  color?: string;
  icon?: string;
}

export interface CreateTagPayload {
  name: string;
  color?: string;
}

export interface UpdateTagPayload {
  name?: string;
  color?: string;
}

// ─────────────────────────────────────────────
// Stats
// ─────────────────────────────────────────────

export interface TodaySummary {
  date: string;
  timezone: string;
  dailyTasks: {
    total: number;
    completed: number;
  };
  overdueTasksCount: number;
  streak: number;
}
