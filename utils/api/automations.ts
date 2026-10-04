import type { AxiosInstance } from "axios";
import { apiRequest } from "./client";

export type AutomationTrigger =
  | "booking.created"
  | "booking.ended"
  | "booking.no_show"
  | "booking.cancelled";

export type AutomationAction =
  | "auto_accept_booking"
  | "send_email"
  | "add_to_contact";

export type GuestType = "pending" | "confirmed" | "cancelled";

export type SendEmailPayload = {
  subject: string;
  body: string;
  guestType?: GuestType;
};

export type AddToContactPayload = {
  email: string;
  name: string;
};

export type AutomationPayload =
  | SendEmailPayload
  | AddToContactPayload
  | Record<string, never>;

export type Automation = {
  id: number;
  user_id: number;
  name: string;
  color: string | null;
  is_active: boolean;
  trigger: AutomationTrigger;
  action: AutomationAction;
  payload: AutomationPayload;
  user?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AutomationTemplate = {
  key: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  action: AutomationAction;
  payload: AutomationPayload | [];
};

export type CreateAutomationPayload = {
  name: string;
  color: string | null;
  trigger: AutomationTrigger;
  action: AutomationAction;
  payload?: AutomationPayload;
};

export type UpdateAutomationPayload = Partial<CreateAutomationPayload> & {
  is_active?: boolean;
};

export type AutomationsListResponse = {
  message: string;
  automations: Automation[];
};

export type AutomationTemplatesResponse = {
  message: string;
  templates: AutomationTemplate[];
};

export type AutomationVariablesResponse = {
  message: string;
  templates: Record<string, string>;
};

export type CreateAutomationResponse = {
  message: string;
  automation?: Automation;
};

export type AutomationResponse = {
  message: string;
  automation: Automation;
};

export type DeleteAutomationResponse = {
  message: string;
};

export const automationsApi = {
  list(client: AxiosInstance) {
    return apiRequest<AutomationsListResponse>(client, {
      method: "GET",
      url: "/automations",
    });
  },

  templates(client: AxiosInstance) {
    return apiRequest<AutomationTemplatesResponse>(client, {
      method: "GET",
      url: "/automations/templates",
    });
  },

  variables(client: AxiosInstance) {
    return apiRequest<AutomationVariablesResponse>(client, {
      method: "GET",
      url: "/automations/variables",
    });
  },

  create(client: AxiosInstance, payload: CreateAutomationPayload) {
    return apiRequest<CreateAutomationResponse>(client, {
      method: "POST",
      url: "/automations",
      data: payload,
    });
  },

  update(
    client: AxiosInstance,
    id: number,
    payload: UpdateAutomationPayload,
  ) {
    return apiRequest<AutomationResponse>(client, {
      method: "PATCH",
      url: `/automations/${id}`,
      data: payload,
    });
  },

  remove(client: AxiosInstance, id: number) {
    return apiRequest<DeleteAutomationResponse>(client, {
      method: "DELETE",
      url: `/automations/${id}`,
    });
  },
};
