import { api } from '@/lib/api';
import type { TodaySummary } from '../types/task.types';

export const statsApi = {
  async getToday(): Promise<TodaySummary> {
    const { data } = await api.get<TodaySummary>('/stats/today');
    return data;
  },
};
