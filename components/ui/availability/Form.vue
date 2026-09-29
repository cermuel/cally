<script setup lang="ts">
import type { Availability, DayKey } from "~/types/onboarding";

const props = defineProps<{
  availability: Availability;
  dayErrors: Record<DayKey, string | null>;
  availabilityError?: string | null;
  timezone?: string;
  hasChanges: boolean;
  saving?: boolean;
}>();

const emit = defineEmits<{
  toggle: [day: DayKey, enabled: boolean];
  add: [day: DayKey];
  remove: [day: DayKey, id: string];
  update: [day: DayKey, id: string, field: "start" | "end", value: string];
  copy: [from: DayKey, targets: DayKey[]];
  discard: [];
  save: [];
}>();

const forwardToggle = (day: DayKey, enabled: boolean) =>
  emit("toggle", day, enabled);
const forwardRemove = (day: DayKey, id: string) => emit("remove", day, id);
const forwardUpdate = (
  day: DayKey,
  id: string,
  field: "start" | "end",
  value: string,
) => emit("update", day, id, field, value);
const forwardCopy = (from: DayKey, targets: DayKey[]) =>
  emit("copy", from, targets);
const submit = () => {
  if (props.hasChanges && !props.availabilityError && !props.saving) {
    emit("save");
  }
};
</script>

<template>
  <form
    class="overflow-hidden rounded-xl border border-border bg-card"
    @submit.prevent="submit"
  >
    <UiAvailabilityEditor
      :availability="availability"
      :day-errors="dayErrors"
      :disabled="saving"
      class="rounded-none border-0"
      @toggle="forwardToggle"
      @add="emit('add', $event)"
      @remove="forwardRemove"
      @update="forwardUpdate"
      @copy="forwardCopy"
    />

    <footer
      class="flex flex-col gap-3 border-t border-border bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <div class="min-w-0 text-xs" aria-live="polite">
        <p v-if="availabilityError" class="text-destructive">
          {{ availabilityError }}
        </p>
        <p v-else class="text-muted-foreground">
          Times use your local timezone<span v-if="timezone"
            >: {{ timezone }}</span
          >.
        </p>
      </div>
      <div class="flex shrink-0 justify-end gap-2">
        <SharedButton
          v-if="hasChanges && !saving"
          type="button"
          variant="ghost"
          @click="emit('discard')"
        >
          Discard
        </SharedButton>
        <SharedButton
          type="submit"
          :disabled="!hasChanges || !!availabilityError"
          :loading="saving"
        >
          Save changes
        </SharedButton>
      </div>
    </footer>
  </form>
</template>
