<script setup lang="ts">
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type {
  Booking,
  BookingPagination,
  BookingScope,
} from "~/utils/api/bookings";
import { bookingsApi } from "~/utils/api/bookings";
import { getApiErrorMessage } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";

const props = defineProps<{
  bookings?: Booking[];
  pagination?: BookingPagination;
  loading: boolean;
  scope: BookingScope;
  perPage: number;
}>();

const emit = defineEmits<{
  addGuests: [booking: Booking];
  cancel: [booking: Booking];
  decline: [booking: Booking];
  delete: [booking: Booking];
  open: [booking: Booking];
  page: [page: number];
  perPage: [perPage: number];
  reschedule: [booking: Booking];
}>();

const client = useApiClient();
const queryClient = useQueryClient();
const busyId = ref<number | null>(null);
const showPagination = computed(
  () =>
    !!props.pagination &&
    (props.pagination.total > 10 || props.perPage < props.pagination.total),
);

const acceptMutation = useMutation({
  mutationFn: (booking: Booking) => {
    busyId.value = booking.id;
    return bookingsApi.update(client, booking.id, { status: "confirmed" });
  },
  onSuccess: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() }),
  onSettled: () => {
    busyId.value = null;
  },
});

const acceptBooking = (booking: Booking) => {
  toast.promise(acceptMutation.mutateAsync(booking), {
    loading: "Accepting meeting...",
    success: "Meeting accepted",
    error: (error: unknown) =>
      getApiErrorMessage(error, "Could not accept the meeting."),
  });
};
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div
      v-if="loading"
      class="min-h-0 flex-1 space-y-3 overflow-y-auto pe-1"
      aria-label="Loading meetings"
      aria-busy="true"
    >
      <div
        v-for="index in 3"
        :key="index"
        class="h-40 animate-pulse rounded-xl border border-border bg-muted/50"
      />
    </div>

    <section
      v-else-if="!bookings?.length"
      class="flex min-h-0 flex-1 flex-col justify-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center"
    >
      <div
        class="mx-auto grid size-11 place-items-center rounded-full bg-muted text-muted-foreground"
      >
        <HugeiconsIcon
          :icon="Calendar03Icon"
          :size="21"
          :stroke-width="1.75"
          aria-hidden="true"
        />
      </div>
      <h2 class="mt-4 font-semibold">
        No {{ scope === "all" ? "" : scope }} meetings
      </h2>
      <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        New meetings and meeting requests will appear here as guests schedule
        time with you.
      </p>
    </section>

    <template v-else>
      <div class="min-h-0 flex-1 space-y-3 overflow-y-auto pe-1">
        <UiBookingsCard
          v-for="booking in bookings"
          :key="booking.id"
          :booking="booking"
          :busy="busyId === booking.id"
          @accept="acceptBooking"
          @add-guests="$emit('addGuests', $event)"
          @cancel="$emit('cancel', $event)"
          @decline="$emit('decline', $event)"
          @delete="$emit('delete', $event)"
          @open="$emit('open', $event)"
          @reschedule="$emit('reschedule', $event)"
        />
      </div>

      <nav
        v-if="showPagination && pagination"
        class="mt-4 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        aria-label="Meeting pages"
      >
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page</span>
          <SharedSelect
            :model-value="String(perPage)"
            @update:model-value="$emit('perPage', Number($event))"
          >
            <SharedSelectTrigger size="sm" aria-label="Rows per page">
              <SharedSelectValue />
            </SharedSelectTrigger>
            <SharedSelectContent>
              <SharedSelectItem
                v-for="size in [5, 10, 20, 50]"
                :key="size"
                :value="String(size)"
              >
                {{ size }}
              </SharedSelectItem>
            </SharedSelectContent>
          </SharedSelect>
        </div>

        <div
          v-if="pagination.last_page > 1"
          class="flex items-center justify-between gap-4 sm:justify-end"
        >
          <SharedButton
            type="button"
            variant="outline"
            size="sm"
            :disabled="pagination.current_page === 1"
            @click="$emit('page', pagination.current_page - 1)"
          >
            Previous
          </SharedButton>
          <p class="text-sm text-muted-foreground">
            Page {{ pagination.current_page }} of {{ pagination.last_page }}
          </p>
          <SharedButton
            type="button"
            variant="outline"
            size="sm"
            :disabled="pagination.current_page === pagination.last_page"
            @click="$emit('page', pagination.current_page + 1)"
          >
            Next
          </SharedButton>
        </div>
      </nav>
    </template>
  </div>
</template>
