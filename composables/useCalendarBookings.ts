import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import {
  bookingsApi,
  type Booking,
  type BookingListParams,
  type BookingScope,
} from '~/utils/api/bookings'
import { queryKeys } from '~/utils/api/query-keys'
import { filterBookingsForScope } from './useBookings'

const CALENDAR_PAGE_SIZE = 100

export function useCalendarBookings(
  scope: MaybeRefOrGetter<BookingScope>,
  enabled: MaybeRefOrGetter<boolean>,
) {
  const client = useApiClient()
  const activeScope = computed(() => toValue(scope))

  return useQuery({
    queryKey: computed(() => queryKeys.bookings.list({
      tab: activeScope.value,
      view: 'calendar',
    })),
    enabled: computed(() => toValue(enabled)),
    queryFn: async () => {
      const status: BookingListParams['status'] = activeScope.value === 'pending'
        ? 'pending'
        : activeScope.value === 'cancelled'
          ? 'cancelled'
          : undefined
      const params = {
        per_page: CALENDAR_PAGE_SIZE,
        ...(status ? { status } : {}),
      }
      const first = await bookingsApi.list(client, { ...params, page: 1 })
      const bookings: Booking[] = [...first.bookings]

      const remainingPages = await Promise.all(
        Array.from(
          { length: Math.max(0, first.pagination.last_page - 1) },
          (_, index) => bookingsApi.list(client, { ...params, page: index + 2 }),
        ),
      )
      for (const response of remainingPages) {
        bookings.push(...response.bookings)
      }

      return filterBookingsForScope(bookings, activeScope.value)
    },
  })
}
