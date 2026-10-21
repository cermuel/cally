<script setup lang="ts">
import { bookingsApi, type Booking } from "~/utils/api/bookings";
import { getApiErrorMessage } from "~/utils/api/client";

const route = useRoute();
const client = useApiClient();
const bookingId = computed(() => Number(route.params.id));
const email = computed(() =>
  typeof route.query.email === "string" ? route.query.email.trim() : "",
);
const rescheduleId = computed(() => {
  const value = Number(route.query.reschedule_id);
  return Number.isInteger(value) && value > 0 ? value : null;
});
const booking = ref<Booking | null>(null);
const loading = ref(true);
const loadError = ref("");

const loadBooking = async () => {
  loading.value = true;
  loadError.value = "";
  if (!Number.isInteger(bookingId.value) || bookingId.value <= 0) {
    loadError.value = "This reschedule link is invalid.";
    loading.value = false;
    return;
  }

  try {
    const result = await bookingsApi.details(client, bookingId.value);
    booking.value = result.booking;
  } catch (error) {
    booking.value = null;
    loadError.value = getApiErrorMessage(error, "Could not load this meeting.");
  } finally {
    loading.value = false;
  }
};

watch(bookingId, () => void loadBooking(), { immediate: true });

useHead(() => ({
  title: booking.value
    ? `Reschedule ${booking.value.event?.name ?? "meeting"}`
    : "Reschedule meeting",
}));
</script>

<template>
  <main
    class="min-h-dvh flex items-center justify-center flex-col overflow-y-auto bg-background px-4 py-8 text-sm text-foreground antialiased"
  >
    <section class="mx-auto my-auto w-full max-w-md">
      <NuxtLink
        to="/"
        class="mx-auto mb-5 flex w-fit items-center gap-2 text-foreground transition-colors"
      >
        <img src="/logo.png" alt="" class="size-7 rounded" aria-hidden="true" />
        <span class="text-[17px] font-medium">Cally</span>
      </NuxtLink>

      <SharedCard class="overflow-hidden rounded-xl py-0 shadow-sm">
        <div
          v-if="loading"
          class="space-y-4 p-6"
          role="status"
          aria-label="Loading meeting"
        >
          <div
            class="mx-auto h-4 w-48 animate-pulse rounded bg-muted motion-reduce:animate-none"
          />
          <div
            class="h-24 animate-pulse rounded-lg bg-muted motion-reduce:animate-none"
          />
          <div
            class="h-40 animate-pulse rounded-lg bg-muted motion-reduce:animate-none"
          />
        </div>

        <div v-else-if="loadError || !booking" class="p-6 text-center">
          <h1 class="font-medium">Meeting unavailable</h1>
          <p class="mt-1 text-muted-foreground">{{ loadError }}</p>
        </div>

        <template v-else>
          <header class="p-5 pb-0 text-center">
            <p class="text-xs font-medium text-muted-foreground">
              Reschedule invitation
            </p>
            <h1 class="mt-1 text-balance text-lg font-semibold">
              {{ booking.event?.name ?? `Booking #${booking.id}` }}
            </h1>
            <p class="mt-1 text-xs text-muted-foreground">
              with {{ booking.host?.name ?? "Host" }}
            </p>
          </header>

          <UiPublicMeetingDetails :booking="booking" />

          <UiRescheduleResponsePanel
            v-if="email && rescheduleId"
            :email="email"
            :reschedule-id="rescheduleId"
          />

          <div v-else class="border-t p-6 text-center">
            <h2 class="font-medium">Invitation unavailable</h2>
            <p class="mt-1 text-sm text-muted-foreground">
              This reschedule link is incomplete or invalid.
            </p>
          </div>
        </template>
      </SharedCard>
    </section>
  </main>
</template>
