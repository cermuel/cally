import { keepPreviousData, useQuery } from "@tanstack/vue-query";
import type { MaybeRefOrGetter } from "vue";
import { queryKeys } from "~/utils/api/query-keys";
import {
  teamBookingsApi,
  type TeamBookingListParams,
} from "~/utils/api/team-bookings";

export function useTeamBookings(
  teamId: MaybeRefOrGetter<number>,
  params: MaybeRefOrGetter<TeamBookingListParams>,
) {
  const client = useApiClient();
  const activeTeamId = computed(() => toValue(teamId));
  const activeParams = computed(() => toValue(params));

  return useQuery({
    queryKey: computed(() =>
      queryKeys.teams.bookingList(activeTeamId.value, activeParams.value),
    ),
    queryFn: () =>
      teamBookingsApi.list(client, activeTeamId.value, activeParams.value),
    placeholderData: keepPreviousData,
    refetchInterval: (query) => {
      const bookings = query.state.data?.bookings ?? [];
      return bookings.some(
        (booking) =>
          !booking.meeting_url &&
          booking.status !== "cancelled" &&
          booking.status !== "completed",
      )
        ? 10_000
        : false;
    },
  });
}
