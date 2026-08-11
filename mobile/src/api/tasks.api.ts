import { apiClient } from './client';
import type {
  UnifiedTasksResponse,
  DailyTaskTemplate,
  CreateNormalTaskDto,
  UpdateNormalTaskDto,
  CreateRecurringTaskDto,
  UpdateRecurringTaskDto,
  TaskCategory,
} from '../types/task.types';

// ── Unified Tasks ─────────────────────────────────────────────────────────────

export const tasksApi = {
  /**
   * GET /tasks/unified?date=YYYY-MM-DD
   * Returns one-time tasks + recurring instances for a specific date.
   */
  getUnified: async (date: string): Promise<UnifiedTasksResponse> => {
    const { data } = await apiClient.get<UnifiedTasksResponse>('/tasks/unified', {
      params: { date },
    });
    return data;
  },

  // ── Normal Tasks ────────────────────────────────────────────────────────────

  /**
   * POST /tasks
   * Create a one-time task.
   */
  createTask: async (dto: CreateNormalTaskDto) => {
    const { data } = await apiClient.post('/tasks', dto);
    return data;
  },

  /**
   * PATCH /tasks/:id
   * Update any fields including status (for completion).
   */
  updateTask: async (taskId: string, dto: UpdateNormalTaskDto) => {
    const { data } = await apiClient.patch(`/tasks/${taskId}`, dto);
    return data;
  },

  /**
   * DELETE /tasks/:id
   */
  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}`);
  },

  // ── Recurring Templates ─────────────────────────────────────────────────────

  /**
   * GET /tasks/daily
   * List recurring task templates.
   */
  getTemplates: async (includeInactive = true): Promise<DailyTaskTemplate[]> => {
    const { data } = await apiClient.get<DailyTaskTemplate[]>('/tasks/daily', {
      params: { includeInactive },
    });
    return data;
  },

  /**
   * POST /tasks/daily
   * Create a recurring task template (DAILY / WEEKLY / MONTHLY).
   */
  createTemplate: async (dto: CreateRecurringTaskDto) => {
    const { data } = await apiClient.post('/tasks/daily', dto);
    return data;
  },

  /**
   * PATCH /tasks/daily/:id
   * Update a template (title, frequency, isActive, etc).
   */
  updateTemplate: async (templateId: string, dto: UpdateRecurringTaskDto) => {
    const { data } = await apiClient.patch(`/tasks/daily/${templateId}`, dto);
    return data;
  },

  /**
   * DELETE /tasks/daily/:id
   * Soft-deactivate (preserves history).
   */
  deactivateTemplate: async (templateId: string): Promise<void> => {
    await apiClient.delete(`/tasks/daily/${templateId}`);
  },

  /**
   * DELETE /tasks/daily/:id/permanent
   * Hard delete + all history.
   */
  deleteTemplatePermanently: async (templateId: string): Promise<void> => {
    await apiClient.delete(`/tasks/daily/${templateId}/permanent`);
  },

  // ── Recurring Instance Completion ───────────────────────────────────────────

  /**
   * PATCH /tasks/daily/instances/:instanceId
   * Mark a daily instance as completed / uncompleted.
   */
  updateInstance: async (instanceId: string, isCompleted: boolean) => {
    const { data } = await apiClient.patch(`/tasks/daily/instances/${instanceId}`, { isCompleted });
    return data;
  },

  // ── Skip / Undo Skip ────────────────────────────────────────────────────────

  /**
   * POST /tasks/daily/:templateId/exceptions
   * Skip a recurring task on a specific date.
   */
  skipOccurrence: async (templateId: string, date: string) => {
    const { data } = await apiClient.post(`/tasks/daily/${templateId}/exceptions`, {
      date,
      type: 'SKIP',
    });
    return data;
  },

  /**
   * DELETE /tasks/daily/:templateId/exceptions/:date
   * Undo skip for a recurring task on a specific date.
   */
  undoSkip: async (templateId: string, date: string): Promise<void> => {
    await apiClient.delete(`/tasks/daily/${templateId}/exceptions/${date}`);
  },
};

// ── Categories ────────────────────────────────────────────────────────────────

export const categoriesApi = {
  getAll: async (): Promise<TaskCategory[]> => {
    const { data } = await apiClient.get<TaskCategory[]>('/categories');
    return data;
  },
};
