import { api } from '@/lib/api';
import type {
  DailyTaskTemplate,
  DailyTaskInstance,
  CreateDailyTaskPayload,
  UpdateDailyTaskPayload,
  UpdateDailyInstancePayload,
} from '../types/task.types';

export const dailyTasksApi = {
  async listTemplates(): Promise<DailyTaskTemplate[]> {
    const { data } = await api.get<DailyTaskTemplate[]>('/tasks/daily');
    return data;
  },

  async createTemplate(payload: CreateDailyTaskPayload): Promise<DailyTaskTemplate> {
    const { data } = await api.post<DailyTaskTemplate>('/tasks/daily', payload);
    return data;
  },

  async updateTemplate(id: string, payload: UpdateDailyTaskPayload): Promise<DailyTaskTemplate> {
    const { data } = await api.patch<DailyTaskTemplate>(`/tasks/daily/${id}`, payload);
    return data;
  },

  async deactivateTemplate(id: string): Promise<void> {
    await api.delete(`/tasks/daily/${id}`);
  },

  async deleteTemplatePermanently(id: string): Promise<void> {
    await api.delete(`/tasks/daily/${id}/permanent`);
  },

  async getToday(date?: string): Promise<DailyTaskInstance[]> {
    const params = date ? `?date=${date}` : '';
    const { data } = await api.get<DailyTaskInstance[]>(`/tasks/daily/today${params}`);
    return data;
  },

  async updateInstance(
    instanceId: string,
    payload: UpdateDailyInstancePayload,
  ): Promise<DailyTaskInstance> {
    const { data } = await api.patch<DailyTaskInstance>(
      `/tasks/daily/instances/${instanceId}`,
      payload,
    );
    return data;
  },

  async getHistory(templateId: string, limit = 30): Promise<DailyTaskInstance[]> {
    const { data } = await api.get<DailyTaskInstance[]>(
      `/tasks/daily/${templateId}/history?limit=${limit}`,
    );
    return data;
  },
};
