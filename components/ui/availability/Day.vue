<script setup lang="ts">
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  Add01Icon,
  Cancel01Icon,
  Copy01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { DAYS, MAX_RANGES_PER_DAY, WEEKDAYS } from "~/constants/onboarding";
import { formatTime, getNextRange, TIME_OPTIONS } from "~/helpers/onboarding";
import type { DayKey, DaySchedule } from "~/types/onboarding";

const props = defineProps<{
  day: { key: DayKey; label: string };
  schedule: DaySchedule;
  error?: string | null;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  toggle: [enabled: boolean];
  add: [];
  remove: [id: string];
  update: [args: [id: string, field: "start" | "end", value: string]];
  copy: [targets: DayKey[]];
}>();

const canAdd = computed(
  () =>
    props.schedule.ranges.length < MAX_RANGES_PER_DAY &&
    !!getNextRange(props.schedule.ranges),
);
const others = computed(() => DAYS.filter((day) => day.key !== props.day.key));
const copyOpen = ref(false);
const targets = ref<DayKey[]>([]);

const openCopy = () => {
  targets.value = [];
  copyOpen.value = true;
};

const toggleTarget = (key: DayKey) => {
  targets.value = targets.value.includes(key)
    ? targets.value.filter((target) => target !== key)
    : [...targets.value, key];
};

const selectPreset = (keys: DayKey[]) => {
  targets.value = keys.filter((key) => key !== props.day.key);
};

const applyCopy = () => {
  emit("copy", targets.value);
  copyOpen.value = false;
};

const endOptions = (start: string) => TIME_OPTIONS.filter((time) => time > start);
const startOptions = TIME_OPTIONS.slice(0, -1);

const onTime = (id: string, field: "start" | "end", value: unknown) => {
  if (typeof value === "string") emit("update", [id, field, value]);
};
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-3 px-4 py-2 sm:flex-nowrap sm:gap-4"
    :class="schedule.ranges.length > 1 ? 'sm:items-start' : 'max-sm:py-3!'"
  >
    <div class="order-1 flex items-center gap-3 sm:h-10 sm:w-32 sm:shrink-0">
      <SharedSwitch
        :model-value="schedule.enabled"
        :disabled="disabled"
        :aria-label="`${day.label} availability`"
        @update:model-value="emit('toggle', $event)"
      />
      <span
        class="text-sm font-medium"
        :class="schedule.enabled ? 'text-foreground' : 'text-muted-foreground'"
      >
        {{ day.label }}
      </span>
    </div>

    <div
      class="min-w-0 sm:order-2 sm:flex-1 sm:basis-auto"
      :class="schedule.enabled ? 'order-3 basis-full' : 'order-2 flex-1 basis-auto'"
    >
      <p
        v-if="!schedule.enabled"
        class="flex items-center text-sm text-muted-foreground sm:h-10"
      >
        Unavailable
      </p>
      <div v-else class="space-y-2">
        <div
          v-for="range in schedule.ranges"
          :key="range.id"
          class="flex items-center gap-2"
        >
          <SharedSelect
            :model-value="range.start"
            :disabled="disabled"
            @update:model-value="onTime(range.id, 'start', $event)"
          >
            <SharedSelectTrigger
              class="h-8! flex-1 px-2 font-normal tabular-nums sm:w-24 sm:flex-none"
              :aria-label="`${day.label} start time`"
            >
              <SharedSelectValue>{{ formatTime(range.start) }}</SharedSelectValue>
            </SharedSelectTrigger>
            <SharedSelectContent class="max-h-64">
              <SharedSelectItem
                v-for="time in startOptions"
                :key="time"
                :value="time"
              >
                {{ formatTime(time) }}
              </SharedSelectItem>
            </SharedSelectContent>
          </SharedSelect>
          <span class="text-muted-foreground">-</span>
          <SharedSelect
            :model-value="range.end"
            :disabled="disabled"
            @update:model-value="onTime(range.id, 'end', $event)"
          >
            <SharedSelectTrigger
              class="h-8! flex-1 px-2 font-normal tabular-nums sm:w-24 sm:flex-none"
              :aria-label="`${day.label} end time`"
            >
              <SharedSelectValue>{{ formatTime(range.end) }}</SharedSelectValue>
            </SharedSelectTrigger>
            <SharedSelectContent class="max-h-64">
              <SharedSelectItem
                v-for="time in endOptions(range.start)"
                :key="time"
                :value="time"
              >
                {{ formatTime(time) }}
              </SharedSelectItem>
            </SharedSelectContent>
          </SharedSelect>
          <SharedButton
            type="button"
            variant="ghost"
            size="icon-sm"
            class="size-8 shrink-0"
            :disabled="disabled"
            :aria-label="`Remove time range on ${day.label}`"
            @click="emit('remove', range.id)"
          >
            <HugeiconsIcon :icon="Cancel01Icon" :size="16" />
          </SharedButton>
        </div>
        <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
      </div>
    </div>

    <div
      v-if="schedule.enabled"
      class="relative order-2 ml-auto flex items-center gap-0.5 sm:order-3 sm:h-10"
    >
      <SharedButton
        type="button"
        variant="ghost"
        size="icon-sm"
        class="size-8 shrink-0"
        :disabled="disabled"
        :aria-label="`Copy ${day.label} times to other days`"
        title="Copy times to other days"
        @click="openCopy"
      >
        <HugeiconsIcon :icon="Copy01Icon" :size="16" />
      </SharedButton>
      <SharedButton
        type="button"
        variant="ghost"
        size="icon-sm"
        class="size-8 shrink-0"
        :disabled="disabled || !canAdd"
        :aria-label="`Add time range on ${day.label}`"
        title="Add time range"
        @click="emit('add')"
      >
        <HugeiconsIcon :icon="Add01Icon" :size="17" />
      </SharedButton>

      <template v-if="copyOpen">
        <div class="fixed inset-0 z-10" @click="copyOpen = false" />
        <div
          class="absolute top-full end-0 z-20 mt-2 w-56 rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-xl shadow-black/10 dark:shadow-black/40"
          role="dialog"
          :aria-label="`Copy ${day.label} times`"
        >
          <p class="px-2 pt-1 pb-1.5 text-xs text-muted-foreground">
            Copy times to
          </p>
          <div class="flex gap-1 px-1 pb-1.5">
            <SharedButton
              type="button"
              variant="secondary"
              size="xs"
              @click="selectPreset(WEEKDAYS)"
            >
              Weekdays
            </SharedButton>
            <SharedButton
              type="button"
              variant="secondary"
              size="xs"
              @click="selectPreset(DAYS.map((item) => item.key))"
            >
              All days
            </SharedButton>
          </div>
          <SharedButton
            v-for="other in others"
            :key="other.key"
            type="button"
            variant="ghost"
            class="h-9 w-full justify-start px-2"
            role="checkbox"
            :aria-checked="targets.includes(other.key)"
            @click="toggleTarget(other.key)"
          >
            <span
              class="grid size-4 shrink-0 place-items-center rounded border transition"
              :class="
                targets.includes(other.key)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input'
              "
            >
              <HugeiconsIcon
                v-if="targets.includes(other.key)"
                :icon="Tick02Icon"
                :size="12"
              />
            </span>
            {{ other.label }}
          </SharedButton>
          <SharedButton
            type="button"
            :disabled="!targets.length"
            class="mt-1.5 h-9 w-full"
            @click="applyCopy"
          >
            Apply
          </SharedButton>
        </div>
      </template>
    </div>
  </div>
</template>
