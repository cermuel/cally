<script setup lang="ts">
import {
  AddTeamIcon,
  Cancel01Icon,
  CardExchange01Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  MoreHorizontalIcon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { Booking } from "~/utils/api/bookings";

const props = defineProps<{
  booking: Booking;
  busy?: boolean;
}>();

const emit = defineEmits<{
  accept: [booking: Booking];
  addGuests: [booking: Booking];
  cancel: [booking: Booking];
  decline: [booking: Booking];
  delete: [booking: Booking];
  open: [booking: Booking];
  reschedule: [booking: Booking];
}>();

const open = ref(false);

const pending = computed(() => props.booking.status === "pending");
const confirmed = computed(() => props.booking.status === "confirmed");
const cancelled = computed(() => props.booking.status === "cancelled");
const canModify = computed(
  () =>
    props.booking.status === "pending" || props.booking.status === "confirmed",
);
const canJoin = computed(
  () => !!props.booking.meeting_url && props.booking.status === "confirmed",
);
const timezone = computed(() => props.booking.host?.timezone ?? "UTC");

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
  const fmt = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone.value,
  });
  const t = (d: string) =>
    fmt.format(new Date(d)).replace(/\s/g, "").toLowerCase();
  return props.booking.ends_at
    ? `${t(props.booking.starts_at)} - ${t(props.booking.ends_at)}`
    : t(props.booking.starts_at);
});

const attendeeCount = computed(
  () => (props.booking.guests?.length ?? 0) + (props.booking.host ? 1 : 0),
);

const primaryGuest = computed(() => {
  const guest = props.booking.guests?.[0];
  return guest?.name || guest?.email || "No guest added";
});

const eventName = computed(
  () => props.booking.event?.name ?? `Event #${props.booking.event_id}`,
);

const item =
  "flex min-h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm outline-none hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50";
</script>

<template>
  <article
    class="group relative overflow-hidden rounded-xl border border-border bg-card text-sm shadow-[0_1px_2px_oklch(0_0_0/0.04)] transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-[0_8px_24px_oklch(0_0_0/0.08)] focus-within:border-ring/50 sm:rounded-2xl"
  >
    <button
      type="button"
      class="absolute inset-0 z-0 rounded-xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:rounded-2xl"
      :aria-label="`View details for ${eventName} on ${dateLabel}`"
      @click="emit('open', booking)"
    />

    <div class="pointer-events-none relative z-10 flex min-w-0 items-stretch">
      <div
        class="hidden w-24 shrink-0 place-items-center border-e border-border bg-muted/35 px-3 py-5 text-center sm:grid"
        :class="cancelled && 'text-muted-foreground'"
      >
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {{ dateParts.month }}
          </p>
          <p class="mt-0.5 text-2xl font-semibold tabular-nums leading-none">
            {{ dateParts.day }}
          </p>
        </div>
      </div>

      <div
        class="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 p-4 sm:flex sm:items-center sm:gap-4 sm:px-5"
      >
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h2
              class="truncate text-[15px] font-semibold"
              :class="cancelled && 'text-muted-foreground line-through'"
            >
              {{ eventName }}
            </h2>
            <span
              v-if="pending"
              class="shrink-0 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300"
            >
              Needs confirmation
            </span>
            <span
              v-else-if="cancelled"
              class="shrink-0 rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
            >
              Cancelled
            </span>
          </div>

          <p class="mt-1 text-sm text-muted-foreground">
            {{ dateLabel }} · {{ timeLabel }}
          </p>

          <div
            class="pointer-events-auto mt-3 flex min-w-0 items-center gap-2"
            @click.stop
          >
            <UiPublicGuestStack :booking="booking" />
            <p class="min-w-0 truncate text-xs text-muted-foreground">
              <span class="text-foreground/80">{{ primaryGuest }}</span>
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
          <SharedButton
            v-if="canJoin"
            as-child
            variant="outline"
            size="sm"
            class="max-sm:hidden"
          >
            <a
              :href="booking.meeting_url ?? ''"
              target="_blank"
              rel="noopener noreferrer"
            >
              <HugeiconsIcon
                :icon="Video01Icon"
                :size="15"
                :stroke-width="1.75"
                aria-hidden="true"
              />
              Join
            </a>
          </SharedButton>

          <SharedPopover v-model:open="open">
            <SharedPopoverTrigger as-child>
              <SharedButton
                type="button"
                variant="ghost"
                size="icon-sm"
                class="text-muted-foreground"
                :aria-label="`Actions for ${eventName}`"
              >
                <HugeiconsIcon
                  :icon="MoreHorizontalIcon"
                  :size="18"
                  :stroke-width="1.75"
                  aria-hidden="true"
                />
              </SharedButton>
            </SharedPopoverTrigger>
            <SharedPopoverContent align="end" class="w-48 font-normal! p-1.5">
              <button
                v-if="pending"
                type="button"
                :class="item"
                :disabled="busy"
                @click="
                  emit('accept', booking);
                  open = false;
                "
              >
                <HugeiconsIcon
                  :icon="CheckmarkCircle02Icon"
                  :size="17"
                  :stroke-width="1.5"
                  aria-hidden="true"
                />
                Accept invitation
              </button>
              <button
                v-if="canModify"
                type="button"
                :class="item"
                :disabled="busy"
                @click="
                  emit('reschedule', booking);
                  open = false;
                "
              >
                <HugeiconsIcon
                  :icon="CardExchange01Icon"
                  :size="17"
                  :stroke-width="1.5"
                  aria-hidden="true"
                />
                Reschedule meeting
              </button>
              <button
                v-if="pending"
                type="button"
                :class="item"
                :disabled="busy"
                @click="
                  emit('decline', booking);
                  open = false;
                "
              >
                <HugeiconsIcon
                  :icon="Cancel01Icon"
                  :size="16"
                  :stroke-width="1.5"
                  aria-hidden="true"
                />
                Decline invitation
              </button>
              <button
                v-if="confirmed"
                type="button"
                :class="item"
                :disabled="busy"
                @click="
                  emit('cancel', booking);
                  open = false;
                "
              >
                <HugeiconsIcon
                  :icon="Cancel01Icon"
                  :size="16"
                  :stroke-width="1.5"
                  aria-hidden="true"
                />
                Cancel event
              </button>
              <button
                v-if="canModify"
                type="button"
                :class="item"
                :disabled="busy"
                @click="
                  emit('addGuests', booking);
                  open = false;
                "
              >
                <HugeiconsIcon
                  :icon="AddTeamIcon"
                  :size="17"
                  :stroke-width="1.5"
                  aria-hidden="true"
                />
                Add guests
              </button>
              <div class="my-1.5 h-px bg-border" role="separator" />
              <button
                type="button"
                :class="[
                  item,
                  'text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:outline-destructive',
                ]"
                :disabled="busy"
                @click="
                  emit('delete', booking);
                  open = false;
                "
              >
                <HugeiconsIcon
                  :icon="Delete02Icon"
                  :size="16"
                  :stroke-width="1.5"
                  aria-hidden="true"
                />
                Delete booking
              </button>
            </SharedPopoverContent>
          </SharedPopover>
        </div>
      </div>
    </div>
  </article>
</template>
