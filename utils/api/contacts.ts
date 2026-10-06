import type { AxiosInstance } from "axios";
import type { Booking } from "./bookings";
import { apiRequest } from "./client";

export type ContactUser = {
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  email_verified_at: string | null;
  onboarding_completed_at: string | null;
  timezone: string | null;
  description: string | null;
};

export type Contact = {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  timezone: string | null;
  company: string | null;
  tag: string | null;
  user_id: number;
  platform_user_id: number | null;
  notes: string | null;
  bookings_count: number;
  last_booked_at: string | null;
  created_at: string;
  updated_at: string;
  platformUser?: ContactUser | null;
  owner?: ContactUser;
  bookings?: Booking[];
};

export const contactSortFields = [
  "id",
  "name",
  "email",
  "phone",
  "timezone",
  "company",
  "tag",
  "bookings_count",
  "last_booked_at",
  "created_at",
  "updated_at",
] as const;

export type ContactSortField = (typeof contactSortFields)[number];
export type ContactSortDirection = "asc" | "desc";

export type ContactListParams = {
  search?: string;
  sort_by?: ContactSortField;
  direction?: ContactSortDirection;
  page?: number;
  per_page?: number;
};

export type ContactPagination = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
  previous_page_url: string | null;
  next_page_url: string | null;
};

export type ContactListResponse = {
  message: string;
  contacts: Contact[];
  pagination: ContactPagination;
};

export type ContactResponse = {
  message: string;
  contact: Contact;
};

export type ContactBookingsParams = {
  page?: number;
  per_page?: number;
};

export type CreateContactBookingPayload = {
  event_id: string | number;
  starts_at: string;
  ends_at: string;
  timezone: string;
  notes?: string | null;
};

export type ContactBookingsResponse = {
  message: string;
  contact: Contact;
  pagination: ContactPagination;
};

export type CreateContactPayload = {
  email: string;
  name?: string | null;
  phone?: string | null;
  timezone?: string | null;
  company?: string | null;
  tag?: string | null;
  notes?: string | null;
};

export type UpdateContactPayload = Partial<CreateContactPayload>;

export const contactsApi = {
  list(client: AxiosInstance, params: ContactListParams = {}) {
    return apiRequest<ContactListResponse>(client, {
      method: "GET",
      url: "/contacts",
      params,
    });
  },

  create(client: AxiosInstance, payload: CreateContactPayload) {
    return apiRequest<ContactResponse>(client, {
      method: "POST",
      url: "/contacts",
      data: payload,
    });
  },

  get(client: AxiosInstance, id: number) {
    return apiRequest<ContactResponse>(client, {
      method: "GET",
      url: `/contacts/${id}`,
    });
  },

  bookings(
    client: AxiosInstance,
    id: number,
    params: ContactBookingsParams = { per_page: 15 },
  ) {
    return apiRequest<ContactBookingsResponse>(client, {
      method: "GET",
      url: `/contacts/${id}/bookings`,
      params,
    });
  },

  createBooking(
    client: AxiosInstance,
    id: number,
    payload: CreateContactBookingPayload,
  ) {
    return apiRequest<{ message: string; booking: Booking }>(client, {
      method: "POST",
      url: `/contacts/${id}/bookings`,
      data: payload,
    });
  },

  update(client: AxiosInstance, id: number, payload: UpdateContactPayload) {
    return apiRequest<ContactResponse>(client, {
      method: "PATCH",
      url: `/contacts/${id}`,
      data: payload,
    });
  },

  remove(client: AxiosInstance, id: number) {
    return apiRequest<{ message: string }>(client, {
      method: "DELETE",
      url: `/contacts/${id}`,
    });
  },

  removeMany(client: AxiosInstance, ids: number[]) {
    return apiRequest<{ message: string }>(client, {
      method: "DELETE",
      url: "/contacts",
      data: { ids },
    });
  },
};
