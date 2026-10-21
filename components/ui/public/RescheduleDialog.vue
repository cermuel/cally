<script setup lang="ts">
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useMutation } from "@tanstack/vue-query";
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
import type { Booking } from "~/utils/api/bookings";
import { getApiErrorMessage, getApiFieldErrors } from "~/utils/api/client";
import type { PublicScheduleSlot } from "~/utils/api/public";
import { reschedulesApi } from "~/utils/api/reschedules";

const props = defineProps<{
  booking: Booking;
  email: string;
}>();

const open = defineModel<boolean>("open", { default: false });
const client = useApiClient();
const selectedDate = ref("");
const selectedSlotId = ref("");
const localError = ref("");
const apiErrors = ref<Record<string, string[]>>({});

const eventId = computed(() => {
  const id = props.booking.event?.id ?? Number(props.booking.event_id);
  return Number.isInteger(id) && Number(id) > 0 ? Number(id) : null;
});
const timezone = computed(
  () => props.booking.booking_timezone ?? props.booking.host?.timezone ?? "UTC",
);
const originalDate = computed(() =>
  props.booking.starts_at
    ? dateKeyInTimezone(props.booking.starts_at, timezone.value)
    : "",
);
const originalSlot = computed<PublicScheduleSlot | null>(() => {
  if (!props.booking.starts_at || !props.booking.ends_at) return null;

  return {
    time: timeInTimezone(props.booking.starts_at, timezone.value),
    starts_at: props.booking.starts_at,
    ends_at: props.booking.ends_at,
  };
});

const availableTimesQuery = usePublicAvailableTimes(eventId, selectedDate);
const availableSlots = computed(() => {
  const slots = availableTimesQuery.data.value?.available_times ?? [];
  const current = originalSlot.value;
  if (
    !current ||
    selectedDate.value !== originalDate.value ||
    slots.some((slot) => slot.starts_at === current.starts_at)
  ) {
    return slots;
  }

  return [current, ...slots].sort(
    (first, second) =>
      new Date(first.starts_at).getTime() -
      new Date(second.starts_at).getTime(),
  );
});
const selectedSlot = computed(() =>
  availableSlots.value.find((slot) => slot.starts_at === selectedSlotId.value),
);
const fieldError = computed(
  () =>
    localError.value ||
    apiErrors.value.starts_at?.[0] ||
    apiErrors.value.ends_at?.[0],
);

function dateKeyInTimezone(value: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function timeInTimezone(value: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("hour")}:${part("minute")}`;
}

const reset = () => {
  selectedDate.value = originalDate.value;
  selectedSlotId.value = props.booking.starts_at ?? "";
  localError.value = "";
  apiErrors.value = {};
};

watch(open, (isOpen) => {
  if (isOpen) reset();
});

const selectDate = (date: string) => {
  selectedDate.value = date;
  selectedSlotId.value =
    date === originalDate.value ? (props.booking.starts_at ?? "") : "";
  localError.value = "";
  apiErrors.value = {};
};

const selectSlot = (startsAt: string) => {
  selectedSlotId.value = startsAt;
  localError.value = "";
  apiErrors.value = {};
};

const rescheduleMutation = useMutation({
  mutationFn: (slot: PublicScheduleSlot) =>
    reschedulesApi.create(client, props.booking.id, {
      email: props.email,
      starts_at: slot.starts_at,
      ends_at: slot.ends_at,
    }),
  onSuccess: () => {
    open.value = false;
    toast.success("New time proposed", {
      description: "The meeting stays unchanged until everyone accepts.",
    });
  },
  onError: (error) => {
    apiErrors.value = getApiFieldErrors(error);
    toast.error(getApiErrorMessage(error, "Could not propose the new time."));
  },
});

const submit = async () => {
  localError.value = "";
  apiErrors.value = {};

  if (!selectedDate.value || !selectedSlot.value) {
    localError.value = "Choose an available date and time.";
    return;
  }

  if (selectedSlot.value.starts_at === props.booking.starts_at) {
    localError.value = "Choose a different date and time.";
    return;
  }

  rescheduleMutation.mutate(selectedSlot.value);
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-60 bg-black/55 backdrop-blur-xs duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none"
      />
      <DialogContent
        class="fixed inset-s-1/2 top-1/4 z-60 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl outline-none duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 motion-reduce:data-[state=closed]:zoom-out-100 motion-reduce:data-[state=open]:zoom-in-100"
      >
        <header
          class="flex items-start gap-4 border-b border-border px-5 py-5 sm:px-6"
        >
          <div class="min-w-0 flex-1">
            <DialogTitle class="text-lg font-semibold tracking-tight">
              Request a new time
            </DialogTitle>
            <DialogDescription class="mt-1 text-sm text-muted-foreground">
              Pick another available time for
              {{ booking.event?.name ?? "this meeting" }}.
            </DialogDescription>
          </div>
          <DialogClose as-child>
            <SharedButton
              type="button"
              variant="ghost"
              size="icon-sm"
              class="-me-2 -mt-1 shrink-0 text-muted-foreground"
              aria-label="Close reschedule dialog"
            >
              <HugeiconsIcon
                :icon="Cancel01Icon"
                :size="18"
                :stroke-width="1.75"
                aria-hidden="true"
              />
            </SharedButton>
          </DialogClose>
        </header>

        <div class="min-h-0 overflow-y-auto p-5 sm:p-6">
          <UiBookingsAvailabilityPicker
            :selected-date="selectedDate"
            :selected-slot="selectedSlotId"
            :slots="availableSlots"
            :timezone="availableTimesQuery.data.value?.timezone ?? timezone"
            :loading="availableTimesQuery.isFetching.value"
            :load-error="availableTimesQuery.isError.value"
            :error="fieldError"
            @retry="availableTimesQuery.refetch()"
            @select-date="selectDate"
            @select-slot="selectSlot"
          />
        </div>

        <footer
          class="flex justify-end gap-2 border-t border-border px-5 py-4 sm:px-6"
        >
          <DialogClose as-child>
            <SharedButton
              type="button"
              variant="outline"
              :disabled="rescheduleMutation.isPending.value"
            >
              Cancel
            </SharedButton>
          </DialogClose>
          <SharedButton
            type="button"
            :loading="rescheduleMutation.isPending.value"
            :disabled="rescheduleMutation.isPending.value"
            @click="submit"
          >
            Propose new time
          </SharedButton>
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
