import type { AxiosInstance } from 'axios'
import { apiRequest } from './client'

export type AvailabilityDay =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'

export type AvailabilitySlot = {
  id: number
  user_id: number
  day: AvailabilityDay
  start_time: string | null
  end_time: string | null
  created_at: string
  updated_at: string
}

export type AvailabilityPayload = {
  day: AvailabilityDay
  start_time?: string | null
  end_time?: string | null
}

export type AvailabilityListResponse = {
  message: string
  availabilities: AvailabilitySlot[]
}

export type AvailabilityResponse = {
  message: string
  availability: AvailabilitySlot
}

export type AvailabilityDeleteResponse = {
  message: string
}

export const availabilityApi = {
  list(client: AxiosInstance) {
    return apiRequest<AvailabilityListResponse>(client, {
      method: 'GET',
      url: '/availability',
    })
  },

  create(client: AxiosInstance, payload: AvailabilityPayload) {
    return apiRequest<AvailabilityResponse>(client, {
      method: 'POST',
      url: '/availability',
      data: payload,
    })
  },

  update(client: AxiosInstance, id: number, payload: Partial<AvailabilityPayload>) {
    return apiRequest<AvailabilityResponse>(client, {
      method: 'PATCH',
      url: `/availability/${id}`,
      data: payload,
    })
  },

  remove(client: AxiosInstance, id: number) {
    return apiRequest<AvailabilityDeleteResponse>(client, {
      method: 'DELETE',
      url: `/availability/${id}`,
    })
  },
}
