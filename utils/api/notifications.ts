import type { AxiosInstance } from "axios";
import { apiRequest } from "./client";

export type Notification = {
  id: number;
  user_id?: number;
  type: "booking.created" | string;
  title: string;
  message: string | null;
  action_url: string | null;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
  updated_at?: string;
};

export type NotificationPagination = {
  current_page: number;
  data: Notification[];
  from: number | null;
  last_page: number;
  next_page_url: string | null;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
};

export type NotificationListParams = {
  is_read?: 0 | 1;
  type?: string;
  page?: number;
};

export type NotificationListResponse = {
  message: string;
  notifications: NotificationPagination;
};

export type NotificationResponse = {
  message: string;
  notification: Notification;
};

export type NotificationUnreadCountResponse = {
  message: string;
  count: number;
};

export const notificationsApi = {
  test(client: AxiosInstance) {
    return apiRequest<NotificationResponse>(client, {
      method: "GET",
      url: "/notifications/test",
    });
  },

  list(client: AxiosInstance, params: NotificationListParams = {}) {
    return apiRequest<NotificationListResponse>(client, {
      method: "GET",
      url: "/notifications",
      params,
    });
  },

  unreadCount(client: AxiosInstance) {
    return apiRequest<NotificationUnreadCountResponse>(client, {
      method: "GET",
      url: "/notifications/unread-count",
    });
  },

  markRead(client: AxiosInstance, id: number) {
    return apiRequest<NotificationResponse>(client, {
      method: "PATCH",
      url: `/notifications/${id}/read`,
    });
  },

  markAllRead(client: AxiosInstance) {
    return apiRequest<{ message: string }>(client, {
      method: "PATCH",
      url: "/notifications/read-all",
    });
  },
};
