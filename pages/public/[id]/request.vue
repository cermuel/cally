<script setup lang="ts">
import {
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  bookingsApi,
  type Booking,
  type BookingGuest,
} from "~/utils/api/bookings";
import { getApiErrorMessage } from "~/utils/api/client";
import { guestsApi } from "~/utils/api/guests";

type ResponseState = "accepted" | "declined" | "pending";

const route = useRoute();
const client = useApiClient();
const meetingId = computed(() => Number(route.params.id));
const attendeeEmail = computed(() =>
  typeof route.query.email === "string" ? route.query.email.trim() : "",
);
const meeting = ref<Booking | null>(null);
const guest = ref<BookingGuest | null>(null);
const responseState = ref<ResponseState>("pending");
const name = ref("");
const nameError = ref("");
const loadError = ref("");
const loading = ref(true);
const submitting = ref(false);
const declineDialogOpen = ref(false);

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

const loadInvitation = async () => {
  loading.value = true;
  loadError.value = "";

  if (
    !Number.isInteger(meetingId.value) ||
    meetingId.value <= 0 ||
    !attendeeEmail.value
  ) {
    loadError.value = "This invitation link is incomplete or invalid.";
    loading.value = false;
    return;
  }

  try {
    const [bookingResponse, guestResponse] = await Promise.all([
      bookingsApi.details(client, meetingId.value),
      guestsApi.byEmail(client, meetingId.value, attendeeEmail.value),
    ]);
    const booking = bookingResponse.booking;
    if (!booking) throw new Error("Booking not found");

    meeting.value = booking;
    guest.value = guestResponse.guests;
    responseState.value =
      guest.value.attendance_status === "confirmed"
        ? "accepted"
        : guest.value.attendance_status === "cancelled"
          ? "declined"
          : "pending";
    name.value =
      guest.value.name && guest.value.name.toLowerCase() !== "there"
        ? guest.value.name
        : "";
  } catch (error) {
    meeting.value = null;
    guest.value = null;
    loadError.value = getApiErrorMessage(
      error,
      "Could not load this invitation.",
    );
  } finally {
    loading.value = false;
  }
};

watch([meetingId, attendeeEmail], loadInvitation, { immediate: true });

const acceptInvitation = async () => {
  if (!guest.value) return;
  if (!name.value.trim()) {
    nameError.value = "Enter your name so the host knows who's coming.";
    return;
  }

  submitting.value = true;
  try {
    const response = await guestsApi.update(client, guest.value.id, {
      name: name.value.trim(),
      attendance_status: "confirmed",
    });
    guest.value = response.guests;
    responseState.value = "accepted";
  } catch (error) {
    nameError.value = getApiErrorMessage(
      error,
      "Could not accept this invitation.",
    );
  } finally {
    submitting.value = false;
  }
};

const declineInvitation = async () => {
  if (!guest.value) return;
  submitting.value = true;
  try {
    const response = await guestsApi.update(client, guest.value.id, {
      attendance_status: "cancelled",
    });
    guest.value = response.guests;
    responseState.value = "declined";
    declineDialogOpen.value = false;
  } catch (error) {
    loadError.value = getApiErrorMessage(
      error,
      "Could not decline this invitation.",
    );
  } finally {
    submitting.value = false;
  }
};

useHead(() => ({
  title:
    responseState.value === "pending"
      ? "Meeting invitation | Cally"
      : `Invitation ${responseState.value} | Cally`,
}));
</script>

<template>
  <main
    class="grid h-dvh place-items-center bg-background px-4 py-8 text-sm text-foreground antialiased"
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
            aria-label="Loading invitation"
          />

          <div v-else-if="loadError || !meeting || !guest" class="p-6">
            <h1 class="font-medium">Invitation unavailable</h1>
            <p class="mt-1 text-muted-foreground">{{ loadError }}</p>
          </div>

          <template v-else-if="responseState === 'pending'">
            <header class="flex flex-col items-center gap-2 p-5">
              <UiPublicProfileAvatar
                :image="meeting.host?.avatar ?? undefined"
                :name="meeting.host?.name ?? 'Host'"
                size="sm"
                class="size-10"
              />
              <div class="min-w-0 max-w-full">
                <p class="text-xs text-muted-foreground">
                  {{ meeting.host?.name ?? "The host" }} invited you to
                </p>
                <h1 class="mt-0.5 text-balance font-semibold">
                  {{ meeting.event?.name ?? `Booking #${meeting.id}` }}
                </h1>
              </div>
            </header>

            <UiPublicMeetingDetails :booking="meeting" />

            <form
              class="space-y-3 border-t p-5 text-left"
              @submit.prevent="acceptInvitation"
            >
              <div>
                <SharedLabel
                  for="invitee-name"
                  class="mb-1.5 block text-xs text-muted-foreground"
                  >Your name</SharedLabel
                >
                <SharedInput
                  id="invitee-name"
                  v-model="name"
                  name="name"
                  autocomplete="name"
                  placeholder="Jane Doe"
                  :error="nameError"
                  @update:model-value="nameError = ''"
                />
              </div>
              <div class="flex flex-col gap-1">
                <SharedButton
                  type="submit"
                  class="w-full"
                  :disabled="submitting"
                  :loading="submitting"
                >
                  Accept
                </SharedButton>
                <SharedButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  class="w-full text-muted-foreground mt-1"
                  :disabled="submitting"
                  @click="declineDialogOpen = true"
                >
                  Decline
                </SharedButton>
              </div>
            </form>
          </template>

          <template v-else-if="responseState === 'accepted'">
            <div class="flex flex-col items-center gap-2 p-5">
              <HugeiconsIcon
                :icon="CheckmarkCircle02Icon"
                :size="22"
                :stroke-width="1.75"
                class="text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
              <p class="font-semibold">You're going</p>
            </div>
            <UiPublicMeetingDetails :booking="meeting" />
            <p class="border-t p-4 text-xs text-muted-foreground">
              Details sent to
              <span class="text-foreground">{{ attendeeEmail }}</span>
            </p>
          </template>

          <template v-else>
            <div class="p-5">
              <p class="font-semibold">Declined</p>
              <p class="mt-1 text-muted-foreground">
                {{ (meeting.host?.name ?? "The host").split(" ")[0] }} has been
                notified.
              </p>
            </div>
            <div class="flex justify-center border-t p-3">
              <SharedButton as-child variant="ghost" size="sm">
                <NuxtLink to="/">
                  <HugeiconsIcon
                    :icon="ArrowLeft01Icon"
                    :size="16"
                    :stroke-width="1.75"
                    aria-hidden="true"
                  />
                  Back to Cally
                </NuxtLink>
              </SharedButton>
            </div>
          </template>
        </div>
      </SharedCard>
    </section>

    <UiPublicConfirmationDialog
      v-model:open="declineDialogOpen"
      title="Decline this invitation?"
      description="The host will be told you can't make it."
      confirm-label="Decline"
      destructive
      @confirm="declineInvitation"
    />
  </main>
</template>
