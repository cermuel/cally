<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import {
  bookingsApi,
  type Booking,
  type BookingScope,
} from "~/utils/api/bookings";
import { getApiErrorMessage } from "~/utils/api/client";
import { guestsApi } from "~/utils/api/guests";
import { queryKeys } from "~/utils/api/query-keys";
import type { BookingsView } from "~/components/ui/bookings/ViewTabs.vue";

definePageMeta({ layout: false });
useHead({ title: "Bookings | Cally" });

const client = useApiClient();
const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
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
const busyId = ref<number | null>(null);

watch(scope, () => {
  page.value = 1;
});

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
      toast.error(getApiErrorMessage(error, "Could not load the booking."));
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

const refreshBookings = () =>
  queryClient.invalidateQueries({
    queryKey: queryKeys.bookings.all(),
  });

const updateMutation = useMutation({
  mutationFn: ({
    booking,
    payload,
  }: {
    booking: Booking;
    payload: {
      status: "confirmed" | "cancelled";
      cancellation_reason?: string | null;
    };
  }) => {
    busyId.value = booking.id;
    return bookingsApi.update(client, booking.id, payload);
  },
  onSuccess: async () => {
    await refreshBookings();
    declineOpen.value = false;
    cancelOpen.value = false;
    actionTarget.value = null;
  },
  onSettled: () => {
    busyId.value = null;
  },
});

const deleteMutation = useMutation({
  mutationFn: (booking: Booking) => {
    busyId.value = booking.id;
    return bookingsApi.remove(client, booking.id);
  },
  onSuccess: async () => {
    await refreshBookings();
    deleteOpen.value = false;
    actionTarget.value = null;
    toast.success("Booking deleted");
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not delete the booking.")),
  onSettled: () => {
    busyId.value = null;
  },
});

const addGuestsMutation = useMutation({
  mutationFn: ({ booking, emails }: { booking: Booking; emails: string[] }) =>
    guestsApi.add(
      client,
      booking.id,
      emails.map((email) => ({ email })),
    ),
  onSuccess: async (_, variables) => {
    await refreshBookings();
    addGuestsOpen.value = false;
    actionTarget.value = null;
    toast.success(
      `${variables.emails.length === 1 ? "Guest" : "Guests"} added`,
    );
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not add the guests.")),
});

const rescheduleMutation = useMutation({
  mutationFn: ({
    booking,
    startsAt,
    endsAt,
  }: {
    booking: Booking;
    startsAt: string;
    endsAt: string;
  }) =>
    bookingsApi.update(client, booking.id, {
      starts_at: startsAt,
      ends_at: endsAt,
    }),
  onSuccess: async () => {
    await refreshBookings();
    rescheduleOpen.value = false;
    actionTarget.value = null;
    toast.success("Meeting rescheduled");
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not reschedule the meeting.")),
});

const acceptBooking = (booking: Booking) => {
  toast.promise(
    updateMutation.mutateAsync({
      booking,
      payload: { status: "confirmed" },
    }),
    {
      loading: "Accepting booking...",
      success: "Booking accepted",
      error: (error: unknown) =>
        getApiErrorMessage(error, "Could not accept the booking."),
    },
  );
};

const requestDecline = (booking: Booking) => {
  actionTarget.value = booking;
  declineOpen.value = true;
};

const declineBooking = (reason?: string) => {
  if (!actionTarget.value) return;
  toast.promise(
    updateMutation.mutateAsync({
      booking: actionTarget.value,
      payload: {
        status: "cancelled",
        cancellation_reason: reason || null,
      },
    }),
    {
      loading: "Declining invitation...",
      success: "Invitation declined",
      error: (error: unknown) =>
        getApiErrorMessage(error, "Could not decline the invitation."),
    },
  );
};

const requestCancel = (booking: Booking) => {
  actionTarget.value = booking;
  cancelOpen.value = true;
};

const cancelBooking = (reason?: string) => {
  if (!actionTarget.value) return;
  toast.promise(
    updateMutation.mutateAsync({
      booking: actionTarget.value,
      payload: {
        status: "cancelled",
        cancellation_reason: reason || null,
      },
    }),
    {
      loading: "Cancelling event...",
      success: "Event cancelled",
      error: (error: unknown) =>
        getApiErrorMessage(error, "Could not cancel the event."),
    },
  );
};

const requestDelete = (booking: Booking) => {
  actionTarget.value = booking;
  deleteOpen.value = true;
};

const requestAddGuests = (booking: Booking) => {
  actionTarget.value = booking;
  addGuestsOpen.value = true;
};

const addGuests = (emails: string[]) => {
  if (!actionTarget.value) return;
  addGuestsMutation.mutate({ booking: actionTarget.value, emails });
};

const requestReschedule = (booking: Booking) => {
  actionTarget.value = booking;
  rescheduleOpen.value = true;
};

const rescheduleBooking = (startsAt: string, endsAt: string) => {
  if (!actionTarget.value) return;
  rescheduleMutation.mutate({
    booking: actionTarget.value,
    startsAt,
    endsAt,
  });
};
</script>

<template>
  <UiAppShell
    content-overflow="hidden"
    :full-width="view === 'calendar'"
  >
    <template #navbar-actions>
      <UiBookingsViewTabs v-if="view === 'calendar'" v-model="view" />
    </template>

    <div class="flex h-full min-h-0 flex-col overflow-y-hidden">
      <div
        v-if="view === 'list'"
        class="mb-6 flex shrink-0 items-start justify-between gap-4"
      >
        <UiBookingsTabs v-model="scope" />
        <UiBookingsViewTabs class="ms-auto" v-model="view" />
      </div>

      <div
        v-if="bookingsQuery.isError.value"
        role="alert"
        class="mb-5 shrink-0 items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
        :class="view === 'calendar' ? 'flex md:hidden' : 'flex'"
      >
        <p class="text-sm text-destructive">
          {{
            getApiErrorMessage(
              bookingsQuery.error.value,
              "Could not load your bookings.",
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
        v-if="view === 'calendar' && calendarBookingsQuery.isError.value"
        role="alert"
        class="mb-5 hidden shrink-0 items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 md:flex"
      >
        <p class="text-sm text-destructive">
          {{
            getApiErrorMessage(
              calendarBookingsQuery.error.value,
              "Could not load the booking calendar.",
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
        class="min-h-0 flex-1 flex-col"
        :class="view === 'calendar' ? 'flex md:hidden' : 'flex'"
      >
        <UiBookingsList
          :bookings="bookingsQuery.data.value?.bookings"
          :pagination="bookingsQuery.data.value?.pagination"
          :loading="bookingsQuery.isPending.value"
          :busy-id="busyId"
          :scope="scope"
          @accept="acceptBooking"
          @add-guests="requestAddGuests"
          @cancel="requestCancel"
          @decline="requestDecline"
          @delete="requestDelete"
          @page="page = $event"
          @reschedule="requestReschedule"
        />
      </div>

      <UiBookingsCalendar
        v-if="view === 'calendar'"
        class="hidden md:grid"
        :bookings="calendarBookingsQuery.data.value"
        :loading="calendarBookingsQuery.isPending.value"
      />

      <UiBookingsDetailsSheet
        :open="linkedDetailsOpen"
        :booking="linkedBookingQuery.data.value?.booking ?? null"
        @update:open="setLinkedDetailsOpen"
      />

      <UiBookingsActionDialog
        v-model:open="declineOpen"
        action="decline"
        :submitting="updateMutation.isPending.value"
        @confirm="declineBooking"
      />
      <UiBookingsActionDialog
        v-model:open="cancelOpen"
        action="cancel"
        :submitting="updateMutation.isPending.value"
        @confirm="cancelBooking"
      />
      <UiBookingsActionDialog
        v-model:open="deleteOpen"
        action="delete"
        :submitting="deleteMutation.isPending.value"
        @confirm="actionTarget && deleteMutation.mutate(actionTarget)"
      />
      <UiPublicAddGuestsDialog v-model:open="addGuestsOpen" @add="addGuests" />
      <UiBookingsRescheduleDialog
        v-model:open="rescheduleOpen"
        :booking="actionTarget"
        :submitting="rescheduleMutation.isPending.value"
        @submit="rescheduleBooking"
      />
    </div>
  </UiAppShell>
</template>
