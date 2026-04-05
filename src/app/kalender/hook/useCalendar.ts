import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { api } from '@/lib/api';

import { ApiError, ApiResponse } from '@/types/api';
import { CalendarEvent } from '@/types/entities/calendar';

export const useGetCalendarEvents = () => {
  const {
    data: calendarData,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse<CalendarEvent[]>, AxiosError<ApiError>>({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<CalendarEvent[]>>('/calendar/events');
      return res.data;
    },
  });

  return {
    data: calendarData?.data ?? [],
    isLoading,
    error: isError ? 'Failed to fetch calendar events' : null,
    fetchCalendarEvents: refetch,
  };
};
