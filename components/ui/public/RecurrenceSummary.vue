<script setup lang="ts">
import {
  Calendar03Icon,
  Clock01Icon,
  RefreshCcwIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { Recurrence } from "~/utils/api/recurrences";

const props = defineProps<{ recurrence: Recurrence }>();

const dateRange = computed(() => {
  const format = (value: string) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
  return `${format(props.recurrence.starts_on)} – ${format(props.recurrence.ends_on)}`;
});

const timeLabel = computed(() => {
  const [hour = 0, minute = 0] = props.recurrence.start_time
    .split(":")
    .map(Number);
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, hour, minute));
});
</script>

<template>
  <section
    class="border-t bg-muted/30 p-5 py-4 text-left"
    aria-label="Recurring schedule"
  >
    <p class="text-sm font-medium leading-5">
      {{
        recurrence.schedule_description ??
        `Every ${recurrence.interval} ${recurrence.frequency}`
      }}
    </p>
    <div class="mt-3 space-y-2 text-xs text-muted-foreground">
      <p class="flex items-center gap-2">
        <HugeiconsIcon
          :icon="Calendar03Icon"
          :size="14"
          :stroke-width="1.75"
          aria-hidden="true"
        />
        {{ dateRange }}
      </p>
      <p class="flex items-center gap-2">
        <HugeiconsIcon
          :icon="Clock01Icon"
          :size="14"
          :stroke-width="1.75"
          aria-hidden="true"
        />
        {{ timeLabel }} · {{ recurrence.timezone }}
      </p>
    </div>
  </section>
</template>
