<script setup lang="ts">
import {
  Calendar03Icon,
  Clock01Icon,
  CopyLinkIcon,
  Edit02Icon,
  Location05Icon,
  Note01Icon,
  Time02Icon,
  UserMultipleIcon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useQuery } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { getApiErrorMessage } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";
import { teamBookingsApi, type TeamBooking } from "~/utils/api/team-bookings";

const props = defineProps<{
  teamId: number;
  bookingId: number | null;
  canManage: boolean;
}>();
const emit = defineEmits<{
  edit: [booking: TeamBooking];
  cancel: [booking: TeamBooking];
  delete: [booking: TeamBooking];
}>();
const open = defineModel<boolean>("open", { default: false });
const client = useApiClient();

const bookingQuery = useQuery({
  queryKey: computed(() =>
    queryKeys.teams.booking(props.teamId, props.bookingId ?? "none"),
  ),
  enabled: computed(() => open.value && props.bookingId !== null),
  queryFn: () => teamBookingsApi.get(client, props.teamId, props.bookingId!),
  refetchInterval: (query) => {
    const booking = query.state.data?.booking;
    return booking &&
      !booking.meeting_url &&
      booking.status !== "cancelled" &&
      booking.status !== "completed"
      ? 10_000
      : false;
  },
});
const booking = computed(() => bookingQuery.data.value?.booking ?? null);
const timezone = computed(() => booking.value?.booking_timezone || "UTC");
const eventName = computed(() =>
  booking.value
    ? (booking.value.event?.name ?? `Event #${booking.value.event_id}`)
    : "Meeting details",
);
const dateLabel = computed(() =>
  booking.value?.starts_at
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: timezone.value,
      }).format(new Date(booking.value.starts_at))
    : "Date to be confirmed",
);
const timeLabel = computed(() => {
  if (!booking.value?.starts_at) return "Time to be confirmed";

  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone.value,
  });
  const start = formatter
    .format(new Date(booking.value.starts_at))
    .toLowerCase();
  const end = booking.value.ends_at
    ? formatter.format(new Date(booking.value.ends_at)).toLowerCase()
    : "";

  return end ? `${start}–${end}` : start;
});

const durationLabel = computed(() => {
  if (booking.value?.starts_at && booking.value.ends_at) {
    const minutes = Math.max(
      0,
      Math.round(
        (new Date(booking.value.ends_at).getTime() -
          new Date(booking.value.starts_at).getTime()) /
          60_000,
      ),
    );
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  }

  const minutes = booking.value?.event?.duration_minutes;
  return minutes
    ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}`
    : "Duration to be confirmed";
});

const copyMeetingLink = async () => {
  if (!booking.value?.meeting_url) return;

  try {
    await navigator.clipboard.writeText(booking.value.meeting_url);
    toast.success("Meeting link copied");
  } catch {
    toast.error("Could not copy the meeting link");
  }
};
</script>

<template>
  <SharedSheet
    v-model:open="open"
    title="Meeting details"
    description="Meeting time, location and attendees"
    close-label="Close team meeting details"
  >
    <template v-if="booking && canManage" #actions>
      <SharedButton type="button" variant="ghost" size="icon-sm" aria-label="Edit meeting" @click="emit('edit', booking)">
        <HugeiconsIcon :icon="Edit02Icon" :size="16" aria-hidden="true" />
      </SharedButton>
    </template>

    <div v-if="bookingQuery.isPending.value" class="space-y-4 p-5" aria-label="Loading meeting details">
      <div class="h-20 animate-pulse rounded-lg bg-muted/60" />
      <div class="h-36 animate-pulse rounded-lg bg-muted/60" />
    </div>
    <div v-else-if="bookingQuery.isError.value" role="alert" class="p-5">
      <div class="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {{ getApiErrorMessage(bookingQuery.error.value, "Could not load the team meeting.") }}
      </div>
    </div>
    <template v-else-if="booking">
      <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <section class="p-5" aria-label="Meeting overview">
          <div class="mb-2 flex flex-wrap items-center gap-2">
            <SharedPill :value="booking.status" />
            <span class="text-xs tabular-nums text-muted-foreground">
              Meeting #{{ booking.id }}
            </span>
          </div>
          <p class="text-base font-semibold tracking-tight">
            {{ eventName }}
          </p>
        </section>

        <section
          class="border-t border-border px-5 py-4"
          aria-labelledby="team-booking-time-heading"
        >
          <h2
            id="team-booking-time-heading"
            class="text-xs font-medium text-muted-foreground"
          >
            When and where
          </h2>
          <dl class="mt-3 space-y-2.5 text-[13px]">
            <div class="grid grid-cols-[96px_1fr] items-baseline gap-3">
              <dt class="flex items-center gap-1.5 text-muted-foreground">
                <HugeiconsIcon
                  :icon="Calendar03Icon"
                  :size="14"
                  :stroke-width="1.75"
                  class="shrink-0 self-center"
                  aria-hidden="true"
                />
                Date
              </dt>
              <dd class="min-w-0">{{ dateLabel }}</dd>
            </div>
            <div class="grid grid-cols-[96px_1fr] items-baseline gap-3">
              <dt class="flex items-center gap-1.5 text-muted-foreground">
                <HugeiconsIcon
                  :icon="Clock01Icon"
                  :size="14"
                  :stroke-width="1.75"
                  class="shrink-0 self-center"
                  aria-hidden="true"
                />
                Time
              </dt>
              <dd class="min-w-0">{{ timeLabel }}</dd>
            </div>
            <div class="grid grid-cols-[96px_1fr] items-baseline gap-3">
              <dt class="flex items-center gap-1.5 text-muted-foreground">
                <HugeiconsIcon
                  :icon="Time02Icon"
                  :size="14"
                  :stroke-width="1.75"
                  class="shrink-0 self-center"
                  aria-hidden="true"
                />
                Duration
              </dt>
              <dd class="min-w-0">
                {{ durationLabel }}
                <span class="text-muted-foreground">· {{ timezone }}</span>
              </dd>
            </div>
            <div class="grid grid-cols-[96px_1fr] items-baseline gap-3">
              <dt class="flex items-center gap-1.5 text-muted-foreground">
                <HugeiconsIcon
                  :icon="Location05Icon"
                  :size="14"
                  :stroke-width="1.75"
                  class="shrink-0 self-center"
                  aria-hidden="true"
                />
                Location
              </dt>
              <dd class="min-w-0">
                {{
                  booking.meeting_url
                    ? "Google Meet"
                    : "Meeting link to follow"
                }}
              </dd>
            </div>
          </dl>
        </section>

        <section
          class="border-t border-border px-5 py-4"
          aria-labelledby="team-booking-people-heading"
        >
          <div class="flex items-center justify-between gap-3">
            <h2
              id="team-booking-people-heading"
              class="text-xs font-medium text-muted-foreground"
            >
              People
            </h2>
            <span class="text-xs tabular-nums text-muted-foreground">
              {{ booking.guests?.length ?? 0 }}
            </span>
          </div>

          <ul
            v-if="booking.guests?.length"
            class="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border"
          >
            <li
              v-for="guest in booking.guests"
              :key="guest.id"
              class="flex items-center gap-3 px-3 py-2.5"
            >
              <UiPublicProfileAvatar
                :image="guest.user?.avatar_url || undefined"
                :name="guest.user?.name || guest.name || guest.email"
                size="sm"
                class="size-8"
              />
              <div class="min-w-0 flex-1">
                <p class="truncate text-[13px] font-medium">
                  {{ guest.name || guest.email }}
                </p>
                <p class="truncate text-xs text-muted-foreground">
                  {{ guest.email }}
                </p>
              </div>
              <SharedPill :value="guest.attendance_status" />
            </li>
          </ul>

          <div
            v-else
            class="mt-3 rounded-lg border border-dashed border-border px-5 py-8 text-center"
          >
            <HugeiconsIcon
              :icon="UserMultipleIcon"
              :size="18"
              :stroke-width="1.75"
              class="mx-auto text-muted-foreground"
              aria-hidden="true"
            />
            <p class="mt-2 text-[13px] font-medium">No attendees</p>
            <p class="mt-0.5 text-xs text-muted-foreground">
              No attendees were added.
            </p>
          </div>
        </section>

        <section
          v-if="booking.notes || booking.cancellation_reason"
          class="border-t border-border px-5 py-4"
          aria-labelledby="team-booking-notes-heading"
        >
          <h2
            id="team-booking-notes-heading"
            class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
          >
            <HugeiconsIcon
              :icon="Note01Icon"
              :size="14"
              :stroke-width="1.75"
              aria-hidden="true"
            />
            {{
              booking.cancellation_reason ? "Cancellation reason" : "Guest note"
            }}
          </h2>
          <p
            class="mt-3 whitespace-pre-wrap wrap-break-word text-[13px] leading-6"
          >
            {{ booking.cancellation_reason || booking.notes }}
          </p>
        </section>

        <div v-if="canManage" class="flex gap-2 border-t border-border p-5">
          <SharedButton
            v-if="booking.status !== 'cancelled' && booking.status !== 'completed'"
            type="button"
            variant="outline"
            class="flex-1"
            @click="emit('cancel', booking)"
          >
            Cancel meeting
          </SharedButton>
          <SharedButton
            type="button"
            variant="destructive"
            class="flex-1"
            @click="emit('delete', booking)"
          >
            Delete
          </SharedButton>
        </div>
      </div>

      <footer
        v-if="booking.meeting_url"
        class="flex shrink-0 items-center gap-2 border-t border-border bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <SharedButton as-child class="flex-1">
          <a
            :href="booking.meeting_url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <HugeiconsIcon
              :icon="Video01Icon"
              :size="15"
              :stroke-width="1.75"
              aria-hidden="true"
            />
            Join meeting
          </a>
        </SharedButton>
        <SharedButton
          type="button"
          variant="outline"
          size="icon"
          aria-label="Copy meeting link"
          @click="copyMeetingLink"
        >
          <HugeiconsIcon
            :icon="CopyLinkIcon"
            :size="16"
            :stroke-width="1.75"
            aria-hidden="true"
          />
        </SharedButton>
      </footer>
    </template>
  </SharedSheet>
</template>
