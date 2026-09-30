<script setup lang="ts">
import type { Booking } from "~/utils/api/bookings";

const props = withDefaults(
  defineProps<{
    booking: Booking;
    limit?: number;
  }>(),
  { limit: 4 },
);

const visibleGuests = computed(() =>
  (props.booking.guests ?? []).slice(0, Math.max(0, props.limit - (props.booking.host ? 1 : 0))),
);
const guestCount = computed(
  () => (props.booking.guests?.length ?? 0) + (props.booking.host ? 1 : 0),
);
const hiddenGuestCount = computed(() =>
  Math.max(0, guestCount.value - props.limit),
);
</script>

<template>
  <div class="flex items-center" :aria-label="`${guestCount} guests`">
    <SharedHoverCard v-if="booking.host">
      <SharedHoverCardTrigger as-child>
        <button
          type="button"
          class="relative rounded-full focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          :aria-label="`View ${booking.host.name}`"
        >
          <UiPublicProfileAvatar
            :image="booking.host.avatar ?? undefined"
            :name="booking.host.name"
            size="sm"
            class="size-7 border-2 border-card"
          />
        </button>
      </SharedHoverCardTrigger>
      <SharedHoverCardContent side="top" class="w-60 p-3">
        <div class="flex items-center gap-2.5">
          <UiPublicProfileAvatar :image="booking.host.avatar ?? undefined" :name="booking.host.name" size="sm" class="size-9" />
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <p class="truncate text-sm font-medium">{{ booking.host.name }}</p>
              <span class="rounded-full bg-muted px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">Host</span>
            </div>
            <p class="truncate text-xs text-muted-foreground">{{ booking.host.email }}</p>
          </div>
        </div>
      </SharedHoverCardContent>
    </SharedHoverCard>

    <SharedHoverCard v-for="guest in visibleGuests" :key="guest.email">
      <SharedHoverCardTrigger as-child>
        <button
          type="button"
          class="relative -ms-1.5 rounded-full first:ms-0 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          :aria-label="`View ${guest.name}`"
        >
          <UiPublicProfileAvatar
            :name="guest.name ?? guest.email"
            size="sm"
            class="size-7 border-2 border-card"
          />
        </button>
      </SharedHoverCardTrigger>
      <SharedHoverCardContent side="top" class="w-60 p-3">
        <div class="flex items-center gap-2.5">
          <UiPublicProfileAvatar
            :name="guest.name ?? guest.email"
            size="sm"
            class="size-9"
          />
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <p class="truncate text-sm font-medium">{{ guest.name ?? guest.email }}</p>
              <span class="rounded-full bg-muted px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">Guest</span>
            </div>
            <p class="truncate text-xs text-muted-foreground">
              {{ guest.email }}
            </p>
          </div>
        </div>
      </SharedHoverCardContent>
    </SharedHoverCard>

    <span
      v-if="hiddenGuestCount"
      class="-ms-1.5 grid size-7 place-items-center rounded-full border-2 border-card bg-muted text-[10px] font-medium text-muted-foreground"
    >
      +{{ hiddenGuestCount }}
    </span>
  </div>
</template>
