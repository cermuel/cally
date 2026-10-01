<script setup lang="ts">
import {
  CONNECTION_PROVIDERS,
  type ConnectionProvider,
} from "~/constants/connections";
import { getApiErrorMessage } from "~/utils/api/client";

const connectionsQuery = useConnections();
const googleOAuth = useGoogleOAuth();

const connectionFor = (provider: ConnectionProvider) =>
  connectionsQuery.data.value?.connection.find(
    (connection) =>
      connection.provider === provider.id &&
      (!provider.requiredScope ||
        connection.scopes?.includes(provider.requiredScope)),
  );

const connect = (provider: ConnectionProvider) => {
  if (provider.id === "google") {
    void googleOAuth.connectCalendar("/app/settings");
  }
};
</script>

<template>
  <section
    class="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card"
    aria-label="Available connections"
  >
    <div
      v-if="connectionsQuery.isPending.value"
      class="p-5 text-sm text-muted-foreground"
      role="status"
    >
      Loading connections…
    </div>

    <div
      v-else-if="connectionsQuery.isError.value"
      class="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <p class="text-sm text-destructive">
        {{
          getApiErrorMessage(
            connectionsQuery.error.value,
            "Could not load your connections.",
          )
        }}
      </p>
      <SharedButton
        type="button"
        size="sm"
        variant="outline"
        @click="connectionsQuery.refetch()"
      >
        Try again
      </SharedButton>
    </div>

    <template v-else>
      <UiSettingsConnection
        v-for="provider in CONNECTION_PROVIDERS"
        :key="provider.id"
        :provider="provider"
        :connection="connectionFor(provider)"
        :connecting="provider.id === 'google' && googleOAuth.pending.value"
        @connect="connect(provider)"
      />
    </template>
  </section>
</template>
