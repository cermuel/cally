<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { PublicCalendarDay } from "~/utils/public-booking";

defineProps<{
  days: PublicCalendarDay[];
  monthLabel: string;
  selectedDate: string;
  noAvailability?: boolean;
}>();

defineEmits<{
  previous: [];
  next: [];
  select: [dateKey: string];
}>();
</script>

<template>
  <section class="min-w-0 p-4 md:p-6">
    <div class="mb-4 flex items-center justify-between gap-4 md:mb-7">
      <h2 class="font-medium tracking-normal">
        {{ monthLabel }}
      </h2>
      <div class="flex items-center gap-6 text-muted-foreground">
        <SharedButton
          type="button"
          variant="ghost"
          size="icon-xs"
          class="bg-transparent text-muted-foreground hover:bg-transparent hover:text-foreground cursor-pointer"
          aria-label="Previous month"
          @click="$emit('previous')"
        >
          <HugeiconsIcon
            :icon="ChevronLeftIcon"
            :size="18"
            color="currentColor"
            :stroke-width="1.75"
          />
        </SharedButton>
        <SharedButton
          type="button"
          variant="ghost"
          size="icon-xs"
          class="bg-transparent text-muted-foreground hover:bg-transparent hover:text-foreground cursor-pointer"
          aria-label="Next month"
          @click="$emit('next')"
        >
          <HugeiconsIcon
            :icon="ChevronRightIcon"
            :size="18"
            color="currentColor"
            :stroke-width="1.75"
          />
        </SharedButton>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-x-1 gap-y-2 text-center">
      <div
        v-for="day in ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']"
        :key="day"
        class="pb-3 text-sm font-medium tracking-tight text-foreground/80 md:pb-6"
      >
        {{ day }}
      </div>
      <button
        v-for="day in days"
        :key="day.key"
        type="button"
        class="relative mx-auto flex size-8 items-center justify-center rounded p-0 text-base font-medium transition-[background-color,color,transform] disabled:opacity-100 active:scale-[0.96] sm:size-9 md:size-10"
        :class="
          day.key === selectedDate
            ? 'bg-foreground text-background'
            : day.available
              ? 'cursor-pointer text-foreground hover:bg-white/10'
              : day.muted
                ? 'cursor-not-allowed text-muted-foreground hover:cursor-not-allowed'
                : 'text-muted-foreground/50 cursor-not-allowed'
        "
        :disabled="!day.available"
        :aria-pressed="day.key === selectedDate"
        @click="$emit('select', day.key)"
      >
        {{ day.day }}
      </button>
    </div>

    <p
      v-if="noAvailability"
      class="mt-6 text-center text-sm text-muted-foreground"
    >
      No availability in {{ monthLabel }}. Try another month.
    </p>
  </section>
</template>
