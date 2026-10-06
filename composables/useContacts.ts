import { keepPreviousData, useQuery } from "@tanstack/vue-query";
import type { MaybeRefOrGetter } from "vue";
import {
  contactsApi,
  type ContactBookingsParams,
  type ContactListParams,
} from "~/utils/api/contacts";
import { queryKeys } from "~/utils/api/query-keys";

export function useContacts(params: MaybeRefOrGetter<ContactListParams>) {
  const client = useApiClient();
  const requestParams = computed(() => toValue(params));

  return useQuery({
    queryKey: computed(() => queryKeys.contacts.list(requestParams.value)),
    queryFn: () => contactsApi.list(client, requestParams.value),
    placeholderData: keepPreviousData,
  });
}

export function useContactBookings(
  contactId: MaybeRefOrGetter<number | null>,
  params: MaybeRefOrGetter<ContactBookingsParams>,
) {
  const client = useApiClient();
  const id = computed(() => toValue(contactId));
  const requestParams = computed(() => toValue(params));

  return useQuery({
    queryKey: computed(() =>
      queryKeys.contacts.bookings(id.value ?? "none", requestParams.value),
    ),
    queryFn: () => contactsApi.bookings(client, id.value!, requestParams.value),
    enabled: computed(() => id.value !== null),
  });
}
