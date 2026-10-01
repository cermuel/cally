<script setup lang="ts">
import type { ConnectionProvider } from "~/constants/connections";
import type { Connection } from "~/utils/api/connections";

defineProps<{
  provider: ConnectionProvider;
  connection?: Connection;
  connecting?: boolean;
}>();

const emit = defineEmits<{
  connect: [];
}>();
</script>

<template>
  <article
    class="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex items-center gap-4">
      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-transparent"
      >
        <img v-if="provider.icon" :src="provider.icon" alt="" class="size-6" />
        <span v-else class="text-sm font-semibold text-muted-foreground">
          {{ provider.initials }}
        </span>
      </div>

      <div class="space-y-1">
        <h2 class="text-sm leading-none font-semibold">
          {{ provider.name }}
        </h2>
        <p class="max-w-md text-sm text-muted-foreground">
          {{ provider.description }}
        </p>
        <p v-if="connection?.email" class="text-xs text-muted-foreground">
          {{ connection.email }}
        </p>
      </div>
    </div>

    <span
      v-if="connection"
      class="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-green-600/20 bg-green-600/10 px-3 py-1.5 text-xs font-medium text-green-700 sm:self-auto dark:text-green-400"
    >
      <span class="size-2 rounded-full bg-green-500" />
      Connected
    </span>

    <SharedButton
      v-else-if="provider.canConnect"
      type="button"
      variant="outline"
      class="shrink-0 self-start sm:self-auto"
      :loading="connecting"
      @click="emit('connect')"
    >
      Connect
    </SharedButton>

    <span
      v-else
      class="shrink-0 self-start rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground sm:self-auto"
    >
      Coming soon
    </span>
  </article>
</template>
