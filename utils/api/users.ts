import type { AxiosInstance } from 'axios'
import type {
  AuthUser,
  AuthUserResponse,
  MessageResponse,
  NotificationPreferences,
  OtpChallengeResponse,
  VerifyOtpPayload,
} from './auth'
import { apiRequest } from './client'

export type CheckUsernameResponse = MessageResponse & {
  username: string
}

export type EditProfilePayload = {
  name?: string
  username?: string
  description?: string | null
  avatar_url?: string
  timezone?: string
  notification_preference?: Partial<{
    [Key in keyof NotificationPreferences]: Partial<NotificationPreferences[Key]>
  }> | null
}

export type ChangePasswordPayload = {
  old_password: string
  password: string
  password_confirmation: string
}

export type SetupTwoFactorPayload = {
  two_factor_enabled: boolean
}

export const usersApi = {
  me(client: AxiosInstance, token?: string) {
    return apiRequest<AuthUserResponse>(client, {
      method: 'GET',
      url: '/users/me',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
  },

  checkUsername(client: AxiosInstance, username: string) {
    return apiRequest<CheckUsernameResponse>(client, {
      method: 'GET',
      url: '/users/check-username',
      params: { username },
    })
  },

  editProfile(client: AxiosInstance, payload: EditProfilePayload) {
    return apiRequest<AuthUserResponse>(client, {
      method: 'PATCH',
      url: '/users/edit-profile',
      data: payload,
    })
  },

  completeOnboarding(client: AxiosInstance) {
    return apiRequest<AuthUserResponse>(client, {
      method: 'PATCH',
      url: '/users/complete-onboarding',
    })
  },

  changePassword(client: AxiosInstance, payload: ChangePasswordPayload) {
    return apiRequest<AuthUserResponse>(client, {
      method: 'PATCH',
      url: '/users/change-password',
      data: payload,
    })
  },

  setupTwoFactor(client: AxiosInstance, payload: SetupTwoFactorPayload) {
    return apiRequest<OtpChallengeResponse | MessageResponse>(client, {
      method: 'PATCH',
      url: '/users/setup-two-factor',
      data: payload,
    })
  },

  confirmTwoFactor(client: AxiosInstance, payload: VerifyOtpPayload) {
    return apiRequest<AuthUserResponse>(client, {
      method: 'PATCH',
      url: '/users/confirm-two-factor',
      data: payload,
    })
  },

  deleteAccount(client: AxiosInstance) {
    return apiRequest<MessageResponse>(client, {
      method: 'DELETE',
      url: '/users/delete-account',
    })
  },
}

export type { AuthUser }
