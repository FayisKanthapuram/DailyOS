import { useQuery } from '@tanstack/react-query';
import { calendarApi } from '../api/calendar.api';

export const CALENDAR_KEYS = {
  range: (startDate: string, endDate: string) => ['calendar', startDate, endDate] as const,
};

export function useCalendarData(startDate: string, endDate: string) {
  return useQuery({
    queryKey: CALENDAR_KEYS.range(startDate, endDate),
    queryFn: () => calendarApi.getCalendarData(startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!startDate && !!endDate,
  });
}
