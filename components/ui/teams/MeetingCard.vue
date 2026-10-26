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
const cancelled = computed(() => props.booking.status === "cancelled");
const canJoin = computed(
  () => !!props.booking.meeting_url && props.booking.status === "confirmed",
);
const dateLabel = computed(() =>
  props.booking.starts_at
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: timezone.value,
      }).format(new Date(props.booking.starts_at))
    : "Time TBC",
);
const dateParts = computed(() => {
  if (!props.booking.starts_at) return { day: "—", month: "TBC" };

  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: timezone.value,
  }).formatToParts(new Date(props.booking.starts_at));

  return {
    day: parts.find((part) => part.type === "day")?.value ?? "—",
    month: parts.find((part) => part.type === "month")?.value ?? "TBC",
  };
});
const timeLabel = computed(() => {
  if (!props.booking.starts_at) return "";
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone.value,
  });
  const format = (date: string) =>
    formatter.format(new Date(date)).replace(/\s/g, "").toLowerCase();
  return props.booking.ends_at
    ? `${format(props.booking.starts_at)} - ${format(props.booking.ends_at)}`
    : format(props.booking.starts_at);
});
const attendeeCount = computed(() => props.booking.guests?.length ?? 0);
const primaryAttendee = computed(() => {
  const guest = props.booking.guests?.[0];
  return guest?.user?.name || guest?.name || guest?.email || "No attendee added";
});
const actionClass =
  "flex min-h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm outline-none hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";
</script>

<template>
  <article
    class="group relative overflow-hidden rounded-xl border border-border bg-card text-sm shadow-xs transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-sm focus-within:border-ring/50"
  >
    <button
      type="button"
      class="absolute inset-0 z-0 rounded-xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      :aria-label="`View details for ${eventName} on ${dateLabel}`"
      @click="emit('open', booking)"
    />
    <div class="pointer-events-none relative z-10 flex min-w-0 items-stretch">
      <div
        class="hidden w-20 shrink-0 place-items-center border-e border-border bg-muted/30 px-3 py-5 text-center sm:grid"
        :class="cancelled && 'text-muted-foreground'"
      >
        <div>
          <p
            class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
          >
            {{ dateParts.month }}
          </p>
          <p class="mt-1 text-2xl font-semibold tabular-nums leading-none">
            {{ dateParts.day }}
          </p>
        </div>
      </div>

      <div
        class="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 p-4 sm:flex sm:items-center sm:gap-4 sm:px-5"
      >
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h3
              class="truncate text-[15px] font-medium"
              :class="cancelled && 'text-muted-foreground line-through'"
            >
              {{ eventName }}
            </h3>
            <SharedPill
              v-if="booking.status !== 'confirmed'"
              :value="booking.status"
            />
          </div>
          <p class="mt-1 text-sm tabular-nums text-muted-foreground">
            {{ dateLabel }} · {{ timeLabel }}
          </p>
          <div
            class="pointer-events-auto mt-3 flex min-w-0 items-center gap-2"
            @click.stop
          >
            <UiTeamsMeetingGuestStack :guests="booking.guests" />
            <p class="min-w-0 truncate text-xs text-muted-foreground">
              <span class="text-foreground/80">{{ primaryAttendee }}</span>
              <template v-if="attendeeCount">
                · {{ attendeeCount }}
                {{ attendeeCount === 1 ? "person" : "people" }}
              </template>
            </p>
          </div>
        </div>

        <div
          class="pointer-events-auto flex shrink-0 items-center gap-1"
          @click.stop
        >
          <SharedButton v-if="canJoin" as-child size="sm" class="max-sm:hidden">
            <a
              :href="booking.meeting_url ?? ''"
              target="_blank"
              rel="noopener noreferrer"
            >
              <HugeiconsIcon
                :icon="Video01Icon"
                :size="15"
                :stroke-width="1.5"
                aria-hidden="true"
              />
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
                <HugeiconsIcon
                  :icon="MoreHorizontalIcon"
                  :size="18"
                  aria-hidden="true"
                />
              </SharedButton>
            </SharedPopoverTrigger>
            <SharedPopoverContent align="end" class="w-48 p-1.5 font-normal!">
              <button
                v-if="canChange"
                type="button"
                :class="actionClass"
                @click="emit('edit', booking); actionsOpen = false"
              >
                <HugeiconsIcon
                  :icon="Edit02Icon"
                  :size="16"
                  aria-hidden="true"
                />
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
                :class="[
                  actionClass,
                  'text-destructive hover:bg-destructive/10',
                ]"
                @click="emit('delete', booking); actionsOpen = false"
              >
                <HugeiconsIcon
                  :icon="Delete02Icon"
                  :size="16"
                  aria-hidden="true"
                />
                Delete meeting
              </button>
            </SharedPopoverContent>
          </SharedPopover>
        </div>
      </div>
    </div>
  </article>
</template>
