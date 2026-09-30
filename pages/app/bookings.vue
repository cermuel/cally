<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import {
  bookingsApi,
  type Booking,
  type BookingScope,
} from "~/utils/api/bookings";
import { getApiErrorMessage } from "~/utils/api/client";
import { guestsApi } from "~/utils/api/guests";
import { queryKeys } from "~/utils/api/query-keys";

definePageMeta({ layout: false });
useHead({ title: "Bookings | Cally" });

const client = useApiClient();
const queryClient = useQueryClient();
const scope = ref<BookingScope>("all");
const page = ref(1);
const bookingsQuery = useBookings(scope, page);
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
      error: (error) =>
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
      error: (error) =>
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
      error: (error) =>
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
  <UiAppShell>
    <UiBookingsTabs v-model="scope" />

    <div
      v-if="bookingsQuery.isError.value"
      role="alert"
      class="mb-5 flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
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

    <UiBookingsList
      :paginator="bookingsQuery.data.value?.bookings"
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
  </UiAppShell>
</template>
