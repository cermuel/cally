import { useQuery } from "@tanstack/vue-query";
import { automationsApi } from "~/utils/api/automations";
import { queryKeys } from "~/utils/api/query-keys";

export const AUTOMATIONS_STALE_TIME = 10 * 60 * 1000;

export function useAutomations() {
  const client = useApiClient();

  return useQuery({
    queryKey: queryKeys.automations.list(),
    queryFn: () => automationsApi.list(client),
    staleTime: AUTOMATIONS_STALE_TIME,
  });
}

export function useAutomationTemplates() {
  const client = useApiClient();

  return useQuery({
    queryKey: queryKeys.automations.templates(),
    queryFn: () => automationsApi.templates(client),
    staleTime: 1000 * 60 * 60 * 6,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export function useAutomationVariables() {
  const client = useApiClient();

  return useQuery({
    queryKey: queryKeys.automations.variables(),
    queryFn: () => automationsApi.variables(client),
    staleTime: 1000 * 60 * 60 * 6,
    gcTime: 1000 * 60 * 60 * 24,
  });
}
