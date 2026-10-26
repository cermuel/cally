<script setup lang="ts">
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
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
import { getApiErrorMessage, getApiFieldErrors } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";
import {
  teamBookingsApi,
  type CreateTeamBookingPayload,
  type TeamBooking,
  type UpdateTeamBookingPayload,
} from "~/utils/api/team-bookings";
import {
  addMinutesToLocalDateTime,
  toDateTimeLocal,
  zonedDateTimeToIso,
} from "~/utils/team-booking-date";
import { normalizeLinkSlug } from "~/utils/links";
import type { PublicScheduleSlot } from "~/utils/api/public";

const props = defineProps<{
  teamId: number;
  booking?: TeamBooking | null;
  timezone: string;
}>();

const emit = defineEmits<{ completed: [bookingId: number] }>();
const open = defineModel<boolean>("open", { default: false });
const client = useApiClient();
const queryClient = useQueryClient();

const name = ref("");
const description = ref("");
const duration = ref("30");
const selectedDate = ref("");
const selectedSlot = ref("");
const localErrors = ref<Record<string, string>>({});
const apiErrors = ref<Record<string, string[]>>({});

const isEditing = computed(() => !!props.booking);
const bookingQuery = useQuery({
  queryKey: computed(() =>
    queryKeys.teams.booking(props.teamId, props.booking?.id ?? "none"),
  ),
  enabled: computed(
    () =>
      open.value && props.booking !== null && props.booking !== undefined,
  ),
  queryFn: () => teamBookingsApi.get(client, props.teamId, props.booking!.id),
  staleTime: Infinity,
});
const editableBooking = computed(
  () => bookingQuery.data.value?.booking ?? props.booking ?? null,
);
const bookingTimezone = computed(
  () => editableBooking.value?.booking_timezone || props.timezone,
);
const isLoadingBooking = computed(
  () => isEditing.value && bookingQuery.isFetching.value,
);
const timeOptions = Array.from({ length: 24 * 12 }, (_, index) => {
  const hour = Math.floor(index / 12);
  const minute = (index % 12) * 5;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
});
const timeSlots = computed<PublicScheduleSlot[]>(() => {
  if (!selectedDate.value) return [];

  const slots = timeOptions
    .map((time) => {
      const startsAt = `${selectedDate.value}T${time}`;
      return {
        time,
        starts_at: startsAt,
        ends_at: addMinutesToLocalDateTime(startsAt, Number(duration.value)),
      };
    })
    .filter(
      (slot) =>
        new Date(
          zonedDateTimeToIso(slot.starts_at, bookingTimezone.value),
        ).getTime() >
        Date.now(),
    );

  if (
    isEditing.value &&
    selectedSlot.value.startsWith(`${selectedDate.value}T`) &&
    !slots.some((slot) => slot.starts_at === selectedSlot.value)
  ) {
    slots.unshift({
      time: selectedSlot.value.slice(11, 16),
      starts_at: selectedSlot.value,
      ends_at: addMinutesToLocalDateTime(
        selectedSlot.value,
        Number(duration.value),
      ),
    });
  }

  return slots;
});
const fieldError = (field: string) =>
  localErrors.value[field] || apiErrors.value[field]?.[0];

const selectDate = (date: string) => {
  selectedDate.value = date;
  selectedSlot.value = "";
  delete localErrors.value["booking.starts_at"];
};
const selectSlot = (startsAt: string) => {
  selectedSlot.value = startsAt;
  delete localErrors.value["booking.starts_at"];
};

const reset = () => {
  const booking = editableBooking.value;
  const nextHour = new Date();
  nextHour.setMinutes(0, 0, 0);
  nextHour.setHours(nextHour.getHours() + 1);

  name.value = booking?.event?.name ?? "";
  description.value =
    booking?.event?.description ?? props.booking?.event?.description ?? "";
  duration.value = String(booking?.event?.duration_minutes ?? 30);
  const timezone = booking?.booking_timezone || props.timezone;
  const localStart = booking?.starts_at
    ? toDateTimeLocal(booking.starts_at, timezone)
    : toDateTimeLocal(nextHour.toISOString(), timezone);
  selectedDate.value = localStart.slice(0, 10);
  selectedSlot.value = localStart;
  localErrors.value = {};
  apiErrors.value = {};
};

watch(open, (isOpen) => {
  if (isOpen) reset();
});
watch(
  () => bookingQuery.data.value?.booking,
  (booking) => {
    if (open.value && booking) reset();
  },
);
watch(name, () => {
  delete localErrors.value["event.name"];
});
watch(duration, () => {
  delete localErrors.value["event.duration_minutes"];
});

const saveMutation = useMutation({
  mutationFn: (payload: CreateTeamBookingPayload | UpdateTeamBookingPayload) =>
    props.booking
      ? teamBookingsApi.update(client, props.teamId, props.booking.id, payload)
      : teamBookingsApi.create(
          client,
          props.teamId,
          payload as CreateTeamBookingPayload,
        ),
  onSuccess: async (response) => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.teams.bookings(props.teamId),
    });
    apiErrors.value = {};
    open.value = false;
    emit("completed", response.booking.id);
    toast.success(isEditing.value ? "Team meeting updated" : "Team meeting created");
  },
  onError: (error) => {
    apiErrors.value = getApiFieldErrors(error);
    toast.error(
      getApiErrorMessage(
        error,
        isEditing.value
          ? "Could not update the team meeting."
          : "Could not create the team meeting.",
      ),
    );
  },
});

const submit = () => {
  localErrors.value = {};
  apiErrors.value = {};

  const trimmedName = name.value.trim();
  if (!trimmedName) {
    localErrors.value["event.name"] = "Enter a meeting name.";
  }
  if (!Number.isInteger(Number(duration.value)) || Number(duration.value) < 1) {
    localErrors.value["event.duration_minutes"] = "Duration must be at least 1 minute.";
  }
  if (!selectedDate.value || !selectedSlot.value) {
    localErrors.value["booking.starts_at"] = "Choose a start date and time.";
  }
  if (Object.keys(localErrors.value).length) return;

  const startsAt = selectedSlot.value;
  const endsAt = addMinutesToLocalDateTime(
    startsAt,
    Number(duration.value),
  );
  const booking = {
    starts_at: zonedDateTimeToIso(startsAt, bookingTimezone.value),
    ends_at: zonedDateTimeToIso(endsAt, bookingTimezone.value),
    timezone: bookingTimezone.value,
  };

  if (props.booking) {
    saveMutation.mutate({
      event: {
        name: trimmedName,
        duration_minutes: Number(duration.value),
        description: description.value.trim() || null,
      },
      booking,
    });
    return;
  }

  const nameSlug =
    normalizeLinkSlug(normalizeLinkSlug(trimmedName).slice(0, 8)) || "meeting";

  saveMutation.mutate({
    event: {
      name: trimmedName,
      slug: `team-${nameSlug}-${Date.now()}`,
      duration_minutes: Number(duration.value),
      description: description.value.trim() || null,
      status: "published",
    },
    booking,
  });
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-60 bg-black/55 backdrop-blur-xs duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none"
      />
      <DialogContent
        class="fixed inset-s-1/2 top-1/2 z-60 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl outline-none duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 motion-reduce:data-[state=closed]:zoom-out-100 motion-reduce:data-[state=open]:zoom-in-100"
      >
        <header class="flex items-start gap-4 border-b border-border px-5 py-5 sm:px-6">
          <div class="min-w-0 flex-1">
            <DialogTitle class="text-lg font-semibold tracking-tight">
              {{ isEditing ? "Edit team meeting" : "Create team meeting" }}
            </DialogTitle>
            <DialogDescription class="mt-1 text-sm text-muted-foreground">
              {{ isEditing ? "Update the event and meeting details." : "Schedule a private meeting for every team member." }}
            </DialogDescription>
          </div>
          <DialogClose as-child>
            <SharedButton
              type="button"
              variant="ghost"
              size="icon-sm"
              class="-me-2 -mt-1 shrink-0 text-muted-foreground"
              aria-label="Close meeting dialog"
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
          <div
            v-if="isLoadingBooking"
            class="space-y-4"
            aria-label="Loading meeting fields"
          >
            <div class="h-16 animate-pulse rounded-lg bg-muted/60" />
            <div class="h-16 animate-pulse rounded-lg bg-muted/60" />
            <div class="h-44 animate-pulse rounded-lg bg-muted/60" />
          </div>
          <div
            v-else-if="isEditing && bookingQuery.isError.value"
            role="alert"
            class="rounded-lg border border-destructive/30 bg-destructive/5 p-4"
          >
            <p class="text-sm text-destructive">
              {{
                getApiErrorMessage(
                  bookingQuery.error.value,
                  "Could not load the meeting fields.",
                )
              }}
            </p>
            <SharedButton
              type="button"
              variant="outline"
              size="sm"
              class="mt-3"
              @click="bookingQuery.refetch()"
            >
              Try again
            </SharedButton>
          </div>
          <div v-else class="space-y-5">
            <div>
              <SharedLabel for="team-meeting-name" class="mb-1.5 text-sm">
                Name
              </SharedLabel>
              <SharedInput
                id="team-meeting-name"
                v-model="name"
                autocomplete="off"
                placeholder="30 Minute Meeting"
                :error="fieldError('event.name')"
              />
            </div>
            <UiLinksDurationSelect
              id="team-meeting-duration"
              v-model="duration"
              content-class="z-70"
              :error="fieldError('event.duration_minutes')"
            />
            <UiBookingsAvailabilityPicker
              :selected-date="selectedDate"
              :selected-slot="selectedSlot"
              :slots="timeSlots"
              :timezone="bookingTimezone"
              :error="fieldError('booking.starts_at')"
              @select-date="selectDate"
              @select-slot="selectSlot"
            />
            <div>
              <SharedLabel class="mb-1.5 text-sm">
                Description
              </SharedLabel>
              <UiProfileRichTextEditor
                v-model="description"
                aria-label="Meeting description"
                content-class="z-70"
                placeholder="What is this meeting about?"
                :error="fieldError('event.description')"
              />
            </div>
          </div>
        </div>

        <footer class="flex justify-end gap-2 border-t border-border px-5 py-4 sm:px-6">
          <DialogClose as-child>
            <SharedButton type="button" variant="outline" :disabled="saveMutation.isPending.value">Cancel</SharedButton>
          </DialogClose>
          <SharedButton
            type="button"
            :disabled="
              isLoadingBooking ||
              (isEditing && bookingQuery.isError.value)
            "
            :loading="saveMutation.isPending.value"
            @click="submit"
          >
            {{ isEditing ? "Save changes" : "New meeting" }}
          </SharedButton>
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
