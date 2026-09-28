import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { linksApi } from '~/utils/api/links'
import { queryKeys } from '~/utils/api/query-keys'

export const LINKS_STALE_TIME = 30 * 60 * 1000

export function useLinks(options: { enabled?: MaybeRefOrGetter<boolean> } = {}) {
  const client = useApiClient()

  return useQuery({
    queryKey: queryKeys.links.list(),
    queryFn: () => linksApi.list(client),
    enabled: computed(() => options.enabled === undefined || toValue(options.enabled)),
    staleTime: LINKS_STALE_TIME,
  })
}
