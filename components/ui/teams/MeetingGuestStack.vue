<script setup lang="ts">
import type { TeamBookingGuest } from "~/utils/api/team-bookings";

const props = withDefaults(
  defineProps<{
    guests?: TeamBookingGuest[];
    limit?: number;
  }>(),
  { guests: () => [], limit: 4 },
);

const visibleGuests = computed(() => props.guests.slice(0, props.limit));
const hiddenGuestCount = computed(() =>
  Math.max(0, props.guests.length - props.limit),
);
</script>

<template>
  <div class="flex items-center" :aria-label="`${guests.length} attendees`">
    <SharedHoverCard v-for="guest in visibleGuests" :key="guest.id">
      <SharedHoverCardTrigger as-child>
        <button
          type="button"
          class="relative -ms-1.5 rounded-full first:ms-0 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          :aria-label="`View ${guest.user?.name || guest.name || guest.email}`"
        >
          <UiPublicProfileAvatar
            :image="guest.user?.avatar_url || undefined"
            :name="guest.user?.name || guest.name || guest.email"
            size="sm"
            class="size-7 border-2 border-card"
          />
        </button>
      </SharedHoverCardTrigger>
      <SharedHoverCardContent side="top" class="w-60 p-3">
        <div class="flex items-center gap-2.5">
          <UiPublicProfileAvatar
            :image="guest.user?.avatar_url || undefined"
            :name="guest.user?.name || guest.name || guest.email"
            size="sm"
            class="size-9"
          />
          <div class="min-w-0">
            <p class="truncate text-sm font-medium">
              {{ guest.user?.name || guest.name || guest.email }}
            </p>
            <p class="truncate text-xs text-muted-foreground">
              {{ guest.user?.email || guest.email }}
            </p>
          </div>
          <SharedPill
            class="ms-auto shrink-0"
            :value="guest.attendance_status"
          />
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
