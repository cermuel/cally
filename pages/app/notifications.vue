<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { TickDouble02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { toast } from "vue-sonner";
import { getApiErrorMessage } from "~/utils/api/client";
import {
  notificationsApi,
  type Notification,
  type NotificationListParams,
  type NotificationListResponse,
} from "~/utils/api/notifications";
import { queryKeys } from "~/utils/api/query-keys";

definePageMeta({ layout: false });
useHead({ title: "Notifications | Cally" });

type NotificationFilter = "all" | "unread" | "read";

const client = useApiClient();
const queryClient = useQueryClient();
const filter = ref<NotificationFilter>("all");
const page = ref(1);
const busyId = ref<number | null>(null);

const params = computed<NotificationListParams>(() => ({
  page: page.value,
  ...(filter.value === "unread" ? { is_read: 0 as const } : {}),
  ...(filter.value === "read" ? { is_read: 1 as const } : {}),
}));

const notificationsQuery = useNotificationList(params);
const unreadNotifications = useUnreadNotifications();

watch(filter, () => {
  page.value = 1;
});

const markReadMutation = useMutation({
  mutationFn: (notification: Notification) => {
    busyId.value = notification.id;
    return notificationsApi.markRead(client, notification.id);
  },
  onMutate: async (notification) => {
    const queryKey = queryKeys.notifications.list(params.value);
    await queryClient.cancelQueries({ queryKey });
    const previous =
      queryClient.getQueryData<NotificationListResponse>(queryKey);

    queryClient.setQueryData<NotificationListResponse>(queryKey, (current) => {
      if (!current) return current;

      return {
        ...current,
        notifications: {
          ...current.notifications,
          data: current.notifications.data.map((item) =>
            item.id === notification.id
              ? { ...item, read_at: new Date().toISOString() }
              : item,
          ),
        },
      };
    });

    return { previous, queryKey };
  },
  onError: (error, _notification, context) => {
    if (context?.previous) {
      queryClient.setQueryData(context.queryKey, context.previous);
    }
    toast.error(
      getApiErrorMessage(error, "Could not mark the notification as read."),
    );
  },
  onSettled: () => {
    busyId.value = null;
    void queryClient.invalidateQueries({
      queryKey: queryKeys.notifications.all(),
    });
  },
});

const markAllMutation = useMutation({
  mutationFn: () => notificationsApi.markAllRead(client),
  onSuccess: () => {
    toast.success("All notifications marked as read");
    void queryClient.invalidateQueries({
      queryKey: queryKeys.notifications.all(),
    });
  },
  onError: (error) => {
    toast.error(
      getApiErrorMessage(error, "Could not mark notifications as read."),
    );
  },
});

const openNotification = (notification: Notification) => {
  if (!notification.read_at) {
    markReadMutation.mutate(notification);
  }

  if (notification.action_url) {
    void navigateTo(notification.action_url, { external: true });
  }
};
</script>

<template>
  <UiAppShell>
    <div class="mx-auto w-full max-w-3xl">
      <div class="mb-6 flex items-center justify-between gap-4">
        <h1 class="text-2xl font-semibold tracking-tight">Notifications</h1>

        <SharedButton
          type="button"
          variant="outline"
          size="sm"
          :loading="markAllMutation.isPending.value"
          :disabled="unreadNotifications.unreadCount.value === 0"
          @click="markAllMutation.mutate()"
        >
          <HugeiconsIcon
            :icon="TickDouble02Icon"
            :size="16"
            :stroke-width="1.75"
            aria-hidden="true"
          />
          Read all
        </SharedButton>
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
          :busy-id="busyId"
          :filter="filter"
          @open="openNotification"
          @page="page = $event"
        />
      </SharedTabs>
    </div>
  </UiAppShell>
</template>
