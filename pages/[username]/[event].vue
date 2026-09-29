<script setup lang="ts">
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  formatPublicDateLabel,
  formatPublicSlotHeading,
  formatPublicTimeRange,
  formatPublicSlotLabel,
  getPublicCalendarDays,
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

const isEmbed = computed(() =>
  ["true", "1"].includes(String(route.query.embed)),
);
const profilePath = computed(() => ({
  path: `/${username.value}`,
  query: isEmbed.value ? { embed: "true" } : undefined,
}));

const profile = ref<PublicProfile | null>(null);
const event = ref<PublicEvent | null>(null);
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
      description: null,
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
const selectedDate = ref("");
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

const calendarDays = computed(() =>
  getPublicCalendarDays(activeMonth.value, availableDates.value),
);

const selectedDateLabel = computed(() =>
  formatPublicDateLabel(selectedDate.value),
);

const selectedSlotHeading = computed(() =>
  selectedDate.value ? formatPublicSlotHeading(selectedDate.value) : "",
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

const chooseSlot = (slot: string) => {
  selectedTime.value = slot;
  step.value = "details";
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
      ? `${event.value.title} with ${profile.value.name}`
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
          :host-name="safeProfile.name"
          :host-image="safeProfile.image"
          :title="safeEvent.title"
          :description="safeEvent.description"
          :duration-label="safeEvent.durationLabel"
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
            class="border-b border-white/10 md:min-h-0 md:overflow-y-auto md:border-b-0 md:border-r"
            @back="step = 'slots'"
            @confirm="step = 'scheduled'"
          />

          <UiPublicBookingDetails
            v-model:guests="guests"
            :selected-date-label="selectedDateLabel"
            :selected-time-label="selectedTimeRange"
            class="min-h-0"
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
      :class="isEmbed ? 'h-auto! py-4!' : ''"
      @reschedule="step = 'slots'"
    />
  </main>
</template>
