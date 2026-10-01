import type { AxiosInstance } from "axios";
import { apiRequest } from "./client";
import type { TokenAuthResponse } from "./auth";

export type GoogleAuthIntent = "login" | "register";

export type GoogleRedirectResponse = {
  url: string;
};

type GoogleCallbackParams = {
  code: string;
  state: string;
  redirect_uri: string;
};

export const googleApi = {
  getAuthRedirect(
    client: AxiosInstance,
    params: {
      intent: GoogleAuthIntent;
      redirect_uri: string;
    },
  ) {
    return apiRequest<GoogleRedirectResponse>(client, {
      method: "GET",
      url: "/google/redirect",
      params,
    });
  },

  completeAuth(client: AxiosInstance, params: GoogleCallbackParams) {
    return apiRequest<TokenAuthResponse>(client, {
      method: "GET",
      url: "/google/callback",
      params,
    });
  },

  getCalendarRedirect(client: AxiosInstance) {
    return apiRequest<GoogleRedirectResponse>(client, {
      method: "GET",
      url: "/connections/google/redirect",
    });
  },
};
