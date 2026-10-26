import type { AxiosInstance } from "axios";
import type { Booking, BookingEvent, BookingHost } from "./bookings";
import { apiRequest } from "./client";

export type RecurrenceFrequency = "daily" | "weekly" | "monthly";
export type RecurrenceStatus = "active" | "cancelled" | "completed";

export type Recurrence = {
  id: number;
  user_id: number;
  event_id: number;
  frequency: RecurrenceFrequency;
  interval: number;
  days_of_week: number[] | null;
  start_time: string;
  starts_on: string;
  ends_on: string;
  occurrence_count?: number | null;
  status: RecurrenceStatus;
  generated_until?: string | null;
  timezone: string;
  schedule_description?: string;
  created_at?: string;
  updated_at?: string;
  user?: Partial<BookingHost> & {
    id?: number;
    username?: string;
  };
  event?: BookingEvent;
  bookings?: Booking[];
};

export type CreateRecurrencePayload = {
  event_id: number;
  contact_id: number;
  frequency: RecurrenceFrequency;
  interval: number;
  days_of_week?: number[];
  starts_on: string;
  ends_on: string;
  start_time: string;
};

export type RecurrenceListParams = {
  event_id?: number;
  page?: number;
};

export type RecurrencePagination = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
  previous_page_url: string | null;
  next_page_url: string | null;
};

export type RecurrenceResponse = {
  message: string;
  recurrence: Recurrence;
};

export type RecurrenceListResponse = {
  message: string;
  recurrences: Recurrence[];
  pagination: RecurrencePagination;
};

export const recurrencesApi = {
  create(client: AxiosInstance, payload: CreateRecurrencePayload) {
    return apiRequest<{ message: string; body: Recurrence }>(client, {
      method: "POST",
      url: "/recurrence",
      data: payload,
    });
  },

  list(client: AxiosInstance, params: RecurrenceListParams = {}) {
    return apiRequest<RecurrenceListResponse>(client, {
      method: "GET",
      url: "/recurrence",
      params,
    });
  },

  get(client: AxiosInstance, id: number) {
    return apiRequest<RecurrenceResponse>(client, {
      method: "GET",
      url: `/recurrence/${id}`,
    });
  },

  getPublic(client: AxiosInstance, id: number, email: string) {
    return apiRequest<RecurrenceResponse>(client, {
      method: "GET",
      url: `/public/recurrence/${id}`,
      params: { email },
    });
  },

  remove(client: AxiosInstance, id: number) {
    return apiRequest<{ message: string }>(client, {
      method: "DELETE",
      url: `/recurrence/${id}`,
    });
  },
};
