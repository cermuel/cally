import type { AxiosInstance } from "axios";
import { apiRequest } from "./client";

export type TeamBookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";
export type TeamGuestAttendanceStatus = "pending" | "confirmed" | "cancelled";
export type TeamEventStatus = "published" | "draft";

export type TeamBookingEventSummary = {
  id: number;
  name: string;
  slug: string;
  duration_minutes: number;
  description?: string | null;
  color?: string | null;
  pre_meeting_minutes?: number | null;
  post_meeting_minutes?: number | null;
};

export type TeamBookingEvent = TeamBookingEventSummary & {
  user_id: number;
  team_id: number;
  description: string | null;
  color: string | null;
  pre_meeting_minutes: number | null;
  post_meeting_minutes: number | null;
  status: TeamEventStatus;
  visibility: "private" | "public";
  is_profile: boolean;
  is_active: boolean;
  schedule_type: string;
  created_at: string;
  updated_at: string;
};

export type TeamBookingGuest = {
  id: number;
  booking_id: number;
  name: string | null;
  email: string;
  attendance_status: TeamGuestAttendanceStatus;
  created_at: string;
  updated_at: string;
  user_id: number | null;
  user: {
    name: string;
    email: string;
    avatar_url: string | null;
    id: number;
    timezone: string;
  } | null;
};

export type TeamBooking = {
  id: number;
  user_id: number;
  contact_id: number | null;
  event_id: number;
  starts_at: string | null;
  ends_at: string | null;
  booking_timezone: string | null;
  status: TeamBookingStatus;
  provider_event_id: string | null;
  meeting_url: string | null;
  provider: string | null;
  notes: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  event?: TeamBookingEventSummary;
  guests?: TeamBookingGuest[];
};

export type TeamBookingPagination = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
  previous_page_url: string | null;
  next_page_url: string | null;
};

export type TeamBookingListParams = {
  status?: TeamBookingStatus;
  search?: string;
  provider_id?: string;
  date?: string;
  event_id?: number;
  page?: number;
  per_page?: number;
};

export type CreateTeamBookingPayload = {
  event: {
    name: string;
    slug: string;
    duration_minutes: number;
    description?: string | null;
    color?: string | null;
    status?: TeamEventStatus | null;
  };
  booking: {
    starts_at: string;
    ends_at: string;
    timezone: string;
    notes?: string | null;
  };
};

export type UpdateTeamBookingPayload = {
  event?: {
    name?: string;
    slug?: string;
    description?: string | null;
    color?: string | null;
    status?: TeamEventStatus;
    duration_minutes?: number;
    pre_meeting_minutes?: number;
    post_meeting_minutes?: number;
  };
  booking?: {
    status?: TeamBookingStatus;
    starts_at?: string;
    ends_at?: string;
    timezone?: string;
    cancellation_reason?: string | null;
    notes?: string | null;
  };
};

export type ListTeamBookingsResponse = {
  message: string;
  bookings: TeamBooking[];
  pagination: TeamBookingPagination;
};

export type ShowTeamBookingResponse = {
  message: string;
  booking: TeamBooking;
};

export type CreateTeamBookingResponse = {
  message: string;
  event: TeamBookingEvent;
  booking: TeamBooking;
};

export type UpdateTeamBookingResponse = {
  message: string;
  event: TeamBookingEvent;
  booking: TeamBooking;
};

export const teamBookingsApi = {
  list(
    client: AxiosInstance,
    teamId: number,
    params: TeamBookingListParams = {},
  ) {
    return apiRequest<ListTeamBookingsResponse>(client, {
      method: "GET",
      url: `/teams/${teamId}/bookings`,
      params,
    });
  },

  create(
    client: AxiosInstance,
    teamId: number,
    payload: CreateTeamBookingPayload,
  ) {
    return apiRequest<CreateTeamBookingResponse>(client, {
      method: "POST",
      url: `/teams/${teamId}/bookings`,
      data: payload,
    });
  },

  get(client: AxiosInstance, teamId: number, bookingId: number) {
    return apiRequest<ShowTeamBookingResponse>(client, {
      method: "GET",
      url: `/teams/${teamId}/bookings/${bookingId}`,
    });
  },

  update(
    client: AxiosInstance,
    teamId: number,
    bookingId: number,
    payload: UpdateTeamBookingPayload,
  ) {
    return apiRequest<UpdateTeamBookingResponse>(client, {
      method: "PATCH",
      url: `/teams/${teamId}/bookings/${bookingId}`,
      data: payload,
    });
  },

  remove(client: AxiosInstance, teamId: number, bookingId: number) {
    return apiRequest<{ message: "Booking deleted successfully" }>(client, {
      method: "DELETE",
      url: `/teams/${teamId}/bookings/${bookingId}`,
    });
  },
};
