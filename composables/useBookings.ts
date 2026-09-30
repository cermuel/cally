import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import {
  bookingsApi,
  type Booking,
  type BookingListParams,
  type BookingScope,
} from '~/utils/api/bookings'
import { queryKeys } from '~/utils/api/query-keys'

const filterBookings = (bookings: Booking[], scope: BookingScope) => {
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
      bookings: {
        ...response.bookings,
        data: filterBookings(response.bookings.data, activeScope.value),
      },
    }),
    placeholderData: keepPreviousData,
  })
}
