<script setup lang="ts">
import {
  Calendar03Icon,
  Clock01Icon,
  RefreshCcwIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { Recurrence } from "~/utils/api/recurrences";

const props = defineProps<{ recurrence: Recurrence }>();
const emit = defineEmits<{ open: [recurrence: Recurrence] }>();

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

const time = computed(() => {
  const [hour = 0, minute = 0] = props.recurrence.start_time.split(":").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, hour, minute));
});
</script>

<template>
  <article class="relative overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-sm">
    <button
      type="button"
      class="absolute inset-0 rounded-xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      :aria-label="`View recurring series ${recurrence.event?.name ?? recurrence.id}`"
      @click="emit('open', recurrence)"
    />
    <div class="pointer-events-none relative flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
      <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <HugeiconsIcon :icon="RefreshCcwIcon" :size="18" :stroke-width="1.75" aria-hidden="true" />
      </span>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h2 class="truncate text-[15px] font-medium">
            {{ recurrence.event?.name ?? `Event #${recurrence.event_id}` }}
          </h2>
          <span class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium capitalize text-emerald-700 ring-1 ring-emerald-500/20 ring-inset dark:text-emerald-300">
            {{ recurrence.status }}
          </span>
        </div>
        <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:gap-x-4">
          <span class="font-medium text-foreground/80">
            {{ recurrence.schedule_description ?? `Every ${recurrence.interval} ${recurrence.frequency}` }}
          </span>
          <span class="flex items-center gap-1.5">
            <HugeiconsIcon :icon="Calendar03Icon" :size="14" :stroke-width="1.75" aria-hidden="true" />
            {{ dateRange }}
          </span>
          <span class="flex items-center gap-1.5">
            <HugeiconsIcon :icon="Clock01Icon" :size="14" :stroke-width="1.75" aria-hidden="true" />
            {{ time }}<span class="hidden sm:inline"> · {{ recurrence.timezone }}</span>
          </span>
        </div>
      </div>
    </div>
  </article>
</template>
