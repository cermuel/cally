<script setup lang="ts">
import { TickDouble02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { getApiErrorMessage } from "~/utils/api/client";
import { notificationsApi } from "~/utils/api/notifications";
import { queryKeys } from "~/utils/api/query-keys";

const client = useApiClient();
const queryClient = useQueryClient();
const unreadNotifications = useUnreadNotifications();

const markAllMutation = useMutation({
  mutationFn: () => notificationsApi.markAllRead(client),
  onSuccess: () => {
    toast.success("All notifications marked as read");
    void queryClient.invalidateQueries({
      queryKey: queryKeys.notifications.all(),
    });
  },
  onError: (error) =>
    toast.error(
      getApiErrorMessage(error, "Could not mark notifications as read."),
    ),
});
</script>

<template>
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
</template>
