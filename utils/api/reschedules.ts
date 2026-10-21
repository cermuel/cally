import type { AxiosInstance } from "axios";
import type { BookingGuest } from "./bookings";
import { apiRequest } from "./client";

export type RescheduleStatus = "pending" | "accepted" | "declined";
export type RescheduleDecision = Exclude<RescheduleStatus, "pending">;

export type Reschedule = {
  id: number;
  booking_id: number;
  status: RescheduleStatus;
  starts_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
};

export type RescheduleParticipantResponse = {
  id: number;
  reschedule_id: number;
  guest_id: number | null;
  user_id: number | null;
  email: string;
  status: RescheduleStatus;
  created_at: string;
  updated_at: string;
  guest?: BookingGuest;
};

export type CreateReschedulePayload = {
  email: string;
  starts_at: string;
  ends_at: string;
};

type CreateRescheduleResponse = {
  message: string;
  reschedule: Reschedule;
};

type ParticipantResponseResponse = {
  message: string;
  response: RescheduleParticipantResponse;
};

type RescheduleListResponse = {
  message: string;
  reschedules: Reschedule[];
};

type RescheduleResponse = {
  message: string;
  reschedule: Reschedule;
};

export const reschedulesApi = {
  list(client: AxiosInstance, bookingId: number) {
    return apiRequest<RescheduleListResponse>(client, {
      method: "GET",
      url: "/reschedules",
      params: { booking_id: bookingId },
    });
  },

  get(client: AxiosInstance, rescheduleId: number) {
    return apiRequest<RescheduleResponse>(client, {
      method: "GET",
      url: `/reschedules/${rescheduleId}`,
    });
  },

  create(
    client: AxiosInstance,
    bookingId: number,
    payload: CreateReschedulePayload,
  ) {
    return apiRequest<CreateRescheduleResponse>(client, {
      method: "POST",
      url: `/public/${bookingId}/reschedule`,
      data: payload,
    });
  },

  getParticipantResponse(
    client: AxiosInstance,
    email: string,
    rescheduleId: number,
  ) {
    return apiRequest<ParticipantResponseResponse>(client, {
      method: "GET",
      url: `/public/reschedule-responses/${encodeURIComponent(email)}`,
      params: { reschedule_id: rescheduleId },
    });
  },

  updateParticipantResponse(
    client: AxiosInstance,
    responseId: number,
    status: RescheduleDecision,
  ) {
    return apiRequest<ParticipantResponseResponse>(client, {
      method: "PATCH",
      url: `/public/reschedule-responses/${responseId}`,
      data: { status },
    });
  },
};
