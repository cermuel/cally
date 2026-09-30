import type { AxiosInstance } from 'axios'
import { apiRequest } from './client'
import type { BookingGuest, GuestAttendanceStatus } from './bookings'

export type CreateGuestPayload = {
  name?: string | null
  email: string
  attendance_status?: GuestAttendanceStatus
}

export type UpdateGuestPayload = {
  name?: string | null
  email?: string
  attendance_status?: GuestAttendanceStatus
}

export type GuestsResponse = {
  message: string
  guests: BookingGuest[]
}

export type GuestResponse = {
  message: string
  guests: BookingGuest
}

export const guestsApi = {
  list(client: AxiosInstance, bookingId: number) {
    return apiRequest<GuestsResponse>(client, {
      method: 'GET',
      url: '/guests',
      params: { booking_id: bookingId },
    })
  },

  byEmail(client: AxiosInstance, bookingId: number, email: string) {
    return apiRequest<GuestResponse>(client, {
      method: 'GET',
      url: `/guest/${encodeURIComponent(email)}`,
      params: { booking_id: bookingId },
    })
  },

  add(client: AxiosInstance, bookingId: number, guests: CreateGuestPayload[]) {
    return apiRequest<GuestsResponse>(client, {
      method: 'POST',
      url: '/guests',
      data: { booking_id: bookingId, guests },
    })
  },

  update(client: AxiosInstance, id: number, payload: UpdateGuestPayload) {
    return apiRequest<GuestResponse>(client, {
      method: 'PATCH',
      url: `/guests/${id}`,
      data: payload,
    })
  },

  remove(client: AxiosInstance, id: number) {
    return apiRequest<{ message: string }>(client, {
      method: 'DELETE',
      url: `/guests/${id}`,
    })
  },
}
