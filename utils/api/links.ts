import type { AxiosInstance } from 'axios'
import { apiRequest } from './client'

export type LinkVisibility = 'public' | 'private'
export type LinkStatus = 'published' | 'draft'

export type Link = {
  id: number
  user_id: number
  name: string
  slug: string
  color: string | null
  description: string | null
  is_active: boolean
  visibility: LinkVisibility
  status: LinkStatus
  is_profile: true
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

export type CreateLinkPayload = {
  name: string
  slug: string
  duration_minutes: number
  description?: string | null
  color?: string | null
  status?: LinkStatus
  visibility?: LinkVisibility
}

export type UpdateLinkPayload = {
  name?: string
  duration_minutes?: number
  slug?: string
  description?: string | null
  color?: string | null
  status?: LinkStatus
  is_active?: boolean
  visibility?: LinkVisibility
  pre_meeting_minutes?: number | null
  post_meeting_minutes?: number | null
}

export type LinksListResponse = {
  links: Link[]
  message: string
}

export type LinkResponse = {
  link: Link
  message: string
}

export type DeleteLinkResponse = {
  message: string
}

export const linksApi = {
  list(client: AxiosInstance, search?: string) {
    return apiRequest<LinksListResponse>(client, {
      method: 'GET',
      url: '/links',
      params: search ? { search } : undefined,
    })
  },

  create(client: AxiosInstance, payload: CreateLinkPayload) {
    return apiRequest<LinkResponse>(client, {
      method: 'POST',
      url: '/links',
      data: payload,
    })
  },

  get(client: AxiosInstance, id: number) {
    return apiRequest<LinkResponse>(client, {
      method: 'GET',
      url: `/links/${id}`,
    })
  },

  update(client: AxiosInstance, id: number, payload: UpdateLinkPayload) {
    return apiRequest<LinkResponse>(client, {
      method: 'PATCH',
      url: `/links/${id}`,
      data: payload,
    })
  },

  remove(client: AxiosInstance, id: number) {
    return apiRequest<DeleteLinkResponse>(client, {
      method: 'DELETE',
      url: `/links/${id}`,
    })
  },
}
