import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { publicApi } from '~/utils/api/public'
import { queryKeys } from '~/utils/api/query-keys'

export const PUBLIC_PROFILE_STALE_TIME = 15 * 60 * 1000
export const PUBLIC_EVENTS_STALE_TIME = 10 * 60 * 1000
export const PUBLIC_SCHEDULE_STALE_TIME = 5 * 60 * 1000

export function usePublicProfile(username: MaybeRefOrGetter<string>) {
  const client = useApiClient()

  return useQuery({
    queryKey: computed(() => queryKeys.public.profile(toValue(username))),
    queryFn: () => publicApi.profile(client, toValue(username)),
    enabled: import.meta.client,
    staleTime: PUBLIC_PROFILE_STALE_TIME,
    gcTime: PUBLIC_PROFILE_STALE_TIME,
  })
}

export function usePublicEvents(username: MaybeRefOrGetter<string>) {
  const client = useApiClient()

  return useQuery({
    queryKey: computed(() => queryKeys.public.events(toValue(username))),
    queryFn: () => publicApi.events(client, toValue(username)),
    enabled: import.meta.client,
    staleTime: PUBLIC_EVENTS_STALE_TIME,
    gcTime: PUBLIC_EVENTS_STALE_TIME,
  })
}

export function usePublicSchedule(
  eventId: MaybeRefOrGetter<number | null>,
  month: MaybeRefOrGetter<string>,
) {
  const client = useApiClient()

  return useQuery({
    queryKey: computed(() =>
      queryKeys.public.schedule(toValue(eventId) ?? 'pending', toValue(month)),
    ),
    queryFn: () => publicApi.schedule(client, toValue(eventId)!, toValue(month)),
    enabled: computed(() => import.meta.client && toValue(eventId) !== null),
    staleTime: PUBLIC_SCHEDULE_STALE_TIME,
    gcTime: PUBLIC_SCHEDULE_STALE_TIME,
  })
}
