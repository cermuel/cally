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
  responses: RescheduleResponse[];
};

export type RescheduleResponse = {
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

export type RescheduleParticipantResponse = RescheduleResponse;

export type CreateReschedulePayload = {
  starts_at: string;
  ends_at: string;
};

export type CreateRescheduleResult = {
  message: string;
  reschedule: Reschedule;
};

type CreatePublicReschedulePayload = CreateReschedulePayload & {
  email: string;
};

type ParticipantResponseResponse = {
  message: string;
  response: RescheduleParticipantResponse;
};

type RescheduleListResponse = {
  message: string;
  reschedules: Reschedule[];
};

type GetRescheduleResult = {
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
    return apiRequest<GetRescheduleResult>(client, {
      method: "GET",
      url: `/reschedules/${rescheduleId}`,
    });
  },

  create(
    client: AxiosInstance,
    bookingId: number,
    payload: CreatePublicReschedulePayload,
  ) {
    return apiRequest<CreateRescheduleResult>(client, {
      method: "POST",
      url: `/public/${bookingId}/reschedule`,
      data: payload,
    });
  },

  initiate(
    client: AxiosInstance,
    bookingId: number,
    payload: CreateReschedulePayload,
  ) {
    return apiRequest<CreateRescheduleResult>(client, {
      method: "POST",
      url: `/bookings/${bookingId}/reschedules`,
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
