<script setup lang="ts">
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  formatPublicDateLabel,
  formatPublicSlotHeading,
  formatPublicTimeRange,
  formatPublicSlotLabel,
  getPublicCalendarDays,
  isSameMonth,
  mapPublicEvent,
  mapPublicProfile,
  toDateKey,
  type PublicBookingStep,
  type PublicEvent,
  type PublicProfile,
} from "~/utils/public-booking";
import { publicApi, type PublicScheduleResponse } from "~/utils/api/public";

const route = useRoute();
const apiClient = useApiClient();
const username = computed(() => String(route.params.username || ""));
const eventSlug = computed(() => String(route.params.event || "15min"));

const profile = ref<PublicProfile | null>(null);
const event = ref<PublicEvent | null>(null);
const bookingError = ref<unknown>(null);
const bookingPending = ref(import.meta.client);

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

    profile.value = mapPublicProfile(profileResponse.user);
    event.value = mapPublicEvent(apiEvent);
  } catch (error) {
    bookingError.value = error;
  } finally {
    bookingPending.value = false;
  }
};

const safeProfile = computed(
  () =>
    profile.value ?? {
      name: username.value,
      email: "",
      username: username.value,
      image: undefined,
      timezone: "UTC",
    },
);
const safeEvent = computed(
  () =>
    event.value ?? {
      id: 0,
      slug: eventSlug.value,
      title: "Meeting",
      durationMinutes: 0,
      durationLabel: "",
      description: "",
    },
);

const step = ref<PublicBookingStep>("slots");
const selectedDate = ref(toDateKey(new Date()));
const activeMonth = ref(
  new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12),
);
const selectedTime = ref("");
const attendeeName = ref("Samuel Ngene");
const attendeeEmail = ref("samuelobasi2005@gmail.com");
const notes = ref("");
const guests = ref<string[]>([]);

const activeMonthKey = computed(() => toDateKey(activeMonth.value).slice(0, 7));
const scheduleData = ref<PublicScheduleResponse | null>(null);
const schedulePending = ref(false);

const loadSchedule = async () => {
  if (!event.value) {
    scheduleData.value = null;
    return;
  }

  schedulePending.value = true;

  try {
    scheduleData.value = await publicApi.schedule(
      apiClient,
      event.value.id,
      activeMonthKey.value,
    );
  } finally {
    schedulePending.value = false;
  }
};

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

const calendarDays = computed(() =>
  getPublicCalendarDays(activeMonth.value, availableDates.value),
);

const availableDatesInActiveMonth = computed(() =>
  Array.from(availableDates.value)
    .filter((dateKey) => isSameMonth(dateKey, activeMonth.value))
    .sort(),
);

const selectedDateIsInActiveMonth = computed(() =>
  isSameMonth(selectedDate.value, activeMonth.value),
);

const selectedDateLabel = computed(() =>
  formatPublicDateLabel(selectedDate.value),
);

const selectedSlotHeading = computed(() =>
  selectedDateIsInActiveMonth.value
    ? formatPublicSlotHeading(selectedDate.value)
    : "Select a date",
);

const selectedTimeRange = computed(() =>
  formatPublicTimeRange(
    selectedDate.value,
    selectedTime.value,
    safeEvent.value.durationMinutes,
  ),
);

const scheduledWhenLabel = computed(
  () => `${selectedDateLabel.value}\n${selectedTimeRange.value}`,
);

const slots = computed(() =>
  (scheduleData.value?.schedules[selectedDate.value] ?? []).map((slot) =>
    formatPublicSlotLabel(slot.time),
  ),
);

const selectedDateHasSlots = computed(() => slots.value.length > 0);

const selectDate = (dateKey: string) => {
  if (!availableDates.value.has(dateKey)) {
    return;
  }

  selectedDate.value = dateKey;
  selectedTime.value = "";
};

const moveMonth = (amount: number) => {
  const nextMonth = new Date(activeMonth.value);
  nextMonth.setMonth(nextMonth.getMonth() + amount, 1);
  activeMonth.value = nextMonth;
};

const chooseSlot = (slot: string) => {
  selectedTime.value = slot;
  step.value = "details";
};

watch(
  scheduleData,
  () => {
    const nextSelectedDate =
      availableDatesInActiveMonth.value[0] || toDateKey(activeMonth.value);

    if (!availableDates.value.has(selectedDate.value)) {
      selectedDate.value = nextSelectedDate;
      selectedTime.value = "";
    }
  },
  { immediate: true },
);

if (import.meta.client) {
  watch([username, eventSlug], loadBookingData, { immediate: true });
  watch([event, activeMonthKey], loadSchedule, { immediate: true });
}

useHead(() => ({
  title:
    event.value && profile.value
      ? `${event.value.title} with ${profile.value.name}`
      : "Book a meeting | Cally",
}));
</script>

<template>
  <main class="min-h-screen bg-[#101010] text-foreground antialiased">
    <NuxtLink
      v-if="step === 'scheduled'"
      :to="`/${username}`"
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
      class="mx-auto flex min-h-screen w-full max-w-200 items-center px-5 py-14 text-center sm:px-8"
    >
      <SharedCard class="w-full border-white/10 bg-[#171717] p-8">
        <h1 class="text-2xl font-bold tracking-normal text-white">
          This booking page is unavailable
        </h1>
        <p class="mt-3 text-sm leading-6 text-muted-foreground">
          The event may have moved, been unpublished, or no longer exists.
        </p>
        <SharedButton as-child class="mt-6">
          <NuxtLink :to="`/${username}`"> Back to profile </NuxtLink>
        </SharedButton>
      </SharedCard>
    </section>

    <section
      v-else-if="step === 'slots'"
      class="mx-auto flex h-dvh w-full max-w-260 flex-col items-stretch justify-start overflow-hidden md:items-center md:justify-center md:px-5 md:py-20"
    >
      <SharedCard
        class="mx-auto grid h-full w-full md:max-h-120 max-w-200 grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-xl border-white/10 bg-[#171717] py-0 shadow-[inset_0_1px_0_oklch(1_0_0/0.02)] max-md:rounded-none max-md:border-none"
      >
        <div class="border-b border-white/10 p-4 md:p-6">
          <UiPublicEventSummary
            :host-name="safeProfile.name"
            :host-image="safeProfile.image"
            :title="safeEvent.title"
            :description="safeEvent.description"
            :duration-label="safeEvent.durationLabel"
          />
        </div>

        <div
          class="grid min-h-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] md:grid-cols-3 md:grid-rows-1"
        >
          <UiPublicCalendarSkeleton
            v-if="schedulePending"
            class="md:col-span-2"
          />
          <UiPublicBookingCalendar
            v-else
            :days="calendarDays"
            :month-label="monthLabel"
            :selected-date="selectedDate"
            :selected-date-is-in-active-month="selectedDateIsInActiveMonth"
            @previous="moveMonth(-1)"
            @next="moveMonth(1)"
            @select="selectDate"
            class="md:col-span-2"
          />

          <UiPublicTimeSlotsSkeleton v-if="schedulePending" />
          <UiPublicTimeSlots
            v-else
            :heading="selectedSlotHeading"
            :slots="slots"
            :disabled="!selectedDateHasSlots"
            @choose="chooseSlot"
          />
        </div>
      </SharedCard>
    </section>

    <section
      v-else-if="step === 'details'"
      class="mx-auto flex h-dvh w-full max-w-260 flex-col items-stretch justify-start overflow-hidden md:items-center md:justify-center md:px-5 md:py-20"
    >
      <SharedCard
        class="mx-auto grid h-full w-full max-w-220 md:max-h-140 grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-lg border-white/10 bg-[#171717] py-0 shadow-[inset_0_1px_0_oklch(1_0_0/0.02)] max-md:rounded-none max-md:border-none"
      >
        <div class="border-b border-white/10 p-4 md:p-6">
          <UiPublicEventSummary
            :host-name="safeProfile.name"
            :host-image="safeProfile.image"
            :title="safeEvent.title"
            :description="safeEvent.description"
            :duration-label="safeEvent.durationLabel"
          />
        </div>
        <div
          class="grid min-h-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] md:grid-cols-3 md:grid-rows-1"
        >
          <UiPublicBookingDetailsForm
            v-model:attendee-name="attendeeName"
            v-model:attendee-email="attendeeEmail"
            v-model:notes="notes"
            class="border-b border-white/10 md:col-span-2 md:border-b-0 md:border-r"
            @back="step = 'slots'"
            @confirm="step = 'scheduled'"
          />

          <UiPublicBookingDetails
            v-model:guests="guests"
            :selected-date-label="selectedDateLabel"
            :selected-time-label="selectedTimeRange"
            class="border-b border-white/10 md:border-b-0"
          />
        </div>
      </SharedCard>
    </section>

    <UiPublicScheduledCard
      v-else
      :attendee-email="attendeeEmail"
      :attendee-name="attendeeName"
      :event="safeEvent"
      :guests="guests"
      :profile="safeProfile"
      :scheduled-when-label="scheduledWhenLabel"
      :username="username"
      @reschedule="step = 'slots'"
    />
  </main>
</template>
