<script setup lang="ts">
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  publicApi,
  type PublicApiEvent,
  type PublicApiUser,
  type PublicScheduleResponse,
} from "~/utils/api/public";
import { bookingsApi } from "~/utils/api/bookings";
import {
  getApiErrorMessage,
  getApiFieldErrors,
  type ApiError,
} from "~/utils/api/client";

type BookingStep = "slots" | "details" | "scheduled";

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (dateKey: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00`));

const formatSlotHeading = (dateKey: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
  })
    .format(new Date(`${dateKey}T12:00:00`))
    .replace(",", "");

const formatTimeRange = (
  dateKey: string,
  selectedTime: string,
  durationMinutes: number,
) => {
  const [hour = 0, minute = 0] = selectedTime.split(":").map(Number);
  const start = new Date(
    `${dateKey}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
  );
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${formatter.format(start).toLowerCase()} - ${formatter.format(end).toLowerCase()}`;
};

const formatSlotLabel = (time: string) => {
  const [hour = 0, minute = 0] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date).toLowerCase();
};

const addMinutesToTime = (time: string, minutesToAdd: number) => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  return `${String(Math.floor(totalMinutes / 60) % 24).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
};

const route = useRoute();
const apiClient = useApiClient();
const username = computed(() => String(route.params.username || ""));
const eventSlug = computed(() => String(route.params.event || "15min"));

const isEmbed = computed(() =>
  ["true", "1"].includes(String(route.query.embed)),
);
const profilePath = computed(() => ({
  path: `/${username.value}`,
  query: isEmbed.value ? { embed: "true" } : undefined,
}));

const profile = ref<PublicApiUser | null>(null);
const event = ref<PublicApiEvent | null>(null);
const bookingError = ref<unknown>(null);
const bookingPending = ref(true);

const loadBookingData = async () => {
  bookingPending.value = true;
  bookingError.value = null;
  profile.value = null;
  event.value = null;

  try {
    const [profileResponse, eventsResponse] = await Promise.all([
      publicApi.profile(apiClient, username.value),
      publicApi.events(apiClient, username.value),
    ]);
    const apiEvent = eventsResponse.events.find(
      (item) => item.slug === eventSlug.value,
    );

    if (!apiEvent) {
      throw createError({
        statusCode: 404,
        statusMessage: "Event not found",
      });
    }

    profile.value = profileResponse.user;
    event.value = apiEvent;
  } catch (error) {
    bookingError.value = error;
  } finally {
    bookingPending.value = false;
  }
};

const step = ref<BookingStep>("slots");
const selectedDate = ref("");
const activeMonth = ref(
  new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12),
);
const selectedTime = ref("");
const attendeeName = ref("");
const attendeeEmail = ref("");
const notes = ref("");
const guests = ref<string[]>([]);
const scheduleErrors = ref<Record<string, string[]>>({});
const scheduleError = ref("");
const scheduleSubmitting = ref(false);

const activeMonthKey = computed(() => toDateKey(activeMonth.value).slice(0, 7));
const scheduleData = ref<PublicScheduleResponse | null>(null);
const schedulePending = ref(false);
let scheduleRequest = 0;

const loadSchedule = async () => {
  const request = ++scheduleRequest;

  if (!event.value) {
    scheduleData.value = null;
    schedulePending.value = false;
    return;
  }

  const { id } = event.value;
  schedulePending.value = true;

  try {
    const data = await publicApi.schedule(apiClient, id, activeMonthKey.value);
    if (request === scheduleRequest) {
      scheduleData.value = data;

      const availableDateKeys = Object.entries(data.schedules)
        .filter(
          ([dateKey, slots]) =>
            dateKey.startsWith(activeMonthKey.value) && slots.length > 0,
        )
        .map(([dateKey]) => dateKey)
        .sort();
      const today = toDateKey(new Date());
      const isCurrentMonth = activeMonthKey.value === today.slice(0, 7);

      selectedDate.value =
        isCurrentMonth && availableDateKeys.includes(today)
          ? today
          : (availableDateKeys[0] ?? "");
      selectedTime.value = "";
    }
  } catch {
    if (request === scheduleRequest) {
      scheduleData.value = null;
      selectedDate.value = "";
      selectedTime.value = "";
    }
  } finally {
    if (request === scheduleRequest) schedulePending.value = false;
  }
};

const calendarLoading = computed(
  () => bookingPending.value || schedulePending.value,
);

const monthLabel = computed(() =>
  new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(activeMonth.value),
);

const availableDates = computed(
  () =>
    new Set(
      Object.entries(scheduleData.value?.schedules ?? {})
        .filter(([, slots]) => slots.length > 0)
        .map(([dateKey]) => dateKey),
    ),
);

const calendarDays = computed(() => {
  const year = activeMonth.value.getFullYear();
  const month = activeMonth.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: firstDay.getDay() }, (_, index) => ({
    key: `blank-${year}-${month}-${index}`,
    day: "",
    muted: true,
    available: false,
    today: false,
  }));
  const days = Array.from({ length: lastDay }, (_, index) => {
    const key = toDateKey(new Date(year, month, index + 1));
    return {
      key,
      day: String(index + 1),
      muted: false,
      available: availableDates.value.has(key),
      today: key === toDateKey(new Date()),
    };
  });
  return [...blanks, ...days];
});

const selectedDateLabel = computed(() =>
  formatDateLabel(selectedDate.value),
);

const selectedSlotHeading = computed(() =>
  selectedDate.value ? formatSlotHeading(selectedDate.value) : "",
);

const selectedTimeRange = computed(() =>
  formatTimeRange(
    selectedDate.value,
    selectedTime.value,
    event.value?.duration_minutes ?? 0,
  ),
);

const scheduledWhenLabel = computed(
  () => `${selectedDateLabel.value}\n${selectedTimeRange.value}`,
);

const slots = computed(() =>
  (scheduleData.value?.schedules[selectedDate.value] ?? []).map((slot) => ({
    value: slot.time.slice(0, 5),
    label: formatSlotLabel(slot.time),
  })),
);

const showSlots = computed(
  () =>
    !calendarLoading.value && !!selectedDate.value && slots.value.length > 0,
);

const slotsPanel = ref<{ $el: HTMLElement } | null>(null);

const selectDate = async (dateKey: string) => {
  if (!availableDates.value.has(dateKey)) {
    return;
  }

  selectedDate.value = dateKey;
  selectedTime.value = "";

  await nextTick();
  if (window.matchMedia("(max-width: 767px)").matches) {
    slotsPanel.value?.$el.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }
};

const moveMonth = (amount: number) => {
  const nextMonth = new Date(activeMonth.value);
  nextMonth.setMonth(nextMonth.getMonth() + amount, 1);
  activeMonth.value = nextMonth;
  selectedDate.value = "";
  selectedTime.value = "";
};

const chooseSlot = (slot: { label: string; value: string }) => {
  selectedTime.value = slot.value;
  step.value = "details";
};

const scheduleBooking = async () => {
  if (!event.value || !selectedDate.value || !selectedTime.value) return;

  scheduleSubmitting.value = true;
  scheduleErrors.value = {};
  scheduleError.value = "";

  const additionalGuests = guests.value
    .map((email) => email.trim())
    .filter(Boolean)
    .filter((email, index, list) =>
      email.toLowerCase() !== attendeeEmail.value.trim().toLowerCase()
      && list.findIndex((item) => item.toLowerCase() === email.toLowerCase()) === index,
    );

  try {
    await bookingsApi.schedule(apiClient, {
      username: username.value,
      event_id: String(event.value.id),
      date: selectedDate.value,
      starts_at: selectedTime.value,
      ends_at: addMinutesToTime(selectedTime.value, event.value.duration_minutes),
      notes: notes.value.trim() || null,
      guests: [
        {
          name: attendeeName.value.trim(),
          email: attendeeEmail.value.trim(),
          attendance_status: "confirmed",
        },
        ...additionalGuests.map((email) => ({ email })),
      ],
    });

    step.value = "scheduled";
  } catch (error) {
    const apiError = error as ApiError;
    scheduleErrors.value = getApiFieldErrors(error);
    scheduleError.value = getApiErrorMessage(error, "Could not schedule this meeting.");

    if (apiError.response?.status === 409) {
      step.value = "slots";
      await loadSchedule();
    }
  } finally {
    scheduleSubmitting.value = false;
  }
};

const clearScheduleError = (field: string) => {
  if (!(field in scheduleErrors.value)) return;

  const nextErrors = { ...scheduleErrors.value };
  delete nextErrors[field];
  scheduleErrors.value = nextErrors;
};

if (import.meta.client) {
  watch([username, eventSlug], loadBookingData, { immediate: true });
  watch([event, activeMonthKey], loadSchedule, { immediate: true });
}

const root = ref<HTMLElement | null>(null);
let resizeObserver: ResizeObserver | undefined;

onMounted(() => {
  if (!isEmbed.value || window.parent === window || !root.value) return;
  const el = root.value;
  const postHeight = () =>
    window.parent.postMessage(
      { source: "cally", type: "resize", height: el.offsetHeight },
      "*",
    );
  resizeObserver = new ResizeObserver(postHeight);
  resizeObserver.observe(el);
  postHeight();
});
onBeforeUnmount(() => resizeObserver?.disconnect());

useHead(() => ({
  title:
    event.value && profile.value
      ? `${event.value.name} with ${profile.value.name}`
      : "Book a meeting | Cally",
  htmlAttrs: { style: isEmbed.value ? "background:transparent" : undefined },
  bodyAttrs: { style: isEmbed.value ? "background:transparent" : undefined },
}));
</script>

<template>
  <main
    ref="root"
    class="text-foreground antialiased"
    :class="isEmbed ? 'bg-transparent' : 'h-dvh overflow-hidden bg-[#101010]'"
  >
    <NuxtLink
      v-if="step === 'scheduled' && !isEmbed"
      :to="profilePath"
      class="fixed left-8 top-6 inline-flex items-center gap-2 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <HugeiconsIcon
        :icon="ArrowLeft01Icon"
        :size="20"
        color="currentColor"
        :stroke-width="1.75"
      />
      Back to bookings
    </NuxtLink>

    <section
      v-if="bookingError"
      class="mx-auto flex w-full max-w-200 items-center px-5 py-14 text-center sm:px-8"
      :class="isEmbed ? '' : 'min-h-dvh'"
    >
      <SharedCard class="w-full border-white/10 bg-[#171717] p-8">
        <h1 class="text-2xl font-bold tracking-normal text-white">
          This booking page is unavailable
        </h1>
        <p class="mt-3 text-sm leading-6 text-muted-foreground">
          The event may have moved, been unpublished, or no longer exists.
        </p>
        <SharedButton as-child class="mt-6">
          <NuxtLink :to="profilePath"> Back to profile </NuxtLink>
        </SharedButton>
      </SharedCard>
    </section>

    <section
      v-else-if="step !== 'scheduled'"
      class="mx-auto flex h-full w-full max-w-240 justify-center overflow-hidden md:px-5 lg:px-0"
      :class="
        isEmbed
          ? 'py-1'
          : 'items-stretch max-md:bg-[#171717] md:items-center md:py-16'
      "
    >
      <SharedCard
        class="grid h-full w-full grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-xl border-white/10 bg-[#171717] py-0 shadow-[inset_0_1px_0_oklch(1_0_0/0.02)] max-md:rounded-none max-md:border-none md:h-120 md:grid-cols-[17rem_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)]"
      >
        <UiPublicEventSummary
          :host-name="profile?.name ?? username"
          :host-image="profile?.avatar ?? undefined"
          :title="event?.name ?? 'Meeting'"
          :description="event?.description ?? ''"
          :duration-label="event ? `${event.duration_minutes}m` : ''"
          :loading="bookingPending"
          :hide-description-on-mobile="step === 'details'"
          class="border-b border-white/10 p-4 md:min-h-0 md:border-b-0 md:border-r md:p-6"
        />

        <div
          v-if="step === 'slots'"
          class="grid min-h-0 grid-cols-1 overflow-hidden md:grid-rows-[minmax(0,1fr)]"
          :class="
            showSlots
              ? 'grid-rows-[auto_minmax(0,1fr)] md:grid-cols-[27rem_minmax(0,1fr)]'
              : 'grid-rows-1'
          "
        >
          <UiPublicCalendarSkeleton v-if="calendarLoading" />
          <UiPublicBookingCalendar
            v-else
            :days="calendarDays"
            :month-label="monthLabel"
            :selected-date="selectedDate"
            :no-availability="availableDates.size === 0"
            @previous="moveMonth(-1)"
            @next="moveMonth(1)"
            @select="selectDate"
          />

          <Transition
            enter-active-class="transition duration-200 ease-out motion-reduce:transition-none"
            enter-from-class="opacity-0 md:translate-x-2"
          >
            <UiPublicTimeSlots
              v-if="showSlots"
              ref="slotsPanel"
              :heading="selectedSlotHeading"
              :slots="slots"
              class="border-t border-white/10 md:border-l md:border-t-0"
              @choose="chooseSlot"
            />
          </Transition>
        </div>

        <div
          v-else
          class="grid min-h-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden md:grid-cols-[27rem_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)]"
        >
          <UiPublicBookingDetailsForm
            v-model:attendee-name="attendeeName"
            v-model:attendee-email="attendeeEmail"
            v-model:notes="notes"
            :errors="scheduleErrors"
            :error="scheduleError"
            :submitting="scheduleSubmitting"
            class="border-b border-white/10 md:min-h-0 md:overflow-y-auto md:border-b-0 md:border-r"
            @back="step = 'slots'"
            @clear-error="clearScheduleError"
            @confirm="scheduleBooking"
          />

          <UiPublicBookingDetails
            v-model:guests="guests"
            :selected-date-label="selectedDateLabel"
            :selected-time-label="selectedTimeRange"
            :errors="scheduleErrors"
            class="min-h-0"
          />
        </div>
      </SharedCard>
    </section>

    <UiPublicScheduledCard
      v-else-if="event && profile"
      :attendee-email="attendeeEmail"
      :attendee-name="attendeeName"
      :event="event"
      :guests="guests"
      :profile="profile"
      :scheduled-when-label="scheduledWhenLabel"
      :username="username"
      :class="isEmbed ? 'h-auto! py-4!' : ''"
      @reschedule="step = 'slots'"
    />
  </main>
</template>
