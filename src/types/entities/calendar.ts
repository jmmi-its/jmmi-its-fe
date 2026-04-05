export type CalendarRecurrenceType = 'weekly' | 'monthly' | 'custom_period';

export interface CalendarEvent {
  event_id: string;
  event_name: string;
  event_date: string;
  event_time: string;
  location: string;
  is_recurring: boolean;
  recurrence_type: CalendarRecurrenceType | null;
  recurrence_interval: number;
  notes: string | null;
  timestamp: string;
  updated_at: string;
}

export interface CreateCalendarEventRequest {
  event_name: string;
  event_date: string;
  event_time: string;
  location: string;
  is_recurring: boolean;
  recurrence_type?: CalendarRecurrenceType | null;
  recurrence_interval?: number;
  notes?: string;
}

export interface UpdateCalendarEventRequest {
  event_name?: string;
  event_date?: string;
  event_time?: string;
  location?: string;
  is_recurring?: boolean;
  recurrence_type?: CalendarRecurrenceType | null;
  recurrence_interval?: number;
  notes?: string | null;
}
