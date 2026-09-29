import {
  DAYS,
  DEFAULT_RANGE,
  MAX_RANGES_PER_DAY,
} from "~/constants/onboarding";
import {
  cloneRanges,
  createDefaultAvailability,
  getAvailabilityError,
  getNextRange,
  makeRange,
  shiftEnd,
  toMinutes,
  validateRanges,
} from "~/helpers/onboarding";
import type { Availability, DayKey } from "~/types/onboarding";

export const useAvailabilityEditor = (
  initial: Availability = createDefaultAvailability(),
) => {
  const availability = ref<Availability>(initial);

  const dayErrors = computed(
    () =>
      Object.fromEntries(
        DAYS.map((day) => [
          day.key,
          availability.value[day.key].enabled
            ? validateRanges(availability.value[day.key].ranges)
            : null,
        ]),
      ) as Record<DayKey, string | null>,
  );

  const availabilityError = computed(() =>
    getAvailabilityError(availability.value),
  );

  const replaceAvailability = (value: Availability) => {
    availability.value = value;
  };

  const toggleDay = (day: DayKey, enabled: boolean) => {
    availability.value[day].enabled = enabled;
  };

  const addRange = (day: DayKey) => {
    const ranges = availability.value[day].ranges;
    if (ranges.length >= MAX_RANGES_PER_DAY) return;
    const next = getNextRange(ranges);
    if (next) ranges.push(next);
  };

  const removeRange = (day: DayKey, id: string) => {
    const schedule = availability.value[day];
    if (schedule.ranges.length === 1) {
      schedule.enabled = false;
      schedule.ranges = [makeRange(DEFAULT_RANGE.start, DEFAULT_RANGE.end)];
      return;
    }
    schedule.ranges = schedule.ranges.filter((range) => range.id !== id);
  };

  const updateRange = (
    day: DayKey,
    id: string,
    field: "start" | "end",
    value: string,
  ) => {
    const range = availability.value[day].ranges.find(
      (candidate) => candidate.id === id,
    );
    if (!range) return;

    range[field] = value;
    if (field === "start" && toMinutes(range.end) <= toMinutes(value)) {
      range.end = shiftEnd(value);
    }
  };

  const copyDay = (from: DayKey, targets: DayKey[]) => {
    const source = availability.value[from];
    for (const key of targets) {
      if (key === from) continue;
      availability.value[key] = {
        enabled: source.enabled,
        ranges: cloneRanges(source.ranges),
      };
    }
  };

  return {
    availability,
    dayErrors,
    availabilityError,
    replaceAvailability,
    toggleDay,
    addRange,
    removeRange,
    updateRange,
    copyDay,
  };
};
