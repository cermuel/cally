import type { AxiosInstance } from "axios";
import { apiRequest } from "./client";

export type Connection = {
  user_id: number;
  provider: string;
  provider_account_id: string | null;
  email: string | null;
  calendar_id: string;
  scopes: string[] | null;
};

export type ConnectionsResponse = {
  message: string;
  connection: Connection[];
};

export const connectionsApi = {
  list(client: AxiosInstance) {
    return apiRequest<ConnectionsResponse>(client, {
      method: "GET",
      url: "/connections",
    });
  },
};
