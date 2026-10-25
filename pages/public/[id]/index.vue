<script setup lang="ts">
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  MoreHorizontalIcon,
  RefreshIcon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { toast } from "vue-sonner";
import {
  bookingsApi,
  type Booking,
  type BookingGuest,
} from "~/utils/api/bookings";
import { getApiErrorMessage } from "~/utils/api/client";
import { guestsApi } from "~/utils/api/guests";
import {
  recurrencesApi,
  type Recurrence,
} from "~/utils/api/recurrences";

const route = useRoute();
const client = useApiClient();
const meetingId = computed(() => Number(route.params.id));
const attendeeEmail = computed(() =>
  typeof route.query.email === "string" ? route.query.email.trim() : "",
);
const recurrenceId = computed(() => {
  const value = route.query.recurrence_id;
  const rawId = Array.isArray(value) ? value[0] : value;
  if (!rawId || !/^\d+$/.test(rawId)) return null;
  const id = Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
});
const hasRecurrenceQuery = computed(
  () => route.query.recurrence_id !== undefined,
);
const meeting = ref<Booking | null>(null);
const invitedGuest = ref<BookingGuest | null>(null);
const recurrence = ref<Recurrence | null>(null);
const loading = ref(true);
const loadError = ref("");
const actionPending = ref(false);
const addGuestsOpen = ref(false);
const cancelDialogOpen = ref(false);
const rescheduleDialogOpen = ref(false);
const actionsOpen = ref(false);

const contentRef = ref<HTMLElement | null>(null);
const cardHeight = ref<number | null>(null);
let observer: ResizeObserver | null = null;

onMounted(() => {
  if (!contentRef.value) return;
  observer = new ResizeObserver(([entry]) => {
    if (!entry) return;
    cardHeight.value = entry.target.getBoundingClientRect().height;
  });
  observer.observe(contentRef.value);
});

onBeforeUnmount(() => observer?.disconnect());

const attendee = computed<BookingGuest | undefined>(
  () => invitedGuest.value ?? undefined,
);
const cancelled = computed(
  () =>
    meeting.value?.status === "cancelled" ||
    attendee.value?.attendance_status === "cancelled",
);
const statusLabel = computed(() => {
  if (cancelled.value) return "Not attending";
  if (meeting.value?.status === "pending") return "Awaiting host";
  if (meeting.value?.status === "completed") return "Completed";
  return "Confirmed";
});

const loadMeeting = async () => {
  loading.value = true;
  loadError.value = "";

  if (
    !Number.isInteger(meetingId.value) ||
    meetingId.value <= 0 ||
    !attendeeEmail.value ||
    (hasRecurrenceQuery.value && recurrenceId.value === null)
  ) {
    loadError.value = "This meeting link is incomplete or invalid.";
    loading.value = false;
    return;
  }

  try {
    const [response, guestResponse, recurrenceResponse] = await Promise.all([
      bookingsApi.details(client, meetingId.value),
      guestsApi.byEmail(client, meetingId.value, attendeeEmail.value),
      recurrenceId.value
        ? recurrencesApi.getPublic(
            client,
            recurrenceId.value,
            attendeeEmail.value,
          )
        : Promise.resolve(null),
    ]);
    const booking = response.booking;
    if (!booking) throw new Error("Booking not found");
    meeting.value = booking;
    invitedGuest.value = guestResponse.guests;
    recurrence.value = recurrenceResponse?.recurrence ?? null;
  } catch (error) {
    meeting.value = null;
    invitedGuest.value = null;
    recurrence.value = null;
    loadError.value = getApiErrorMessage(error, "Could not load this meeting.");
  } finally {
    loading.value = false;
  }
};

watch([meetingId, attendeeEmail, recurrenceId, hasRecurrenceQuery], loadMeeting, {
  immediate: true,
});

const calendarUrl = computed(() => {
  if (!meeting.value?.starts_at || !meeting.value.ends_at) return "";
  const toGoogleCalendarDate = (value: string) =>
    new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.000/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: meeting.value.event?.name ?? `Booking #${meeting.value.id}`,
    dates: `${toGoogleCalendarDate(meeting.value.starts_at)}/${toGoogleCalendarDate(meeting.value.ends_at)}`,
    details: `Meeting hosted by ${meeting.value.host?.name ?? "Host"} via Cally`,
    location: meeting.value.meeting_url ?? "Meeting link to follow",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
});

const addGuests = async (emails: string[]) => {
  if (!meeting.value) return;
  actionPending.value = true;
  try {
    await guestsApi.add(
      client,
      meeting.value.id,
      emails.map((email) => ({ email })),
    );
    await loadMeeting();
    addGuestsOpen.value = false;
    toast.success(`${emails.length === 1 ? "Guest" : "Guests"} added`);
  } catch (error) {
    toast.error(getApiErrorMessage(error, "Could not add the guests."));
  } finally {
    actionPending.value = false;
  }
};

const cancelAttendance = async () => {
  if (!attendee.value) return;
  actionPending.value = true;
  try {
    await guestsApi.update(
      client,
      attendee.value.id,
      { attendance_status: "cancelled" },
      recurrence.value ? attendeeEmail.value : undefined,
    );
    await loadMeeting();
    cancelDialogOpen.value = false;
    toast.success(
      recurrence.value ? "Series attendance cancelled" : "Attendance cancelled",
    );
  } catch (error) {
    toast.error(getApiErrorMessage(error, "Could not cancel your attendance."));
  } finally {
    actionPending.value = false;
  }
};

useHead(() => ({
  title: meeting.value
    ? `${meeting.value.event?.name ?? `Booking #${meeting.value.id}`}`
    : "Meeting",
}));
</script>

<template>
  <main
    class="grid min-h-dvh place-items-center bg-background px-4 py-8 text-sm text-foreground antialiased"
  >
    <section class="w-full max-w-sm">
      <NuxtLink
        to="/"
        class="mx-auto mb-5 flex w-fit items-center gap-2 transition-colors text-foreground"
      >
        <img src="/logo.png" alt="" class="size-7 rounded" aria-hidden="true" />
        <span class="font-medium text-[17px]">Cally</span>
      </NuxtLink>

      <SharedCard
        class="overflow-hidden rounded-xl py-0 text-center shadow-sm transition-[height] duration-300 ease-out motion-reduce:transition-none"
        :style="cardHeight === null ? undefined : { height: `${cardHeight}px` }"
      >
        <div ref="contentRef">
          <div
            v-if="loading"
            class="animate-pulse motion-reduce:animate-none"
            role="status"
            aria-busy="true"
            aria-label="Loading meeting"
          >
            <div class="flex flex-col items-center gap-1.5 p-5">
              <div class="h-3 w-20 rounded bg-muted" />
              <div class="h-4 w-48 rounded bg-muted" />
              <div class="h-3 w-28 rounded bg-muted" />
            </div>

            <div class="space-y-3 border-t p-5">
              <div v-for="i in 3" :key="i" class="flex items-center gap-3">
                <div class="size-4 shrink-0 rounded bg-muted" />
                <div
                  class="h-3 rounded bg-muted"
                  :class="i === 2 ? 'w-40' : 'w-52'"
                />
              </div>
            </div>

            <div class="space-y-2 border-t p-5">
              <div class="h-9 w-full rounded-md bg-muted" />
              <div class="h-9 w-full rounded-md bg-muted" />
              <div class="mx-auto h-7 w-20 rounded-md bg-muted" />
            </div>
          </div>

          <div v-else-if="loadError || !meeting" class="p-6">
            <h1 class="font-medium">Meeting unavailable</h1>
            <p class="mt-1 text-muted-foreground">{{ loadError }}</p>
          </div>

          <template v-else>
            <header class="relative flex flex-col items-center gap-1.5 p-5">
              <SharedPopover
                v-if="!cancelled && attendee"
                v-model:open="actionsOpen"
              >
                <SharedPopoverTrigger as-child>
                  <SharedButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="absolute inset-e-2 top-2 size-8 rounded-full text-muted-foreground"
                    aria-label="More meeting options"
                  >
                    <HugeiconsIcon
                      :icon="MoreHorizontalIcon"
                      :size="16"
                      :stroke-width="1.75"
                    />
                  </SharedButton>
                </SharedPopoverTrigger>
                <SharedPopoverContent align="end" class="w-52 p-1">
                  <button
                    v-if="!recurrence"
                    type="button"
                    class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-accent"
                    @click="
                      actionsOpen = false;
                      rescheduleDialogOpen = true;
                    "
                  >
                    <HugeiconsIcon
                      :icon="RefreshIcon"
                      :size="15"
                      :stroke-width="1.75"
                      aria-hidden="true"
                    />
                    Request a new time
                  </button>
                  <button
                    type="button"
                    class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10"
                    @click="
                      actionsOpen = false;
                      cancelDialogOpen = true;
                    "
                  >
                    <HugeiconsIcon
                      :icon="Cancel01Icon"
                      :size="15"
                      :stroke-width="1.75"
                      aria-hidden="true"
                    />
                    {{
                      recurrence
                        ? "Cancel attendance for series"
                        : "Cancel my attendance"
                    }}
                  </button>
                </SharedPopoverContent>
              </SharedPopover>

              <p
                class="flex items-center gap-1.5 text-xs font-medium"
                :class="
                  cancelled
                    ? 'text-destructive'
                    : 'text-emerald-600 dark:text-emerald-400'
                "
              >
                <HugeiconsIcon
                  :icon="cancelled ? Cancel01Icon : CheckmarkCircle02Icon"
                  :size="14"
                  :stroke-width="1.75"
                  aria-hidden="true"
                />
                {{ statusLabel }}
              </p>
              <h1 class="text-balance font-semibold">
                {{ meeting.event?.name ?? `Booking #${meeting.id}` }}
              </h1>
              <p class="text-xs text-muted-foreground">
                with {{ meeting.host?.name ?? "Host" }}
              </p>
              <p
                v-if="recurrence"
                class="text-xs font-medium text-foreground/80"
              >
                Recurring series
              </p>
            </header>

            <UiPublicRecurrenceSummary
              v-if="recurrence"
              :recurrence="recurrence"
            />
            <UiPublicMeetingDetails :booking="meeting" />

            <footer class="border-t p-5">
              <div v-if="!cancelled" class="flex flex-col gap-2">
                <SharedButton
                  v-if="meeting.meeting_url"
                  as-child
                  class="w-full"
                >
                  <a
                    :href="meeting.meeting_url"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <HugeiconsIcon
                      :icon="Video01Icon"
                      :size="16"
                      :stroke-width="1.75"
                      aria-hidden="true"
                    />
                    Join meeting
                  </a>
                </SharedButton>
                <SharedButton
                  v-if="calendarUrl && !recurrence"
                  as-child
                  class="w-full"
                >
                  <a
                    :href="calendarUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Add to calendar
                  </a>
                </SharedButton>
                <SharedButton
                  v-if="!recurrence"
                  type="button"
                  variant="ghost"
                  size="sm"
                  class="w-full text-muted-foreground"
                  :disabled="actionPending"
                  @click="addGuestsOpen = true"
                >
                  Add guests
                </SharedButton>
              </div>
              <p v-else class="text-xs text-muted-foreground">
                {{
                  recurrence
                    ? "You're no longer attending this series. The host has been notified."
                    : "You're no longer attending. The host has been notified."
                }}
              </p>
            </footer>
          </template>
        </div>
      </SharedCard>
    </section>

    <UiPublicAddGuestsDialog v-model:open="addGuestsOpen" @add="addGuests" />
    <UiPublicRescheduleDialog
      v-if="meeting"
      v-model:open="rescheduleDialogOpen"
      :booking="meeting"
      :email="attendeeEmail"
    />
    <UiPublicConfirmationDialog
      v-model:open="cancelDialogOpen"
      :title="
        recurrence ? 'Cancel the entire series?' : 'Cancel your attendance?'
      "
      :description="
        recurrence
          ? `You'll be removed from every occurrence in this series.`
          : `The host will be told you can't make it.`
      "
      :confirm-label="
        recurrence ? 'Cancel series attendance' : 'Cancel attendance'
      "
      destructive
      @confirm="cancelAttendance"
    />
  </main>
</template>
