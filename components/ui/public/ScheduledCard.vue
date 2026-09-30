<script setup lang="ts">
import {
  ArrowUpRight01Icon,
  CalendarPlus01Icon,
  Location05Icon,
  Time02Icon,
  UserIcon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { PublicApiEvent, PublicApiUser } from "~/utils/api/public";

const props = defineProps<{
  attendeeEmail: string;
  attendeeName: string;
  event: PublicApiEvent;
  guests: string[];
  profile: PublicApiUser;
  scheduledWhenLabel: string;
  username: string;
}>();

defineEmits<{
  reschedule: [];
}>();

const showAllGuests = ref(false);
const guestEmails = computed(() =>
  [props.attendeeEmail, ...props.guests]
    .map((guest) => guest.trim())
    .filter(Boolean),
);
const scheduledDateLabel = computed(
  () => props.scheduledWhenLabel.split("\n")[0] || "",
);
const scheduledTimeLabel = computed(
  () => props.scheduledWhenLabel.split("\n")[1] || "",
);
const visibleGuests = computed(() =>
  showAllGuests.value ? guestEmails.value : guestEmails.value.slice(0, 3),
);
const hiddenGuestCount = computed(() =>
  Math.max(0, guestEmails.value.length - visibleGuests.value.length),
);
</script>

<template>
  <section
    class="mx-auto flex h-dvh w-full max-w-150 flex-col items-center justify-center px-5 py-20"
  >
    <SharedCard
      class="overflow-hidden rounded-[18px] border-white/10 bg-[#202020] py-0 shadow-[inset_0_1px_0_oklch(1_0_0/0.03)]"
    >
      <header class="grid place-items-center text-center pt-5">
        <h1 class="text-xl font-medium tracking-normal">
          Your request was sent to {{ profile.name.split(" ")[0] }}
        </h1>
      </header>

      <p class="px-8 text-center text-sm leading-6 text-muted-foreground">
        You’ll receive a confirmation when the host accepts the booking.
      </p>

      <section class="border-y border-white/10 bg-[#171717] px-10 py-9">
        <div class="space-y-7 text-base font-medium">
          <section class="grid gap-3 sm:grid-cols-[32px_1fr]">
            <HugeiconsIcon
              :icon="Time02Icon"
              :size="22"
              color="currentColor"
              :stroke-width="1.75"
              class="mt-0.5 text-muted-foreground"
            />
            <div>
              <p>{{ event.name }}</p>
              <p class="mt-1 text-muted-foreground">
                {{ scheduledDateLabel }} at {{ scheduledTimeLabel }}
              </p>
              <p class="mt-1 text-muted-foreground">
                {{ event.duration_minutes }}m duration
              </p>
            </div>
          </section>

          <section class="grid gap-3 sm:grid-cols-[32px_1fr]">
            <HugeiconsIcon
              :icon="UserIcon"
              :size="22"
              color="currentColor"
              :stroke-width="1.75"
              class="mt-0.5 text-muted-foreground"
            />
            <div>
              <p class="flex flex-wrap items-center gap-2">
                {{ profile.name }}
                <span
                  class="rounded-md bg-blue-500/20 px-1.5 py-0.5 text-sm font-medium text-blue-400"
                >
                  Host
                </span>
              </p>
              <p class="mt-1 text-muted-foreground">{{ profile.email }}</p>
            </div>
          </section>

          <section class="grid gap-3 sm:grid-cols-[32px_1fr]">
            <HugeiconsIcon
              :icon="UserMultipleIcon"
              :size="22"
              color="currentColor"
              :stroke-width="1.75"
              class="mt-0.5 text-muted-foreground"
            />
            <div class="space-y-3">
              <div
                v-for="(guest, index) in visibleGuests"
                :key="guest"
                class="flex flex-wrap items-center justify-between gap-2"
              >
                <p class="min-w-0 break-all text-muted-foreground">
                  {{ guest }}
                </p>
                <span
                  class="rounded-md bg-white/10 px-1.5 py-0.5 text-sm font-medium text-foreground/80"
                >
                  {{ index === 0 ? "Confirmed" : "Pending" }}
                </span>
              </div>
              <button
                v-if="hiddenGuestCount"
                type="button"
                class="text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                @click="showAllGuests = true"
              >
                Show {{ hiddenGuestCount }} more
              </button>
            </div>
          </section>

          <section class="grid gap-3 sm:grid-cols-[32px_1fr]">
            <HugeiconsIcon
              :icon="Location05Icon"
              :size="22"
              color="currentColor"
              :stroke-width="1.75"
              class="mt-0.5 text-muted-foreground"
            />
            <div class="flex flex-wrap items-center justify-between gap-3">
              <a
                href="#"
                class="inline-flex items-center gap-2 transition-colors hover:text-primary"
              >
                Google Meet
                <HugeiconsIcon
                  :icon="ArrowUpRight01Icon"
                  :size="19"
                  color="currentColor"
                  :stroke-width="1.75"
                />
              </a>
              <SharedButton type="button" variant="ghost" size="sm">
                <HugeiconsIcon
                  :icon="CalendarPlus01Icon"
                  :size="18"
                  color="currentColor"
                  :stroke-width="1.75"
                />
                Add to calendar
              </SharedButton>
            </div>
          </section>
        </div>
      </section>

      <footer
        class="px-8 pb-6 text-center text-sm font-medium text-muted-foreground"
      >
        Unsure about your availability?
        <button
          type="button"
          class="underline hover:text-foreground"
          @click="$emit('reschedule')"
        >
          Reschedule
        </button>
        or
        <NuxtLink :to="`/${username}`" class="underline hover:text-foreground">
          Cancel
        </NuxtLink>
      </footer>
    </SharedCard>
  </section>
</template>
