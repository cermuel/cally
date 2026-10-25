<script setup lang="ts">
import { Clock01Icon, Video01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { Booking } from "~/utils/api/bookings";

const props = defineProps<{ booking: Booking; timezone: string }>();

const dateLabel = computed(() =>
  props.booking.starts_at
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: props.timezone,
      }).format(new Date(props.booking.starts_at))
    : "Date pending",
);
const timeLabel = computed(() =>
  props.booking.starts_at
    ? new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: props.timezone,
      })
        .format(new Date(props.booking.starts_at))
        .toLowerCase()
    : "Time pending",
);
</script>

<template>
  <li class="flex items-center gap-3 px-3 py-3">
    <span class="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
      <HugeiconsIcon :icon="Clock01Icon" :size="15" :stroke-width="1.75" aria-hidden="true" />
    </span>
    <div class="min-w-0 flex-1">
      <p class="truncate text-[13px] font-medium">{{ dateLabel }}</p>
      <p class="mt-0.5 text-xs text-muted-foreground">{{ timeLabel }} · <span class="capitalize">{{ booking.status }}</span></p>
    </div>
    <SharedButton v-if="booking.meeting_url" as-child variant="ghost" size="icon-sm">
      <a :href="booking.meeting_url" target="_blank" rel="noopener noreferrer" :aria-label="`Join occurrence on ${dateLabel}`">
        <HugeiconsIcon :icon="Video01Icon" :size="16" :stroke-width="1.75" aria-hidden="true" />
      </a>
    </SharedButton>
  </li>
</template>
