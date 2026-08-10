import { api } from '@/lib/api';
import type {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskFilters,
  Subtask,
  CreateSubtaskPayload,
  UpdateSubtaskPayload,
  ReorderSubtasksPayload,
} from '../types/task.types';

export const tasksApi = {
  async list(filters: TaskFilters = {}): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.tagId) params.set('tagId', filters.tagId);
    if (filters.search) params.set('search', filters.search);
    if (filters.overdue) params.set('overdue', 'true');
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.cursor) params.set('cursor', filters.cursor);

    const query = params.toString();
    const { data } = await api.get<Task[]>(`/tasks${query ? `?${query}` : ''}`);
    return data;
  },

  async create(payload: CreateTaskPayload): Promise<Task> {
    const { data } = await api.post<Task>('/tasks', payload);
    return data;
  },

  async getOne(id: string): Promise<Task> {
    const { data } = await api.get<Task>(`/tasks/${id}`);
    return data;
  },

  async update(id: string, payload: UpdateTaskPayload): Promise<Task> {
    const { data } = await api.patch<Task>(`/tasks/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  // Subtasks
  async addSubtask(taskId: string, payload: CreateSubtaskPayload): Promise<Subtask> {
    const { data } = await api.post<Subtask>(`/tasks/${taskId}/subtasks`, payload);
    return data;
  },

  async updateSubtask(
    taskId: string,
    subtaskId: string,
    payload: UpdateSubtaskPayload,
  ): Promise<Subtask> {
    const { data } = await api.patch<Subtask>(`/tasks/${taskId}/subtasks/${subtaskId}`, payload);
    return data;
  },

  async removeSubtask(taskId: string, subtaskId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
  },

  async reorderSubtasks(taskId: string, payload: ReorderSubtasksPayload): Promise<void> {
    await api.patch(`/tasks/${taskId}/subtasks/reorder`, payload);
  },
};
