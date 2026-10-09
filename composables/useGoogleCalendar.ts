import { GOOGLE_CALENDAR_EVENTS_SCOPE } from "~/constants/connections";
import { useConnections } from "./useConnections";
import { useGoogleOAuth } from "./useGoogleOAuth";

export const useGoogleCalendar = () => {
  const route = useRoute();
  const connectionsQuery = useConnections();
  const googleOAuth = useGoogleOAuth();

  const connected = computed(
    () =>
      route.query.google === "connected" ||
      Boolean(
        connectionsQuery.data.value?.connection.some(
          (connection) =>
            connection.provider === "google" &&
            connection.scopes?.includes(GOOGLE_CALENDAR_EVENTS_SCOPE),
        ),
      ),
  );

  const calendar = reactive({
    checking: computed(() => connectionsQuery.isPending.value),
    connected,
    connecting: computed(() => googleOAuth.pending.value),
  });

  const connect = (returnPath: string) =>
    googleOAuth.connectCalendar(returnPath);

  return { calendar, connect };
};
