import { useQuery } from "@tanstack/vue-query";
import { connectionsApi } from "~/utils/api/connections";
import { queryKeys } from "~/utils/api/query-keys";

export const useConnections = () => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: queryKeys.connections.list(),
    queryFn: () => connectionsApi.list(apiClient),
  });
};
