<script setup lang="ts">
import type { BookingScope } from "~/utils/api/bookings";

const scope = defineModel<BookingScope>({ required: true });

const tabs: Array<{ label: string; value: BookingScope }> = [
  { label: "All", value: "all" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Pending confirmation", value: "pending" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Past", value: "past" },
];
</script>

<template>
  <SharedTabs v-model="scope" class="mb-6 overflow-x-auto pb-1">
    <SharedTabsList
      variant="default"
      class="w-max justify-start"
      aria-label="Filter bookings"
    >
      <SharedTabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="flex-1 px-3"
      >
        {{ tab.label }}
      </SharedTabsTrigger>
    </SharedTabsList>
  </SharedTabs>
</template>
