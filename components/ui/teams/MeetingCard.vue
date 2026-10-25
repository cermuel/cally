<script setup lang="ts">
import {
  Delete02Icon,
  Edit02Icon,
  MoreHorizontalIcon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { TeamBooking } from "~/utils/api/team-bookings";

const props = defineProps<{
  booking: TeamBooking;
  canManage: boolean;
}>();

const emit = defineEmits<{
  open: [booking: TeamBooking];
  edit: [booking: TeamBooking];
  cancel: [booking: TeamBooking];
  delete: [booking: TeamBooking];
}>();

const actionsOpen = ref(false);
const timezone = computed(() => props.booking.booking_timezone || "UTC");
const eventName = computed(
  () => props.booking.event?.name ?? `Meeting #${props.booking.id}`,
);
const canChange = computed(
  () =>
    props.canManage &&
    props.booking.status !== "cancelled" &&
    props.booking.status !== "completed",
);
const dateLabel = computed(() =>
  props.booking.starts_at
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeZone: timezone.value,
      }).format(new Date(props.booking.starts_at))
    : "Time to be confirmed",
);
const timeLabel = computed(() => {
  if (!props.booking.starts_at) return "";
  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone.value,
  });
  const start = formatter.format(new Date(props.booking.starts_at));
  const end = props.booking.ends_at
    ? formatter.format(new Date(props.booking.ends_at))
    : null;
  return end ? `${start} – ${end}` : start;
});
const statusClasses = computed(
  () =>
    ({
      pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
      confirmed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      completed: "bg-muted text-muted-foreground",
      cancelled: "bg-destructive/10 text-destructive",
    })[props.booking.status],
);
const actionClass =
  "flex min-h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm outline-none hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";
</script>

<template>
  <article
    class="relative overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-sm"
  >
    <button
      type="button"
      class="absolute inset-0 z-0 rounded-xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      :aria-label="`View ${eventName}`"
      @click="emit('open', booking)"
    />
    <div class="pointer-events-none relative z-10 flex items-start gap-4 p-4 sm:items-center sm:px-5">
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="truncate text-sm font-medium">{{ eventName }}</h3>
          <span
            class="rounded-full px-2 py-0.5 text-xs font-medium capitalize"
            :class="statusClasses"
          >
            {{ booking.status }}
          </span>
        </div>
        <p class="mt-1 text-sm tabular-nums text-muted-foreground">
          {{ dateLabel }}<template v-if="timeLabel"> · {{ timeLabel }}</template>
        </p>
        <p class="mt-2 text-xs text-muted-foreground">
          {{ booking.guests?.length ?? 0 }}
          {{ (booking.guests?.length ?? 0) === 1 ? "guest" : "guests" }}
          · {{ timezone }}
          <template v-if="!booking.meeting_url && booking.status !== 'cancelled'">
            · Meet link pending
          </template>
        </p>
      </div>

      <div class="pointer-events-auto flex shrink-0 items-center gap-1">
        <SharedButton v-if="booking.meeting_url" as-child size="sm" class="max-sm:hidden">
          <a :href="booking.meeting_url" target="_blank" rel="noopener noreferrer">
            <HugeiconsIcon :icon="Video01Icon" :size="15" aria-hidden="true" />
            Join
          </a>
        </SharedButton>
        <SharedPopover v-if="canManage" v-model:open="actionsOpen">
          <SharedPopoverTrigger as-child>
            <SharedButton
              type="button"
              variant="ghost"
              size="icon-sm"
              :aria-label="`Actions for ${eventName}`"
            >
              <HugeiconsIcon :icon="MoreHorizontalIcon" :size="18" aria-hidden="true" />
            </SharedButton>
          </SharedPopoverTrigger>
          <SharedPopoverContent align="end" class="w-48 p-1.5 font-normal!">
            <button
              v-if="canChange"
              type="button"
              :class="actionClass"
              @click="emit('edit', booking); actionsOpen = false"
            >
              <HugeiconsIcon :icon="Edit02Icon" :size="16" aria-hidden="true" />
              Edit meeting
            </button>
            <button
              v-if="canChange"
              type="button"
              :class="actionClass"
              @click="emit('cancel', booking); actionsOpen = false"
            >
              Cancel meeting
            </button>
            <button
              type="button"
              :class="[actionClass, 'text-destructive hover:bg-destructive/10']"
              @click="emit('delete', booking); actionsOpen = false"
            >
              <HugeiconsIcon :icon="Delete02Icon" :size="16" aria-hidden="true" />
              Delete meeting
            </button>
          </SharedPopoverContent>
        </SharedPopover>
      </div>
    </div>
  </article>
</template>
