<script setup lang="ts">
import { DAYS } from "~/constants/onboarding";
import type { Availability, DayKey } from "~/types/onboarding";

defineProps<{
  availability: Availability;
  dayErrors: Record<DayKey, string | null>;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  toggle: [day: DayKey, enabled: boolean];
  add: [day: DayKey];
  remove: [day: DayKey, id: string];
  update: [day: DayKey, id: string, field: "start" | "end", value: string];
  copy: [from: DayKey, targets: DayKey[]];
}>();

const updateRange = (
  day: DayKey,
  [id, field, value]: [string, "start" | "end", string],
) => emit("update", day, id, field, value);
</script>

<template>
  <div
    class="divide-y divide-border overflow-hidden rounded-lg border border-border"
  >
    <UiAvailabilityDay
      v-for="day in DAYS"
      :key="day.key"
      :day="day"
      :schedule="availability[day.key]"
      :error="dayErrors[day.key]"
      :disabled="disabled"
      @toggle="emit('toggle', day.key, $event)"
      @add="emit('add', day.key)"
      @remove="emit('remove', day.key, $event)"
      @update="updateRange(day.key, $event)"
      @copy="emit('copy', day.key, $event)"
    />
  </div>
</template>
