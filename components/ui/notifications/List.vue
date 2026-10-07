<script setup lang="ts">
import { Notification01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type {
  Notification,
  NotificationPagination,
} from "~/utils/api/notifications";

defineProps<{
  notifications?: Notification[];
  pagination?: NotificationPagination;
  loading: boolean;
  busyId?: number | null;
  filter: "all" | "unread" | "read";
}>();

defineEmits<{
  open: [notification: Notification];
  page: [page: number];
}>();
</script>

<template>
  <div
    v-if="loading"
    class="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card"
    aria-label="Loading notifications"
    aria-busy="true"
  >
    <div
      v-for="index in 4"
      :key="index"
      class="flex animate-pulse items-center gap-3 px-4 py-3"
    >
      <div class="size-7 shrink-0 rounded-full bg-muted" />
      <div class="flex-1 space-y-1.5">
        <div class="h-3 w-3/5 rounded bg-muted" />
        <div class="h-2.5 w-16 rounded bg-muted/60" />
      </div>
    </div>
  </div>

  <section
    v-else-if="!notifications?.length"
    class="flex flex-col items-center rounded-lg border border-border bg-card px-6 py-16 text-center"
  >
    <div
      class="grid size-9 place-items-center rounded-lg border border-border bg-muted/50 text-muted-foreground"
    >
      <HugeiconsIcon
        :icon="Notification01Icon"
        :size="18"
        :stroke-width="1.5"
        aria-hidden="true"
      />
    </div>
    <h2 class="mt-3 text-sm font-medium text-foreground">
      {{
        filter === "all" ? "No notifications yet" : `No ${filter} notifications`
      }}
    </h2>
    <p class="mt-1 max-w-xs text-[13px] leading-5 text-muted-foreground">
      Updates about bookings and guests will appear here.
    </p>
  </section>

  <template v-else>
    <div
      class="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card"
    >
      <UiNotificationsItem
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
        :busy="busyId === notification.id"
        @open="$emit('open', $event)"
      />
    </div>

    <nav
      v-if="pagination && pagination.last_page > 1"
      class="mt-4 flex items-center justify-between"
      aria-label="Notification pages"
    >
      <SharedButton
        type="button"
        variant="outline"
        size="sm"
        class="h-8 px-3 text-xs"
        :disabled="pagination.current_page === 1"
        @click="$emit('page', pagination.current_page - 1)"
      >
        Previous
      </SharedButton>
      <p class="text-xs tabular-nums text-muted-foreground">
        {{ pagination.current_page }} / {{ pagination.last_page }}
      </p>
      <SharedButton
        type="button"
        variant="outline"
        size="sm"
        class="h-8 px-3 text-xs"
        :disabled="pagination.current_page === pagination.last_page"
        @click="$emit('page', pagination.current_page + 1)"
      >
        Next
      </SharedButton>
    </nav>
  </template>
</template>
