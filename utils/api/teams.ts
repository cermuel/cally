import type { AxiosInstance } from "axios";
import { apiRequest } from "./client";

export type TeamRole = "admin" | "member";

export type TeamUser = {
  id: number;
  name: string | null;
  username: string | null;
  email: string;
  avatar: string | null;
  email_verified_at: string | null;
  onboarding_completed_at: string | null;
  timezone: string;
  description: string | null;
  notification_preference?: object;
};

export type TeamMember = {
  id: number;
  team_id: number;
  user_id: number;
  role: TeamRole;
  user?: TeamUser;
  created_at: string;
  updated_at: string;
};

export type Team = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
  owner_id: number;
  owner?: TeamUser;
  members?: TeamMember[];
  created_at: string;
  updated_at: string;
};

export type TeamInvite = {
  id: number;
  email: string;
  team_id: number;
  expires_at: string;
  accepted_at: string | null;
  declined_at: string | null;
  role: TeamRole;
  team?: Team;
};

export type Pagination = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
  previous_page_url: string | null;
  next_page_url: string | null;
};

export type CreateTeamPayload = {
  name: string;
  slug: string;
  description?: string | null;
  avatar_url?: string | null;
};

export type UpdateTeamPayload = Partial<CreateTeamPayload>;

export type TeamsResponse = {
  message: string;
  teams: Team[];
  pagination: Pagination;
};

export type TeamResponse = {
  message: string;
  team: Team;
};

export type TeamMembersResponse = {
  message: string;
  members: TeamMember[];
  pagination: Pagination;
};

export type TeamMemberResponse = {
  message: string;
  member: TeamMember;
};

export type TeamInvitesResponse = {
  message: string;
  invites: TeamInvite[];
  pagination: Pagination;
};

export type TeamInviteResponse = {
  message: string;
  invite: TeamInvite;
};

export type TeamInviteUser = {
  email: string;
  role: TeamRole;
};

export type CreateTeamInvitesPayload = {
  users: TeamInviteUser[];
};

export type CreateTeamInvitesResponse = {
  message: string;
  invites: TeamInvite[];
  batch_id: string;
};

export const teamsApi = {
  list(client: AxiosInstance, page = 1) {
    return apiRequest<TeamsResponse>(client, {
      method: "GET",
      url: "/teams",
      params: { page },
    });
  },

  create(client: AxiosInstance, payload: CreateTeamPayload) {
    return apiRequest<TeamResponse>(client, {
      method: "POST",
      url: "/teams",
      data: payload,
    });
  },

  get(client: AxiosInstance, teamId: number) {
    return apiRequest<TeamResponse>(client, {
      method: "GET",
      url: `/teams/${teamId}`,
    });
  },

  update(client: AxiosInstance, teamId: number, payload: UpdateTeamPayload) {
    return apiRequest<TeamResponse>(client, {
      method: "PATCH",
      url: `/teams/${teamId}`,
      data: payload,
    });
  },

  remove(client: AxiosInstance, teamId: number) {
    return apiRequest<{ message: string }>(client, {
      method: "DELETE",
      url: `/teams/${teamId}`,
    });
  },

  listMembers(client: AxiosInstance, teamId: number, page = 1) {
    return apiRequest<TeamMembersResponse>(client, {
      method: "GET",
      url: `/teams/${teamId}/members`,
      params: { page },
    });
  },

  updateMember(
    client: AxiosInstance,
    teamId: number,
    memberId: number,
    role: TeamRole,
  ) {
    return apiRequest<TeamMemberResponse>(client, {
      method: "PATCH",
      url: `/teams/${teamId}/members/${memberId}`,
      data: { role },
    });
  },

  removeMember(client: AxiosInstance, teamId: number, memberId: number) {
    return apiRequest<{ message: string }>(client, {
      method: "DELETE",
      url: `/teams/${teamId}/members/${memberId}`,
    });
  },

  leave(client: AxiosInstance, teamId: number) {
    return apiRequest<{ message: string }>(client, {
      method: "POST",
      url: `/teams/${teamId}/leave`,
    });
  },

  listInvites(client: AxiosInstance, teamId: number, page = 1) {
    return apiRequest<TeamInvitesResponse>(client, {
      method: "GET",
      url: `/teams/${teamId}/invite`,
      params: { page },
    });
  },

  invite(
    client: AxiosInstance,
    teamId: number,
    payload: CreateTeamInvitesPayload,
  ) {
    return apiRequest<CreateTeamInvitesResponse>(client, {
      method: "POST",
      url: `/teams/${teamId}/invite`,
      data: payload,
    });
  },

  updateInvite(
    client: AxiosInstance,
    teamId: number,
    inviteId: number,
    role: TeamRole,
  ) {
    return apiRequest<TeamInviteResponse>(client, {
      method: "PATCH",
      url: `/teams/${teamId}/invite/${inviteId}`,
      data: { role },
    });
  },

  removeInvite(client: AxiosInstance, teamId: number, inviteId: number) {
    return apiRequest<{ message: string }>(client, {
      method: "DELETE",
      url: `/teams/${teamId}/invite/${inviteId}`,
    });
  },

  getInvite(
    client: AxiosInstance,
    params: { id: number; email: string; token: string },
  ) {
    return apiRequest<TeamInviteResponse>(client, {
      method: "GET",
      url: "/team/invite",
      params,
    });
  },

  acceptInvite(client: AxiosInstance, inviteId: number, token: string) {
    return apiRequest<{ message: string }>(client, {
      method: "POST",
      url: `/teams/accept-invite/${inviteId}`,
      data: { token },
    });
  },
};
