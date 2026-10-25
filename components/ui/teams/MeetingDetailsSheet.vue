<script setup lang="ts">
import {
  Calendar03Icon,
  Clock01Icon,
  Edit02Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useQuery } from "@tanstack/vue-query";
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
const dateLabel = computed(() =>
  booking.value?.starts_at
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "full",
        timeZone: timezone.value,
      }).format(new Date(booking.value.starts_at))
    : "Time to be confirmed",
);
const timeLabel = computed(() => {
  if (!booking.value?.starts_at) return "—";
  const formatter = new Intl.DateTimeFormat(undefined, {
    timeStyle: "short",
    timeZone: timezone.value,
  });
  const start = formatter.format(new Date(booking.value.starts_at));
  return booking.value.ends_at
    ? `${start} – ${formatter.format(new Date(booking.value.ends_at))}`
    : start;
});
</script>

<template>
  <SharedSheet
    v-model:open="open"
    title="Team meeting"
    description="Meeting details, attendees and actions"
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
    <div v-else-if="booking" class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <section class="p-5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">{{ booking.status }}</span>
          <span class="text-xs text-muted-foreground">Meeting #{{ booking.id }}</span>
        </div>
        <h2 class="mt-2 text-base font-semibold tracking-tight">{{ booking.event?.name ?? `Event #${booking.event_id}` }}</h2>
        <p v-if="booking.notes" class="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{{ booking.notes }}</p>
      </section>

      <section class="border-t border-border px-5 py-4" aria-labelledby="team-meeting-when">
        <h2 id="team-meeting-when" class="text-xs font-medium text-muted-foreground">When and where</h2>
        <dl class="mt-3 space-y-3 text-sm">
          <div class="grid grid-cols-[92px_1fr] gap-3">
            <dt class="flex items-center gap-1.5 text-muted-foreground"><HugeiconsIcon :icon="Calendar03Icon" :size="15" aria-hidden="true" />Date</dt>
            <dd>{{ dateLabel }}</dd>
          </div>
          <div class="grid grid-cols-[92px_1fr] gap-3">
            <dt class="flex items-center gap-1.5 text-muted-foreground"><HugeiconsIcon :icon="Clock01Icon" :size="15" aria-hidden="true" />Time</dt>
            <dd>{{ timeLabel }} · {{ timezone }}</dd>
          </div>
          <div class="grid grid-cols-[92px_1fr] gap-3">
            <dt class="flex items-center gap-1.5 text-muted-foreground"><HugeiconsIcon :icon="Video01Icon" :size="15" aria-hidden="true" />Location</dt>
            <dd>
              <a v-if="booking.meeting_url" :href="booking.meeting_url" target="_blank" rel="noopener noreferrer" class="font-medium text-primary hover:underline">Join Google Meet</a>
              <span v-else class="text-muted-foreground">Meet link is being prepared</span>
            </dd>
          </div>
        </dl>
      </section>

      <section class="border-t border-border px-5 py-4" aria-labelledby="team-meeting-guests">
        <div class="flex items-center justify-between gap-3">
          <h2 id="team-meeting-guests" class="text-xs font-medium text-muted-foreground">Team guests</h2>
          <span class="text-xs text-muted-foreground">{{ booking.guests?.length ?? 0 }}</span>
        </div>
        <ul v-if="booking.guests?.length" class="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border">
          <li v-for="guest in booking.guests" :key="guest.id" class="flex items-center gap-3 px-3 py-2.5">
            <SharedAvatar :name="guest.name || guest.email" class="size-8" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">{{ guest.name || guest.email }}</p>
              <p class="truncate text-xs text-muted-foreground">{{ guest.email }}</p>
            </div>
            <span class="rounded-md bg-muted px-1.5 py-0.5 text-xs capitalize text-muted-foreground">{{ guest.attendance_status }}</span>
          </li>
        </ul>
        <p v-else class="mt-3 rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">No guests were returned for this meeting.</p>
      </section>

      <section v-if="booking.cancellation_reason" class="border-t border-border px-5 py-4">
        <h2 class="text-xs font-medium text-muted-foreground">Cancellation reason</h2>
        <p class="mt-2 whitespace-pre-wrap text-sm">{{ booking.cancellation_reason }}</p>
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
        <SharedButton type="button" variant="destructive" class="flex-1" @click="emit('delete', booking)">Delete</SharedButton>
      </div>
    </div>
  </SharedSheet>
</template>
