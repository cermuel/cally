<script setup lang="ts">
import {
  Calendar03Icon,
  Cancel01Icon,
  Clock01Icon,
  CopyLinkIcon,
  Location05Icon,
  Note01Icon,
  Time02Icon,
  UserMultipleIcon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import { toast } from "vue-sonner";
import type { Booking, BookingGuest } from "~/utils/api/bookings";

const props = defineProps<{
  booking: Booking | null;
}>();

const open = defineModel<boolean>("open", { default: false });

const timezone = computed(() => props.booking?.host?.timezone ?? "UTC");
const eventName = computed(() =>
  props.booking
    ? props.booking.event?.name ?? `Event #${props.booking.event_id}`
    : "Booking details",
);

const statusLabel = computed(() => {
  if (!props.booking) return "";
  return {
    pending: "Needs confirmation",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
  }[props.booking.status];
});

const dateLabel = computed(() =>
  props.booking?.starts_at
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
  if (!props.booking?.starts_at) return "Time to be confirmed";

  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone.value,
  });
  const start = formatter.format(new Date(props.booking.starts_at)).toLowerCase();
  const end = props.booking.ends_at
    ? formatter.format(new Date(props.booking.ends_at)).toLowerCase()
    : "";

  return end ? `${start}–${end}` : start;
});

const durationLabel = computed(() => {
  if (props.booking?.starts_at && props.booking.ends_at) {
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

  const minutes = props.booking?.event?.duration_minutes;
  return minutes
    ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}`
    : "Duration to be confirmed";
});

const guests = computed<BookingGuest[]>(() => props.booking?.guests ?? []);

const copyMeetingLink = async () => {
  if (!props.booking?.meeting_url) return;

  try {
    await navigator.clipboard.writeText(props.booking.meeting_url);
    toast.success("Meeting link copied");
  } catch {
    toast.error("Could not copy the meeting link");
  }
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none"
      />
      <DialogContent
        class="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-b-0 border-border bg-muted shadow-[0_-20px_60px_oklch(0_0_0/0.2)] outline-none duration-250 ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom motion-reduce:duration-200 motion-reduce:ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:data-[state=closed]:fade-out-0 motion-reduce:data-[state=open]:fade-in-0 motion-reduce:data-[state=closed]:slide-out-to-bottom-0 motion-reduce:data-[state=open]:slide-in-from-bottom-0 md:inset-y-0 md:start-auto md:end-0 md:mx-0 md:h-dvh md:max-h-none md:w-120 md:max-w-full md:rounded-none md:border-y-0 md:border-e-0 md:shadow-[-20px_0_60px_oklch(0_0_0/0.18)] md:data-[state=closed]:slide-out-to-bottom-0 md:data-[state=open]:slide-in-from-bottom-0 md:data-[state=closed]:slide-out-to-right md:data-[state=open]:slide-in-from-right"
      >
        <div class="flex justify-center py-2.5 md:hidden" aria-hidden="true">
          <span class="h-1 w-10 rounded-full bg-border" />
        </div>

        <template v-if="booking">
          <header class="flex items-start gap-4 border-b border-border px-5 pb-5 pt-2 md:p-6">
            <div class="min-w-0 flex-1">
              <div class="mb-2 flex flex-wrap items-center gap-2">
                <span
                  class="rounded-md px-2 py-0.5 text-xs font-medium"
                  :class="{
                    'bg-amber-500/10 text-amber-700 dark:text-amber-300': booking.status === 'pending',
                    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300': booking.status === 'confirmed',
                    'bg-muted text-muted-foreground': booking.status === 'completed',
                    'bg-destructive/10 text-destructive': booking.status === 'cancelled',
                  }"
                >
                  {{ statusLabel }}
                </span>
                <span class="text-xs text-muted-foreground">Booking #{{ booking.id }}</span>
              </div>
              <DialogTitle class="text-xl font-semibold tracking-tight">
                {{ eventName }}
              </DialogTitle>
              <DialogDescription class="mt-1 text-sm text-muted-foreground">
                Hosted by {{ booking.host?.name ?? "you" }}
              </DialogDescription>
            </div>

            <DialogClose as-child>
              <SharedButton
                type="button"
                variant="ghost"
                size="icon-sm"
                class="shrink-0 text-muted-foreground"
                aria-label="Close booking details"
              >
                <HugeiconsIcon
                  :icon="Cancel01Icon"
                  :size="19"
                  :stroke-width="1.75"
                  aria-hidden="true"
                />
              </SharedButton>
            </DialogClose>
          </header>

          <div class="min-h-0 flex-1 overscroll-contain overflow-y-auto">
            <div class="grid gap-7 p-5 md:p-6">
              <section aria-labelledby="booking-time-heading">
                <h2 id="booking-time-heading" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  When and where
                </h2>
                <dl class="mt-4 space-y-4 text-sm">
                  <div class="flex items-start gap-3">
                    <HugeiconsIcon :icon="Calendar03Icon" :size="18" :stroke-width="1.75" class="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <dt class="sr-only">Date</dt>
                      <dd class="font-medium">{{ dateLabel }}</dd>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <HugeiconsIcon :icon="Clock01Icon" :size="18" :stroke-width="1.75" class="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <dt class="sr-only">Time</dt>
                      <dd>{{ timeLabel }}</dd>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <HugeiconsIcon :icon="Time02Icon" :size="18" :stroke-width="1.75" class="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <dt class="sr-only">Duration and timezone</dt>
                      <dd>{{ durationLabel }} <span class="text-muted-foreground">· {{ timezone }}</span></dd>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <HugeiconsIcon :icon="Location05Icon" :size="18" :stroke-width="1.75" class="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div class="min-w-0">
                      <dt class="sr-only">Location</dt>
                      <dd>{{ booking.meeting_url ? "Google Meet" : "Meeting link to follow" }}</dd>
                    </div>
                  </div>
                </dl>
              </section>

              <section aria-labelledby="booking-people-heading">
                <div class="flex items-center justify-between gap-3">
                  <h2 id="booking-people-heading" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    People
                  </h2>
                  <span class="text-xs text-muted-foreground">
                    {{ guests.length + (booking.host ? 1 : 0) }} total
                  </span>
                </div>

                <div class="mt-4 space-y-3">
                  <div v-if="booking.host" class="flex items-center gap-3">
                    <UiPublicProfileAvatar :image="booking.host.avatar ?? undefined" :name="booking.host.name" size="sm" class="size-9" />
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <p class="truncate text-sm font-medium">{{ booking.host.name }}</p>
                        <span class="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Host</span>
                      </div>
                      <p class="truncate text-xs text-muted-foreground">{{ booking.host.email }}</p>
                    </div>
                  </div>

                  <div v-for="guest in guests" :key="guest.id" class="flex items-center gap-3">
                    <UiPublicProfileAvatar :name="guest.name ?? guest.email" size="sm" class="size-9" />
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-medium">{{ guest.name ?? guest.email }}</p>
                      <p class="truncate text-xs text-muted-foreground">{{ guest.email }}</p>
                    </div>
                    <span class="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
                      {{ guest.attendance_status }}
                    </span>
                  </div>

                  <div v-if="!booking.host && !guests.length" class="flex items-center gap-3 rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground">
                    <HugeiconsIcon :icon="UserMultipleIcon" :size="18" :stroke-width="1.75" aria-hidden="true" />
                    No attendees were added.
                  </div>
                </div>
              </section>
            </div>

            <section v-if="booking.notes || booking.cancellation_reason" class="border-t border-border px-5 py-5 md:px-6">
              <div class="flex items-start gap-3">
                <HugeiconsIcon :icon="Note01Icon" :size="18" :stroke-width="1.75" class="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div class="min-w-0">
                  <h2 class="text-sm font-medium">
                    {{ booking.cancellation_reason ? "Cancellation reason" : "Guest note" }}
                  </h2>
                  <p class="mt-1 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-muted-foreground">
                    {{ booking.cancellation_reason || booking.notes }}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <footer v-if="booking.meeting_url" class="flex gap-2 border-t border-border bg-background/50 p-4 md:px-6">
            <SharedButton as-child class="flex-1">
              <a :href="booking.meeting_url" target="_blank" rel="noopener noreferrer">
                <HugeiconsIcon :icon="Video01Icon" :size="17" :stroke-width="1.75" aria-hidden="true" />
                Join meeting
              </a>
            </SharedButton>
            <SharedButton type="button" variant="outline" size="icon" aria-label="Copy meeting link" @click="copyMeetingLink">
              <HugeiconsIcon :icon="CopyLinkIcon" :size="18" :stroke-width="1.75" aria-hidden="true" />
            </SharedButton>
          </footer>
        </template>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
