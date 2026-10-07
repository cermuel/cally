import type { NotificationPreferences } from '~/utils/api/auth'

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  booking_created: { in_app: true, email: true },
  booking_cancelled: { in_app: true, email: true },
  booking_rescheduled: { in_app: true, email: true },
  guest_added: { in_app: true, email: false },
}

export const NOTIFICATION_PREFERENCE_ITEMS = [
  {
    key: 'booking_created',
    label: 'New bookings',
    description: 'When someone books time with you.',
  },
  {
    key: 'booking_cancelled',
    label: 'Cancelled bookings',
    description: 'When a guest cancels a booking.',
  },
  {
    key: 'booking_rescheduled',
    label: 'Rescheduled bookings',
    description: 'When a booking moves to a new time.',
  },
  {
    key: 'guest_added',
    label: 'Guests added',
    description: 'When another guest is added to a booking.',
  },
] as const
