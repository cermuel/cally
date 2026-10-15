<script setup lang="ts">
import { getApiErrorMessage } from "~/utils/api/client";
import {
  type NotificationListParams,
} from "~/utils/api/notifications";

definePageMeta({ layout: false });
useHead({ title: "Notifications" });

type NotificationFilter = "all" | "unread" | "read";

const filter = ref<NotificationFilter>("all");
const page = ref(1);

const params = computed<NotificationListParams>(() => ({
  page: page.value,
  ...(filter.value === "unread" ? { is_read: 0 as const } : {}),
  ...(filter.value === "read" ? { is_read: 1 as const } : {}),
}));

const notificationsQuery = useNotificationList(params);

watch(filter, () => {
  page.value = 1;
});

</script>

<template>
  <UiAppShell>
    <div class="mx-auto w-full max-w-3xl">
      <div class="mb-6 flex items-center justify-between gap-4">
        <h1 class="text-2xl font-semibold tracking-tight">Notifications</h1>

        <UiNotificationsMarkAllButton />
      </div>

      <SharedTabs v-model="filter" class="gap-5">
        <SharedTabsList aria-label="Filter notifications">
          <SharedTabsTrigger value="all">All</SharedTabsTrigger>
          <SharedTabsTrigger value="unread">Unread</SharedTabsTrigger>
          <SharedTabsTrigger value="read">Read</SharedTabsTrigger>
        </SharedTabsList>

        <div
          v-if="notificationsQuery.isError.value"
          class="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="text-sm text-destructive">
            {{
              getApiErrorMessage(
                notificationsQuery.error.value,
                "Could not load notifications.",
              )
            }}
          </p>
          <SharedButton
            type="button"
            size="sm"
            variant="outline"
            @click="notificationsQuery.refetch()"
          >
            Try again
          </SharedButton>
        </div>

        <UiNotificationsList
          v-else
          :notifications="notificationsQuery.data.value?.notifications.data"
          :pagination="notificationsQuery.data.value?.notifications"
          :loading="notificationsQuery.isPending.value"
          :filter="filter"
          @page="page = $event"
        />
      </SharedTabs>
    </div>
  </UiAppShell>
</template>
