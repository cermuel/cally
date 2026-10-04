import type { AxiosInstance } from 'axios'
import { apiRequest } from './client'

export type PublicApiUser = {
  name: string
  username: string
  description: string | null
  email: string
  avatar: string | null
  email_verified_at: string | null
  onboarding_completed_at: string | null
  timezone: string
}

export type PublicApiEvent = {
  id: number
  user_id: number
  name: string
  slug: string
  color: string | null
  description: string | null
  is_active: boolean
  visibility: string
  status: string
  is_profile: boolean
  first_reminder: number | null
  second_reminder: number | null
  duration_minutes: number
  pre_meeting_minutes: number | null
  post_meeting_minutes: number | null
  max_meetings_daily: number | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type PublicScheduleSlot = {
  time: string
  starts_at: string
  ends_at: string
}

export type PublicSchedulePagination = {
  month: string
  previous_month: string
  next_month: string
}

export type PublicProfileResponse = {
  message: string
  user: PublicApiUser
}

export type PublicEventsResponse = {
  message: string
  events: PublicApiEvent[]
}

export type PublicScheduleResponse = {
  message: string
  schedules: Record<string, PublicScheduleSlot[]>
  timezone: string
  host_timezone: string
  pagination: PublicSchedulePagination
}

export const publicApi = {
  profile(client: AxiosInstance, username: string) {
    return apiRequest<PublicProfileResponse>(client, {
      method: 'GET',
      url: '/public/profile',
      params: { username },
    })
  },

  events(client: AxiosInstance, username: string) {
    return apiRequest<PublicEventsResponse>(client, {
      method: 'GET',
      url: `/public/${username}/events`,
    })
  },

  schedule(client: AxiosInstance, eventId: number, month: string, timezone: string) {
    return apiRequest<PublicScheduleResponse>(client, {
      method: 'GET',
      url: `/public/events/${eventId}/schedule`,
      params: { month, timezone },
    })
  },
}
