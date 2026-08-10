import { api } from '@/lib/api';
import type { CalendarDataResponse } from '../types/calendar.types';

export const calendarApi = {
  async getCalendarData(startDate: string, endDate: string): Promise<CalendarDataResponse> {
    const { data } = await api.get<CalendarDataResponse>(
      `/calendar?startDate=${startDate}&endDate=${endDate}`,
    );
    return data;
  },
};
