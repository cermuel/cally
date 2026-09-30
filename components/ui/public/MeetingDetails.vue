<script setup lang="ts">
import {
  Calendar03Icon,
  Clock01Icon,
  Location05Icon,
  Time02Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { Booking } from "~/utils/api/bookings";

const props = defineProps<{
  booking: Booking;
}>();

const timezone = computed(() => props.booking.host?.timezone ?? "UTC");
const dateLabel = computed(() =>
  props.booking.starts_at
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: timezone.value,
      }).format(new Date(props.booking.starts_at))
    : "Date to be confirmed",
);
const timeLabel = computed(() => {
  if (!props.booking.starts_at) return "Time to be confirmed";
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone.value,
  });
  const start = formatter
    .format(new Date(props.booking.starts_at))
    .toLowerCase();
  const end = props.booking.ends_at
    ? formatter.format(new Date(props.booking.ends_at)).toLowerCase()
    : "";
  return end ? `${start}–${end}` : start;
});
const durationLabel = computed(() => {
  if (props.booking.starts_at && props.booking.ends_at) {
    const minutes = Math.max(
      0,
      Math.round(
        (new Date(props.booking.ends_at).getTime() -
          new Date(props.booking.starts_at).getTime()) /
          60_000,
      ),
    );
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  }
  const minutes = props.booking.event?.duration_minutes;
  return minutes
    ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}`
    : "Duration to be confirmed";
});
</script>

<template>
  <dl class="grid gap-3 border-t p-5 text-sm">
    <div class="flex items-start gap-3">
      <HugeiconsIcon
        :icon="Calendar03Icon"
        :size="16"
        :stroke-width="1.75"
        class="mt-0.5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <dd>{{ dateLabel }}</dd>
    </div>

    <div class="flex items-start gap-3">
      <HugeiconsIcon
        :icon="Clock01Icon"
        :size="16"
        :stroke-width="1.75"
        class="mt-0.5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <dd class="text-muted-foreground">{{ timeLabel }}</dd>
    </div>

    <div class="flex items-start gap-3">
      <HugeiconsIcon
        :icon="Time02Icon"
        :size="16"
        :stroke-width="1.75"
        class="mt-0.5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <dd>
        {{ durationLabel }}
        <span class="text-muted-foreground">· {{ timezone }}</span>
      </dd>
    </div>

    <div class="flex items-start gap-3">
      <HugeiconsIcon
        :icon="Location05Icon"
        :size="16"
        :stroke-width="1.75"
        class="mt-0.5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <dd class="min-w-0 wrap-break-word">
        {{ booking.meeting_url ? "Google Meet" : "Meeting link to follow" }}
      </dd>
    </div>

    <div class="flex items-center gap-3">
      <HugeiconsIcon
        :icon="UserMultipleIcon"
        :size="16"
        :stroke-width="1.75"
        class="shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <dd class="flex items-center gap-2">
        <UiPublicGuestStack :booking="booking" />
        <span class="text-muted-foreground"
          >{{
            (booking.guests?.length ?? 0) + (booking.host ? 1 : 0)
          }}
          attending</span
        >
      </dd>
    </div>
  </dl>
</template>
