<script setup lang="ts">
import {
  CalendarDate,
  getLocalTimeZone,
  today,
  type DateValue,
} from "@internationalized/date";
import {
  Calendar03Icon,
  ChevronDownIcon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { PublicScheduleSlot } from "~/utils/api/public";

const props = defineProps<{
  selectedDate: string;
  selectedSlot: string;
  slots: PublicScheduleSlot[];
  timezone: string;
  loading?: boolean;
  error?: string;
  loadError?: boolean;
}>();

const emit = defineEmits<{
  retry: [];
  "select-date": [date: string];
  "select-slot": [startsAt: string];
}>();

const open = ref(false);
const errorId = `booking-date-time-error-${useId()}`;
const minimumDate = today(getLocalTimeZone());
const calendarValue = computed<DateValue | undefined>(() => {
  const [year, month, day] = props.selectedDate.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new CalendarDate(year, month, day);
});

const selectCalendarDate = (value: DateValue | DateValue[] | undefined) => {
  const date = Array.isArray(value) ? value[0] : value;
  emit("select-date", date?.toString() ?? "");
};

const timeLabel = (time: string) => {
  const [hour = 0, minute = 0] = time.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
};

const selectedTime = computed(() =>
  props.slots.find((slot) => slot.starts_at === props.selectedSlot),
);
const dateLabel = computed(() => {
  if (!calendarValue.value) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(
    new Date(
      calendarValue.value.year,
      calendarValue.value.month - 1,
      calendarValue.value.day,
      12,
    ),
  );
});
const valueLabel = computed(() => {
  if (!dateLabel.value) return "Select date and time";
  if (!selectedTime.value) return `${dateLabel.value} · Select a time`;
  return `${dateLabel.value} · ${timeLabel(selectedTime.value.time)}`;
});

const selectTime = (startsAt: string) => {
  emit("select-slot", startsAt);
  open.value = false;
};
</script>

<template>
  <div>
    <SharedLabel for="booking-date-time" class="mb-1.5 text-sm">
      Date and time
    </SharedLabel>
    <SharedPopover v-model:open="open">
      <SharedPopoverTrigger as-child>
        <button
          id="booking-date-time"
          type="button"
          class="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-muted/50 px-3 text-start text-sm shadow-xs outline-2 -outline-offset-1 outline-transparent transition-[border-color,box-shadow,outline-color] hover:bg-accent/50 focus-visible:border-ring focus-visible:outline-ring/70 aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive/70"
          :aria-invalid="error ? 'true' : undefined"
          :aria-describedby="error ? errorId : undefined"
        >
          <HugeiconsIcon
            :icon="Calendar03Icon"
            :size="16"
            :stroke-width="1.75"
            class="shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span
            class="min-w-0 flex-1 truncate"
            :class="!selectedDate && 'text-muted-foreground'"
          >
            {{ valueLabel }}
          </span>
          <HugeiconsIcon
            :icon="ChevronDownIcon"
            :size="16"
            :stroke-width="1.75"
            class="shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </button>
      </SharedPopoverTrigger>

      <SharedPopoverContent align="start" class="z-70 w-max p-3">
        <SharedCalendar
          :model-value="calendarValue"
          :min-value="minimumDate"
          calendar-label="Booking date"
          prevent-deselect
          size="sm"
          class="mx-auto p-0"
          @update:model-value="selectCalendarDate"
        />

        <div class="mt-2">
          <SharedSelect
            :model-value="selectedSlot"
            :loading="loading"
            :disabled="loadError || !selectedDate || !slots.length"
            @update:model-value="selectTime(String($event))"
          >
            <SharedSelectTrigger id="booking-time" class="w-full">
              <span class="flex min-w-0 items-center gap-2">
                <HugeiconsIcon
                  :icon="Clock01Icon"
                  :size="16"
                  :stroke-width="1.75"
                  class="shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <SharedSelectValue
                  :placeholder="
                    loading
                      ? 'Loading available times…'
                      : selectedDate
                        ? 'Select time'
                        : 'Choose a date first'
                  "
                />
              </span>
            </SharedSelectTrigger>
            <SharedSelectContent class="z-80 max-h-64">
              <SharedSelectItem
                v-for="slot in slots"
                :key="slot.starts_at"
                :value="slot.starts_at"
                :text-value="timeLabel(slot.time)"
              >
                {{ timeLabel(slot.time) }}
              </SharedSelectItem>
            </SharedSelectContent>
          </SharedSelect>

          <div
            v-if="loadError"
            role="alert"
            class="mt-2 flex items-center justify-between gap-3"
          >
            <p class="text-xs text-destructive">
              Could not load available times.
            </p>
            <SharedButton
              type="button"
              variant="ghost"
              size="sm"
              @click="emit('retry')"
            >
              Try again
            </SharedButton>
          </div>
          <p
            v-else-if="selectedDate && !loading && !slots.length"
            role="status"
            class="mt-2 text-xs text-muted-foreground"
          >
            No times are available on this date. Choose another date.
          </p>
        </div>
      </SharedPopoverContent>
    </SharedPopover>
    <p v-if="error" :id="errorId" class="mt-1.5 text-xs text-destructive">
      {{ error }}
    </p>
  </div>
</template>
