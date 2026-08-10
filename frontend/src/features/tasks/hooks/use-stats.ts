import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../api/stats.api';

export const STATS_KEY = ['stats', 'today'] as const;

export function useTodayStats() {
  return useQuery({
    queryKey: STATS_KEY,
    queryFn: () => statsApi.getToday(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
}

export function useRecurringStats(period: 'today' | 'week' | 'month' | '30days' = 'today') {
  return useQuery({
    queryKey: ['stats', 'recurring', period],
    queryFn: () => statsApi.getRecurring(period),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}
