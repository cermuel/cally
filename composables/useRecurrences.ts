import { keepPreviousData, useQuery } from "@tanstack/vue-query";
import type { MaybeRefOrGetter } from "vue";
import {
  recurrencesApi,
  type RecurrenceListParams,
} from "~/utils/api/recurrences";
import { queryKeys } from "~/utils/api/query-keys";

export function useRecurrences(
  params: MaybeRefOrGetter<RecurrenceListParams>,
) {
  const client = useApiClient();
  const requestParams = computed(() => toValue(params));

  return useQuery({
    queryKey: computed(() => queryKeys.recurrences.list(requestParams.value)),
    queryFn: () => recurrencesApi.list(client, requestParams.value),
    placeholderData: keepPreviousData,
  });
}
