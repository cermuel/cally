<script setup lang="ts">
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import {
  bookingsApi,
  type Booking,
  type BookingScope,
} from "~/utils/api/bookings";
import { getApiErrorMessage } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";
import type { Recurrence } from "~/utils/api/recurrences";
import type { BookingsView } from "~/components/ui/bookings/ViewTabs.vue";

definePageMeta({ layout: false });
useHead({ title: "Meetings" });

const client = useApiClient();
const auth = useAuth();
const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const section = ref<"meetings" | "recurring">("meetings");
const scope = ref<BookingScope>("all");
const view = ref<BookingsView>("list");
const page = ref(1);
const bookingsQuery = useBookings(scope, page);
const calendarBookingsQuery = useCalendarBookings(
  "all",
  computed(() => view.value === "calendar"),
);
const linkedBookingId = computed(() => {
  const value = route.query.booking_id;
  const rawId = Array.isArray(value) ? value[0] : value;
  if (!rawId || !/^\d+$/.test(rawId)) return null;

  const id = Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
});
const linkedBookingQuery = useQuery({
  queryKey: computed(() =>
    queryKeys.bookings.detail(linkedBookingId.value ?? "none"),
  ),
  enabled: computed(() => linkedBookingId.value !== null),
  queryFn: () => bookingsApi.details(client, linkedBookingId.value!),
});
const linkedDetailsOpen = ref(false);
const actionTarget = ref<Booking | null>(null);
const declineOpen = ref(false);
const cancelOpen = ref(false);
const deleteOpen = ref(false);
const addGuestsOpen = ref(false);
const rescheduleOpen = ref(false);
const createMeetingOpen = ref(false);
const createRecurrenceOpen = ref(false);
const recurrencePage = ref(1);
const recurrenceEventId = ref("all");
const recurrenceParams = computed(() => ({
  page: recurrencePage.value,
  ...(recurrenceEventId.value !== "all"
    ? { event_id: Number(recurrenceEventId.value) }
    : {}),
}));
const recurrencesQuery = useRecurrences(recurrenceParams);
const recurrenceLinksQuery = useLinks({
  enabled: computed(() => section.value === "recurring"),
});
const recurrenceFilterEvents = computed(() => [
  { id: "all", name: "All events" },
  ...(recurrenceLinksQuery.data.value?.links ?? [])
    .filter((link) => link.is_active && link.status === "published")
    .map((link) => ({ id: String(link.id), name: link.name })),
]);
const linkedRecurrenceId = computed(() => {
  const value = route.query.recurrence_id;
  const rawId = Array.isArray(value) ? value[0] : value;
  if (!rawId || !/^\d+$/.test(rawId)) return null;
  const id = Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
});
const recurrenceDetailsOpen = computed(() => linkedRecurrenceId.value !== null);
const meetingTimezone = computed(
  () =>
    auth.user.value?.timezone ||
    (import.meta.client
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC"),
);

watch(scope, () => {
  page.value = 1;
});

watch(recurrenceEventId, () => {
  recurrencePage.value = 1;
});

watch(
  linkedRecurrenceId,
  (id) => {
    if (id !== null) section.value = "recurring";
  },
  { immediate: true },
);

watch(view, (currentView) => {
  if (currentView === "calendar") scope.value = "all";
});

watch(
  [linkedBookingId, () => linkedBookingQuery.data.value?.booking],
  ([bookingId, booking]) => {
    linkedDetailsOpen.value = booking?.id === bookingId;
  },
  { immediate: true },
);

watch(
  () => linkedBookingQuery.error.value,
  (error) => {
    if (error) {
      toast.error(getApiErrorMessage(error, "Could not load the meeting."));
    }
  },
);

const setLinkedDetailsOpen = (open: boolean) => {
  linkedDetailsOpen.value = open;
  if (open || linkedBookingId.value === null) return;

  void router.replace({
    query: {
      ...route.query,
      booking_id: undefined,
    },
  });
};

const openBooking = (booking: Booking) => {
  queryClient.setQueryData(queryKeys.bookings.detail(booking.id), {
    message: "",
    booking,
  });
  void router.push({
    query: {
      ...route.query,
      booking_id: String(booking.id),
    },
  });
};

const openRecurrence = (recurrence: Recurrence) => {
  void router.push({
    query: {
      ...route.query,
      booking_id: undefined,
      recurrence_id: String(recurrence.id),
    },
  });
};

const setRecurrenceDetailsOpen = (open: boolean) => {
  if (open || linkedRecurrenceId.value === null) return;
  void router.replace({
    query: { ...route.query, recurrence_id: undefined },
  });
};

const recurrenceCreated = (recurrence: Recurrence) => {
  section.value = "recurring";
  openRecurrence(recurrence);
};

const recurrenceDeleted = () => {
  void router.replace({
    query: { ...route.query, recurrence_id: undefined },
  });
};

const requestDecline = (booking: Booking) => {
  actionTarget.value = booking;
  declineOpen.value = true;
};

const requestCancel = (booking: Booking) => {
  actionTarget.value = booking;
  cancelOpen.value = true;
};

const requestDelete = (booking: Booking) => {
  actionTarget.value = booking;
  deleteOpen.value = true;
};

const requestAddGuests = (booking: Booking) => {
  actionTarget.value = booking;
  addGuestsOpen.value = true;
};

const requestReschedule = (booking: Booking) => {
  actionTarget.value = booking;
  rescheduleOpen.value = true;
};

const clearActionTarget = () => {
  actionTarget.value = null;
};
</script>

<template>
  <UiAppShell
    content-overflow="hidden"
    :full-width="section === 'meetings' && view === 'calendar'"
  >
    <div class="flex h-full min-h-0 flex-col overflow-y-hidden">
      <div class="mb-4 flex shrink-0 items-start justify-between gap-4">
        <SharedTabs v-model="section">
          <SharedTabsList aria-label="Meeting collections">
            <SharedTabsTrigger value="meetings">Meetings</SharedTabsTrigger>
            <SharedTabsTrigger value="recurring">Recurring</SharedTabsTrigger>
          </SharedTabsList>
        </SharedTabs>
        <div class="ms-auto flex shrink-0 items-center gap-2">
          <UiBookingsViewTabs v-if="section === 'meetings'" v-model="view" />
          <UiBookingsCreateMenu
            @once="createMeetingOpen = true"
            @recurring="createRecurrenceOpen = true"
          />
        </div>
      </div>

      <div v-if="section === 'meetings' && view === 'list'" class="mb-5 shrink-0">
        <UiBookingsTabs v-model="scope" />
      </div>
      <div
        v-else-if="section === 'recurring'"
        class="mb-5 w-full max-w-xs shrink-0"
      >
        <SharedSearchSelect
          v-model="recurrenceEventId"
          :items="recurrenceFilterEvents"
          :loading="recurrenceLinksQuery.isPending.value"
          :get-item-value="(link) => link.id"
          :get-item-label="(link) => link.name"
          :get-item-text="(link) => link.name"
          placeholder="All events"
          search-placeholder="Filter events..."
        />
      </div>

      <div
        v-if="section === 'meetings' && bookingsQuery.isError.value"
        role="alert"
        class="mb-5 shrink-0 items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
        :class="view === 'calendar' ? 'flex md:hidden' : 'flex'"
      >
        <p class="text-sm text-destructive">
          {{
            getApiErrorMessage(
              bookingsQuery.error.value,
              "Could not load your meetings.",
            )
          }}
        </p>
        <SharedButton
          type="button"
          variant="outline"
          size="sm"
          @click="bookingsQuery.refetch()"
        >
          Try again
        </SharedButton>
      </div>

      <div
        v-if="
          section === 'meetings' &&
          view === 'calendar' &&
          calendarBookingsQuery.isError.value
        "
        role="alert"
        class="mb-5 hidden shrink-0 items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 md:flex"
      >
        <p class="text-sm text-destructive">
          {{
            getApiErrorMessage(
              calendarBookingsQuery.error.value,
              "Could not load the meeting calendar.",
            )
          }}
        </p>
        <SharedButton
          type="button"
          variant="outline"
          size="sm"
          @click="calendarBookingsQuery.refetch()"
        >
          Try again
        </SharedButton>
      </div>

      <div
        v-if="section === 'meetings'"
        class="min-h-0 flex-1 flex-col"
        :class="view === 'calendar' ? 'flex md:hidden' : 'flex'"
      >
        <UiBookingsList
          :bookings="bookingsQuery.data.value?.bookings"
          :pagination="bookingsQuery.data.value?.pagination"
          :loading="bookingsQuery.isPending.value"
          :scope="scope"
          @add-guests="requestAddGuests"
          @cancel="requestCancel"
          @decline="requestDecline"
          @delete="requestDelete"
          @open="openBooking"
          @page="page = $event"
          @reschedule="requestReschedule"
        />
      </div>

      <UiBookingsCalendar
        v-if="section === 'meetings' && view === 'calendar'"
        class="hidden md:grid"
        :bookings="calendarBookingsQuery.data.value"
        :loading="calendarBookingsQuery.isPending.value"
        @open="openBooking"
      />

      <div
        v-if="section === 'recurring' && recurrencesQuery.isError.value"
        role="alert"
        class="mb-5 flex shrink-0 items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
      >
        <p class="text-sm text-destructive">
          {{
            getApiErrorMessage(
              recurrencesQuery.error.value,
              "Could not load recurring meetings.",
            )
          }}
        </p>
        <SharedButton
          type="button"
          variant="outline"
          size="sm"
          @click="recurrencesQuery.refetch()"
        >
          Try again
        </SharedButton>
      </div>

      <UiRecurrencesList
        v-if="section === 'recurring'"
        :recurrences="recurrencesQuery.data.value?.recurrences"
        :pagination="recurrencesQuery.data.value?.pagination"
        :loading="recurrencesQuery.isPending.value"
        @open="openRecurrence"
        @page="recurrencePage = $event"
      />

      <UiBookingsDetailsSheet
        :open="linkedDetailsOpen"
        :booking="linkedBookingQuery.data.value?.booking ?? null"
        @update:open="setLinkedDetailsOpen"
      />

      <UiBookingsActionDialog
        v-model:open="declineOpen"
        action="decline"
        :booking="actionTarget"
        @completed="clearActionTarget"
      />
      <UiBookingsActionDialog
        v-model:open="cancelOpen"
        action="cancel"
        :booking="actionTarget"
        @completed="clearActionTarget"
      />
      <UiBookingsActionDialog
        v-model:open="deleteOpen"
        action="delete"
        :booking="actionTarget"
        @completed="clearActionTarget"
      />
      <UiBookingsAddGuestsDialog
        v-model:open="addGuestsOpen"
        :booking="actionTarget"
        @completed="clearActionTarget"
      />
      <UiBookingsRescheduleDialog
        v-model:open="rescheduleOpen"
        :booking="actionTarget"
        :timezone="meetingTimezone"
      />

      <UiBookingsCreateDialog
        v-model:open="createMeetingOpen"
        :timezone="meetingTimezone"
      />

      <UiRecurrencesCreateDialog
        v-model:open="createRecurrenceOpen"
        :timezone="meetingTimezone"
        @created="recurrenceCreated"
      />

      <UiRecurrencesDetailsSheet
        :open="recurrenceDetailsOpen"
        :recurrence-id="linkedRecurrenceId"
        @update:open="setRecurrenceDetailsOpen"
        @deleted="recurrenceDeleted"
      />
    </div>
  </UiAppShell>
</template>
