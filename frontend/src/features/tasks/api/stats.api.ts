import { api } from '@/lib/api';
import type { TodaySummary, RecurringStatsResponse } from '../types/task.types';

export const statsApi = {
  async getToday(): Promise<TodaySummary> {
    const { data } = await api.get<TodaySummary>('/stats/today');
    return data;
  },
  async getRecurring(period = 'today'): Promise<RecurringStatsResponse> {
    const { data } = await api.get<RecurringStatsResponse>(`/stats/recurring?period=${period}`);
    return data;
  },
};
