import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { DAYS, DEFAULT_RANGE } from "~/constants/onboarding";
import { makeRange } from "~/helpers/onboarding";
import type { Availability, TimeRange } from "~/types/onboarding";
import {
  availabilityApi,
  type AvailabilityPayload,
  type AvailabilitySlot,
} from "~/utils/api/availability";
import { queryKeys } from "~/utils/api/query-keys";

const normalizeTime = (value: string | null, fallback: string) =>
  value?.slice(0, 5) || fallback;

const availabilityFromSlots = (slots: AvailabilitySlot[]): Availability =>
  Object.fromEntries(
    DAYS.map((day) => {
      const daySlots = slots.filter((slot) => slot.day === day.key);
      const ranges: TimeRange[] = daySlots.length
        ? daySlots.map((slot) => ({
            id: `availability-${slot.id}`,
            serverId: slot.id,
            start: normalizeTime(slot.start_time, DEFAULT_RANGE.start),
            end: normalizeTime(slot.end_time, DEFAULT_RANGE.end),
          }))
        : [makeRange()];

      return [day.key, { enabled: daySlots.length > 0, ranges }];
    }),
  ) as Availability;

const availabilitySignature = (availability: Availability) =>
  JSON.stringify(
    DAYS.flatMap((day) => {
      const schedule = availability[day.key];
      if (!schedule.enabled) return [];
      return schedule.ranges.map((range) => [day.key, range.start, range.end]);
    }),
  );

export const useAvailabilitySettings = () => {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const editor = useAvailabilityEditor();
  const baseline = ref("");
  const serverSlots = ref<AvailabilitySlot[]>([]);

  const query = useQuery({
    queryKey: queryKeys.availability.mine(),
    queryFn: () => availabilityApi.list(client),
  });

  const applySlots = (slots: AvailabilitySlot[]) => {
    const availability = availabilityFromSlots(slots);
    serverSlots.value = slots;
    editor.replaceAvailability(availability);
    baseline.value = availabilitySignature(availability);
  };

  const hasChanges = computed(
    () => availabilitySignature(editor.availability.value) !== baseline.value,
  );

  watch(
    () => query.data.value,
    (response) => {
      if (response && (!baseline.value || !hasChanges.value)) {
        applySlots(response.availabilities);
      }
    },
    { immediate: true },
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const desired = DAYS.flatMap((day) => {
        const schedule = editor.availability.value[day.key];
        if (!schedule.enabled) return [];
        return schedule.ranges.map((range) => ({ day: day.key, range }));
      });
      const retainedIds = new Set(
        desired.flatMap(({ range }) =>
          range.serverId === undefined ? [] : [range.serverId],
        ),
      );
      const removed = serverSlots.value.filter(
        (slot) => !retainedIds.has(slot.id),
      );

      await Promise.all(
        removed.map((slot) => availabilityApi.remove(client, slot.id)),
      );
      await Promise.all(
        desired.map(({ day, range }) => {
          const payload: AvailabilityPayload = {
            day,
            start_time: range.start,
            end_time: range.end,
          };
          if (range.serverId === undefined) {
            return availabilityApi.create(client, payload);
          }

          const original = serverSlots.value.find(
            (slot) => slot.id === range.serverId,
          );
          const unchanged =
            original?.day === day &&
            normalizeTime(original.start_time, DEFAULT_RANGE.start) ===
              range.start &&
            normalizeTime(original.end_time, DEFAULT_RANGE.end) === range.end;

          return unchanged
            ? Promise.resolve()
            : availabilityApi.update(client, range.serverId, payload);
        }),
      );

      return availabilityApi.list(client);
    },
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.availability.mine(), response);
      applySlots(response.availabilities);
    },
  });

  const discard = () => applySlots(serverSlots.value);

  return {
    ...editor,
    query,
    hasChanges,
    saving: saveMutation.isPending,
    save: saveMutation.mutateAsync,
    discard,
  };
};
