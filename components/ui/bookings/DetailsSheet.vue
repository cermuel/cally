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
    ? (props.booking.event?.name ?? `Event #${props.booking.event_id}`)
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
  const start = formatter
    .format(new Date(props.booking.starts_at))
    .toLowerCase();
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
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none"
      />
      <DialogContent
        class="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-b-0 border-border bg-background shadow-[0_-16px_48px_oklch(0_0_0/0.16)] outline-none duration-250 ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom motion-reduce:duration-200 motion-reduce:ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:data-[state=closed]:fade-out-0 motion-reduce:data-[state=open]:fade-in-0 motion-reduce:data-[state=closed]:slide-out-to-bottom-0 motion-reduce:data-[state=open]:slide-in-from-bottom-0 md:inset-y-0 md:start-auto md:end-0 md:mx-0 md:h-dvh md:max-h-none md:w-120 md:max-w-full md:rounded-none md:border-y-0 md:border-e-0 md:shadow-[-16px_0_48px_oklch(0_0_0/0.14)] md:data-[state=closed]:slide-out-to-bottom-0 md:data-[state=open]:slide-in-from-bottom-0 md:data-[state=closed]:slide-out-to-right md:data-[state=open]:slide-in-from-right"
      >
        <div class="flex justify-center pt-2 md:hidden" aria-hidden="true">
          <span class="h-1 w-9 rounded-full bg-border" />
        </div>

        <template v-if="booking">
          <header
            class="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4"
          >
            <DialogTitle class="flex-1 text-sm font-medium">
              Booking details
            </DialogTitle>
            <DialogDescription class="sr-only">
              Booking time, location and attendees
            </DialogDescription>
            <DialogClose as-child>
              <SharedButton
                type="button"
                variant="ghost"
                size="icon-sm"
                class="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="Close booking details"
              >
                <HugeiconsIcon
                  :icon="Cancel01Icon"
                  :size="17"
                  :stroke-width="1.75"
                  aria-hidden="true"
                />
              </SharedButton>
            </DialogClose>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <section class="p-5" aria-label="Booking overview">
              <div class="mb-2 flex flex-wrap items-center gap-2">
                <span
                  class="rounded-md px-2 py-0.5 text-xs font-medium"
                  :class="{
                    'bg-amber-500/10 text-amber-700 dark:text-amber-300':
                      booking.status === 'pending',
                    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300':
                      booking.status === 'confirmed',
                    'bg-muted text-muted-foreground':
                      booking.status === 'completed',
                    'bg-destructive/10 text-destructive':
                      booking.status === 'cancelled',
                  }"
                >
                  {{ statusLabel }}
                </span>
                <span class="text-xs tabular-nums text-muted-foreground"
                  >Booking #{{ booking.id }}</span
                >
              </div>
              <p class="text-base font-semibold tracking-tight">
                {{ eventName }}
              </p>
            </section>

            <section
              class="border-t border-border px-5 py-4"
              aria-labelledby="booking-time-heading"
            >
              <h2
                id="booking-time-heading"
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
              aria-labelledby="booking-people-heading"
            >
              <div class="flex items-center justify-between gap-3">
                <h2
                  id="booking-people-heading"
                  class="text-xs font-medium text-muted-foreground"
                >
                  People
                </h2>
                <span class="text-xs tabular-nums text-muted-foreground">
                  {{ guests.length + (booking.host ? 1 : 0) }}
                </span>
              </div>

              <ul
                v-if="booking.host || guests.length"
                class="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border"
              >
                <li
                  v-if="booking.host"
                  class="flex items-center gap-3 px-3 py-2.5"
                >
                  <UiPublicProfileAvatar
                    :image="booking.host.avatar ?? undefined"
                    :name="booking.host.name"
                    size="sm"
                    class="size-8"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <p class="truncate text-[13px] font-medium">
                        {{ booking.host.name }}
                      </p>
                      <span
                        class="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >Host</span
                      >
                    </div>
                    <p class="truncate text-xs text-muted-foreground">
                      {{ booking.host.email }}
                    </p>
                  </div>
                </li>

                <li
                  v-for="guest in guests"
                  :key="guest.id"
                  class="flex items-center gap-3 px-3 py-2.5"
                >
                  <UiPublicProfileAvatar
                    :name="guest.name ?? guest.email"
                    size="sm"
                    class="size-8"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-[13px] font-medium">
                      {{ guest.name ?? guest.email }}
                    </p>
                    <p class="truncate text-xs text-muted-foreground">
                      {{ guest.email }}
                    </p>
                  </div>
                  <span
                    class="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium capitalize text-muted-foreground"
                  >
                    {{ guest.attendance_status }}
                  </span>
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
              aria-labelledby="booking-notes-heading"
            >
              <h2
                id="booking-notes-heading"
                class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
              >
                <HugeiconsIcon
                  :icon="Note01Icon"
                  :size="14"
                  :stroke-width="1.75"
                  aria-hidden="true"
                />
                {{
                  booking.cancellation_reason
                    ? "Cancellation reason"
                    : "Guest note"
                }}
              </h2>
              <p
                class="mt-3 whitespace-pre-wrap wrap-break-word text-[13px] leading-6"
              >
                {{ booking.cancellation_reason || booking.notes }}
              </p>
            </section>
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
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
