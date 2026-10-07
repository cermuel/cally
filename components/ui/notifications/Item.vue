<script setup lang="ts">
import { CalendarAdd01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { Notification } from "~/utils/api/notifications";

const props = defineProps<{
  notification: Notification;
  busy?: boolean;
}>();

defineEmits<{
  open: [notification: Notification];
}>();

const createdLabel = computed(() => {
  const createdAt = new Date(props.notification.created_at);
  const elapsed = Date.now() - createdAt.getTime();
  const minutes = Math.floor(elapsed / 60_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year:
      createdAt.getFullYear() === new Date().getFullYear()
        ? undefined
        : "numeric",
  }).format(createdAt);
});
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center gap-3 bg-card px-4 py-3 text-start outline-none transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60"
    :disabled="busy"
    @click="$emit('open', notification)"
  >
    <span
      class="grid size-7 shrink-0 place-items-center rounded-full"
      :class="
        notification.read_at
          ? 'bg-muted text-muted-foreground'
          : 'bg-foreground text-background'
      "
    >
      <HugeiconsIcon
        :icon="CalendarAdd01Icon"
        :size="14"
        :stroke-width="1.5"
        aria-hidden="true"
      />
    </span>

    <span class="min-w-0 flex-1 space-y-1.5">
      <span class="flex items-center gap-2">
        <span
          class="truncate text-[13px] leading-4"
          :class="
            notification.read_at
              ? 'text-foreground'
              : 'font-medium text-foreground'
          "
        >
          {{ notification.title }}
        </span>
        <span
          v-if="!notification.read_at"
          class="size-1.5 shrink-0 rounded-full bg-primary"
          aria-label="Unread"
        />
      </span>
      <span
        v-if="notification.message"
        class="line-clamp-2 block text-xs leading-3 text-muted-foreground"
      >
        {{ notification.message }}
      </span>
    </span>

    <span class="shrink-0 text-xs tabular-nums text-muted-foreground/70">
      {{ createdLabel }}
    </span>
  </button>
</template>
