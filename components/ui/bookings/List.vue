<script setup lang="ts">
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type {
  Booking,
  BookingPagination,
  BookingScope,
} from "~/utils/api/bookings";

defineProps<{
  bookings?: Booking[];
  pagination?: BookingPagination;
  loading: boolean;
  busyId?: number | null;
  scope: BookingScope;
}>();

defineEmits<{
  accept: [booking: Booking];
  addGuests: [booking: Booking];
  cancel: [booking: Booking];
  decline: [booking: Booking];
  delete: [booking: Booking];
  page: [page: number];
  reschedule: [booking: Booking];
}>();

const selectedBooking = ref<Booking | null>(null);
const detailsOpen = ref(false);

const openDetails = (booking: Booking) => {
  selectedBooking.value = booking;
  detailsOpen.value = true;
};
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div
      v-if="loading"
      class="min-h-0 flex-1 space-y-3 overflow-y-auto pe-1"
      aria-label="Loading bookings"
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
        No {{ scope === "all" ? "" : scope }} bookings
      </h2>
      <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        New meetings and booking requests will appear here as guests schedule
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
          @accept="$emit('accept', $event)"
          @add-guests="$emit('addGuests', $event)"
          @cancel="$emit('cancel', $event)"
          @decline="$emit('decline', $event)"
          @delete="$emit('delete', $event)"
          @open="openDetails"
          @reschedule="$emit('reschedule', $event)"
        />
      </div>

      <nav
        v-if="pagination && pagination.last_page > 1"
        class="mt-4 flex shrink-0 items-center justify-between"
        aria-label="Booking pages"
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
      </nav>

      <UiBookingsDetailsSheet
        v-model:open="detailsOpen"
        :booking="selectedBooking"
      />
    </template>
  </div>
</template>
