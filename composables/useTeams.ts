import { useQuery } from "@tanstack/vue-query";
import type { MaybeRefOrGetter } from "vue";
import { queryKeys } from "~/utils/api/query-keys";
import { teamsApi } from "~/utils/api/teams";

export function useTeams(page: MaybeRefOrGetter<number> = 1) {
  const client = useApiClient();

  return useQuery({
    queryKey: computed(() => queryKeys.teams.list(toValue(page))),
    queryFn: () => teamsApi.list(client, toValue(page)),
  });
}

export function useTeam(teamId: MaybeRefOrGetter<number | null>) {
  const client = useApiClient();

  return useQuery({
    queryKey: computed(() =>
      queryKeys.teams.detail(toValue(teamId) ?? "none"),
    ),
    queryFn: () => teamsApi.get(client, toValue(teamId)!),
    enabled: computed(() => toValue(teamId) !== null),
  });
}
