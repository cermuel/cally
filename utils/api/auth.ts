import type { AxiosInstance } from 'axios'
import { apiRequest } from './client'

export type AuthUser = {
  name: string | null
  username: string | null
  email: string
  avatar: string | null
  email_verified_at: string | null
  onboarding_completed_at: string | null
  timezone: string
}

export type RegisterPayload = {
  email: string
  password: string
  password_confirmation: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type ForgotPasswordPayload = {
  email: string
}

export type ResetPasswordPayload = {
  email: string
  token: string
  password: string
  password_confirmation: string
}

export type MessageResponse = {
  message: string
}

export type AuthUserResponse = MessageResponse & {
  user: AuthUser
}

export type TokenAuthResponse = AuthUserResponse & {
  token: string
}

export type LoginResponse = AuthUserResponse & {
  token?: string
}

export const authApi = {
  register(client: AxiosInstance, payload: RegisterPayload) {
    return apiRequest<AuthUserResponse>(client, {
      method: 'POST',
      url: '/register',
      data: payload,
    })
  },

  login(client: AxiosInstance, payload: LoginPayload) {
    return apiRequest<LoginResponse>(client, {
      method: 'POST',
      url: '/login',
      data: payload,
    })
  },

  verifyEmail(client: AxiosInstance, params: { email: string, token: string }) {
    return apiRequest<TokenAuthResponse>(client, {
      method: 'GET',
      url: '/verify-email',
      params,
    })
  },

  resendEmail(client: AxiosInstance, email: string) {
    return apiRequest<AuthUserResponse>(client, {
      method: 'GET',
      url: '/resend-email',
      params: { email },
    })
  },

  forgotPassword(client: AxiosInstance, payload: ForgotPasswordPayload) {
    return apiRequest<MessageResponse>(client, {
      method: 'POST',
      url: '/forgot-password',
      data: payload,
    })
  },

  resetPassword(client: AxiosInstance, payload: ResetPasswordPayload) {
    return apiRequest<MessageResponse>(client, {
      method: 'POST',
      url: '/reset-password',
      data: payload,
    })
  },

  logout(client: AxiosInstance) {
    return apiRequest<MessageResponse>(client, {
      method: 'POST',
      url: '/logout',
    })
  },
}
