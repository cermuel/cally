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

const route = useRoute();
const client = useApiClient();
const meetingId = computed(() => Number(route.params.id));
const attendeeEmail = computed(() =>
  typeof route.query.email === "string" ? route.query.email.trim() : "",
);
const meeting = ref<Booking | null>(null);
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

const attendee = computed<BookingGuest | undefined>(() =>
  meeting.value?.guests?.find(
    (guest) => guest.email.toLowerCase() === attendeeEmail.value.toLowerCase(),
  ),
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
    !attendeeEmail.value
  ) {
    loadError.value = "This meeting link is incomplete or invalid.";
    loading.value = false;
    return;
  }

  try {
    const response = await bookingsApi.details(client, meetingId.value);
    const booking = response.booking;
    if (!booking) throw new Error("Booking not found");
    meeting.value = booking;
  } catch (error) {
    meeting.value = null;
    loadError.value = getApiErrorMessage(error, "Could not load this meeting.");
  } finally {
    loading.value = false;
  }
};

watch([meetingId, attendeeEmail], loadMeeting, { immediate: true });

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

const requestReschedule = async (note: string) => {
  if (!meeting.value || !attendeeEmail.value) return;
  actionPending.value = true;
  try {
    await bookingsApi.requestReschedule(client, meeting.value.id, {
      email: attendeeEmail.value,
      note,
    });
    toast.success("Reschedule request sent", {
      description: `${meeting.value.host?.name ?? "The host"} will reply with a new time.`,
    });
  } catch (error) {
    toast.error(
      getApiErrorMessage(error, "Could not send the reschedule request."),
    );
  } finally {
    actionPending.value = false;
  }
};

const cancelAttendance = async () => {
  if (!attendee.value) return;
  actionPending.value = true;
  try {
    await guestsApi.update(client, attendee.value.id, {
      attendance_status: "cancelled",
    });
    await loadMeeting();
    cancelDialogOpen.value = false;
    toast.success("Attendance cancelled");
  } catch (error) {
    toast.error(getApiErrorMessage(error, "Could not cancel your attendance."));
  } finally {
    actionPending.value = false;
  }
};

useHead(() => ({
  title: meeting.value
    ? `${meeting.value.event?.name ?? `Booking #${meeting.value.id}`} | Cally`
    : "Meeting | Cally",
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
            class="h-72 animate-pulse bg-muted/50"
            aria-label="Loading meeting"
          />

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
                    Cancel my attendance
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
            </header>

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
                <SharedButton v-if="calendarUrl" as-child class="w-full">
                  <a
                    :href="calendarUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Add to calendar
                  </a>
                </SharedButton>
                <SharedButton
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
                You're no longer attending. The host has been notified.
              </p>
            </footer>
          </template>
        </div>
      </SharedCard>
    </section>

    <UiPublicAddGuestsDialog v-model:open="addGuestsOpen" @add="addGuests" />
    <UiPublicRescheduleDialog
      v-model:open="rescheduleDialogOpen"
      @submit="requestReschedule"
    />
    <UiPublicConfirmationDialog
      v-model:open="cancelDialogOpen"
      title="Cancel your attendance?"
      description="The host will be told you can't make it."
      confirm-label="Cancel attendance"
      destructive
      @confirm="cancelAttendance"
    />
  </main>
</template>
