<script setup lang="ts">
import {
  ComputerVideoCallIcon,
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
  <section>
    <SharedCard
      class="w-full overflow-hidden rounded-2xl border-white/20 bg-slate-950/65 py-0 text-white shadow-2xl backdrop-blur-2xl"
    >
      <header class="grid place-items-center text-center pt-5 mb-0">
        <h1
          tabindex="-1"
          class="px-5 text-xl font-medium tracking-normal outline-none"
        >
          Your request was sent to {{ profile.name.split(" ")[0] }}
        </h1>
      </header>

      <p
        class="px-8 -mt-5 -mb-2 text-center text-sm leading-6 text-muted-foreground"
      >
        We've sent you a mail with more details about your event
      </p>

      <section class="border-y border-white/10 bg-black/10 px-5 py-6 sm:px-8">
        <div class="space-y-7 text-base font-medium">
          <section class="grid gap-3 grid-cols-[32px_1fr]">
            <HugeiconsIcon
              :icon="ComputerVideoCallIcon"
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
            </div>
          </section>

          <section class="grid gap-3 grid-cols-[32px_1fr]">
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

          <section class="grid gap-3 grid-cols-[32px_1fr]">
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
                class="flex flex-wrap items-center gap-2"
              >
                <p class="min-w-0 break-all text-muted-foreground">
                  {{ guest }}
                </p>
                <span
                  :class="[
                    'rounded-md px-1.5 py-0.5 text-xs font-medium',
                    index === 0
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-amber-500/10 text-amber-600',
                  ]"
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
        </div>
      </section>
    </SharedCard>
  </section>
</template>
