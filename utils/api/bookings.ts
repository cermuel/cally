import type { AxiosInstance } from "axios";
import type { Contact } from "./contacts";
import { apiRequest } from "./client";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type BookingScope =
  | "all"
  | "upcoming"
  | "pending"
  | "cancelled"
  | "past";
export type GuestAttendanceStatus = "pending" | "confirmed" | "cancelled";

export type BookingGuest = {
  id: number;
  booking_id: number;
  name: string | null;
  email: string;
  attendance_status: GuestAttendanceStatus;
  created_at: string;
  updated_at: string;
};

export type BookingEvent = {
  id: number;
  name: string;
  slug?: string;
  duration_minutes: number;
};

export type BookingHost = {
  name: string;
  email: string;
  avatar: string | null;
  timezone: string;
};

export type Booking = {
  id: number;
  user_id: number;
  contact_id: number | null;
  event_id: number | string;
  starts_at: string | null;
  ends_at: string | null;
  booking_timezone: string | null;
  status: BookingStatus;
  provider_event_id: string | null;
  meeting_url: string | null;
  provider: string | null;
  notes: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  contact?: Contact | null;
  event?: BookingEvent;
  host?: BookingHost;
  guests?: BookingGuest[];
};

export type BookingPaginator = {
  current_page: number;
  data: Booking[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: Array<{ active: boolean; label: string; url: string | null }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
};

export type BookingListResponse = {
  message: string;
  bookings: BookingPaginator;
};

export type BookingListParams = {
  status?: BookingStatus;
  provider_id?: string;
  date?: string;
  event_id?: string | number;
  page?: number;
  per_page?: number;
};

export type BookingResponse = {
  message: string;
  booking: Booking;
};

export type CreateBookingPayload = {
  event_id: string | number;
  starts_at: string;
  ends_at: string;
  timezone: string;
  notes?: string | null;
};

export type UpdateBookingPayload = {
  contact_id?: number | null;
  status?: BookingStatus;
  starts_at?: string | null;
  ends_at?: string | null;
  cancellation_reason?: string | null;
  notes?: string | null;
  event_id?: string | number | null;
};

export type PublicSchedulePayload = {
  username: string;
  event_id: string;
  date: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  notes?: string | null;
  guests: [
    {
      name: string;
      email: string;
      attendance_status: GuestAttendanceStatus;
    },
    ...Array<{
      email: string;
      name?: never;
      attendance_status?: never;
    }>,
  ];
};

export type PublicScheduleResponse = {
  message: string;
  booking: Booking;
  guests: BookingGuest[];
};

export const bookingsApi = {
  create(client: AxiosInstance, payload: CreateBookingPayload) {
    return apiRequest<BookingResponse>(client, {
      method: "POST",
      url: "/bookings",
      data: payload,
    });
  },

  list(client: AxiosInstance, params: BookingListParams = {}) {
    return apiRequest<BookingListResponse>(client, {
      method: "GET",
      url: "/bookings",
      params,
    });
  },

  get(client: AxiosInstance, id: number) {
    return apiRequest<BookingResponse>(client, {
      method: "GET",
      url: `/bookings/${id}`,
    });
  },

  details(client: AxiosInstance, id: number) {
    return apiRequest<BookingResponse>(client, {
      method: "GET",
      url: `/bookings/details/${id}`,
    });
  },

  update(client: AxiosInstance, id: number, payload: UpdateBookingPayload) {
    return apiRequest<BookingResponse>(client, {
      method: "PATCH",
      url: `/bookings/${id}`,
      data: payload,
    });
  },

  remove(client: AxiosInstance, id: number) {
    return apiRequest<{ message: string }>(client, {
      method: "DELETE",
      url: `/bookings/${id}`,
    });
  },

  schedule(client: AxiosInstance, payload: PublicSchedulePayload) {
    return apiRequest<PublicScheduleResponse>(client, {
      method: "POST",
      url: "/public/schedule",
      data: payload,
    });
  },

  requestReschedule(
    client: AxiosInstance,
    id: number,
    payload: { email: string; note: string },
  ) {
    return apiRequest<{ message: string }>(client, {
      method: "POST",
      url: `/bookings/${id}/reschedule-requests`,
      data: payload,
    });
  },
};
