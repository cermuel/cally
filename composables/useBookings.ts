import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import {
  bookingsApi,
  type Booking,
  type BookingListParams,
  type BookingScope,
} from '~/utils/api/bookings'
import { queryKeys } from '~/utils/api/query-keys'

export const filterBookingsForScope = (
  bookings: Booking[],
  scope: BookingScope,
) => {
  const now = Date.now()

  if (scope === 'upcoming') {
    return bookings.filter((booking) =>
      booking.status !== 'cancelled'
      && booking.status !== 'completed'
      && !!booking.starts_at
      && new Date(booking.starts_at).getTime() >= now,
    )
  }

  if (scope === 'past') {
    return bookings.filter((booking) =>
      booking.status === 'completed'
      || (!!booking.starts_at && new Date(booking.starts_at).getTime() < now),
    )
  }

  return bookings
}

export function useBookings(
  scope: MaybeRefOrGetter<BookingScope>,
  page: MaybeRefOrGetter<number>,
  perPage: MaybeRefOrGetter<number> = 10,
) {
  const client = useApiClient()
  const activeScope = computed(() => toValue(scope))
  const params = computed<BookingListParams>(() => {
    const status = activeScope.value === 'pending'
      ? 'pending'
      : activeScope.value === 'cancelled'
        ? 'cancelled'
        : undefined

    return {
      page: toValue(page),
      per_page: toValue(perPage),
      ...(status ? { status } : {}),
    }
  })

  return useQuery({
    queryKey: computed(() => queryKeys.bookings.list({
      tab: activeScope.value,
      ...params.value,
    })),
    queryFn: () => bookingsApi.list(client, params.value),
    select: (response) => ({
      ...response,
      bookings: filterBookingsForScope(response.bookings, activeScope.value),
    }),
    placeholderData: keepPreviousData,
  })
}
