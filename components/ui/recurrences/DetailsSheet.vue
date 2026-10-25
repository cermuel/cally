<script setup lang="ts">
import {
  Calendar03Icon,
  Clock01Icon,
  Delete02Icon,
  RefreshCcwIcon,
  Time02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useQuery } from "@tanstack/vue-query";
import { getApiErrorMessage } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";
import { recurrencesApi, type Recurrence } from "~/utils/api/recurrences";

const props = defineProps<{ recurrenceId: number | null }>();
const open = defineModel<boolean>("open", { default: false });
const emit = defineEmits<{ deleted: [id: number] }>();
const client = useApiClient();
const deleteOpen = ref(false);

const query = useQuery({
  queryKey: computed(() =>
    queryKeys.recurrences.detail(props.recurrenceId ?? "none"),
  ),
  queryFn: () => recurrencesApi.get(client, props.recurrenceId!),
  enabled: computed(() => open.value && props.recurrenceId !== null),
});

const recurrence = computed(() => query.data.value?.recurrence ?? null);
const bookings = computed(() => recurrence.value?.bookings ?? []);
const eventName = computed(() =>
  recurrence.value
    ? recurrence.value.event?.name ?? `Event #${recurrence.value.event_id}`
    : "Recurring meeting",
);

const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));

const timeLabel = computed(() => {
  if (!recurrence.value) return "";
  const [hour = 0, minute = 0] = recurrence.value.start_time.split(":").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, hour, minute));
});

const deleted = (id: number) => {
  open.value = false;
  emit("deleted", id);
};
</script>

<template>
  <SharedSheet v-model:open="open" title="Recurring meeting" description="Series schedule and generated occurrences" close-label="Close recurring meeting details">
    <template #actions>
      <SharedButton v-if="recurrence" type="button" variant="ghost" size="sm" class="text-destructive hover:bg-destructive/10 hover:text-destructive" @click="deleteOpen = true">
        <HugeiconsIcon :icon="Delete02Icon" :size="15" :stroke-width="1.75" aria-hidden="true" />
        Delete
      </SharedButton>
    </template>

    <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div v-if="query.isPending.value" class="space-y-4 p-5" aria-label="Loading recurring meeting" aria-busy="true">
        <div class="h-20 animate-pulse rounded-lg bg-muted" />
        <div class="h-36 animate-pulse rounded-lg bg-muted" />
      </div>

      <div v-else-if="query.isError.value" class="grid min-h-72 place-items-center p-6 text-center" role="alert">
        <div>
          <p class="text-sm font-medium">Could not load this series</p>
          <p class="mt-1 text-xs text-muted-foreground">{{ getApiErrorMessage(query.error.value, "Try again in a moment.") }}</p>
          <SharedButton type="button" variant="outline" size="sm" class="mt-4" @click="query.refetch()">
            <HugeiconsIcon :icon="RefreshCcwIcon" :size="15" :stroke-width="1.75" aria-hidden="true" />
            Try again
          </SharedButton>
        </div>
      </div>

      <template v-else-if="recurrence">
        <section class="p-5" aria-label="Recurring meeting overview">
          <div class="flex items-center gap-2">
            <span class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium capitalize text-emerald-700 dark:text-emerald-300">{{ recurrence.status }}</span>
            <span class="text-xs text-muted-foreground">Series #{{ recurrence.id }}</span>
          </div>
          <h2 class="mt-3 text-base font-semibold tracking-tight">{{ eventName }}</h2>
          <p class="mt-1 text-sm leading-6 text-muted-foreground">{{ recurrence.schedule_description }}</p>
        </section>

        <section class="border-t border-border px-5 py-4" aria-labelledby="series-schedule-heading">
          <h2 id="series-schedule-heading" class="text-xs font-medium text-muted-foreground">Schedule</h2>
          <dl class="mt-3 space-y-2.5 text-[13px]">
            <div class="grid grid-cols-[96px_1fr] items-baseline gap-3">
              <dt class="flex items-center gap-1.5 text-muted-foreground"><HugeiconsIcon :icon="Calendar03Icon" :size="14" :stroke-width="1.75" aria-hidden="true" />Range</dt>
              <dd>{{ dateLabel(recurrence.starts_on) }} – {{ dateLabel(recurrence.ends_on) }}</dd>
            </div>
            <div class="grid grid-cols-[96px_1fr] items-baseline gap-3">
              <dt class="flex items-center gap-1.5 text-muted-foreground"><HugeiconsIcon :icon="Clock01Icon" :size="14" :stroke-width="1.75" aria-hidden="true" />Time</dt>
              <dd>{{ timeLabel }}</dd>
            </div>
            <div class="grid grid-cols-[96px_1fr] items-baseline gap-3">
              <dt class="flex items-center gap-1.5 text-muted-foreground"><HugeiconsIcon :icon="Time02Icon" :size="14" :stroke-width="1.75" aria-hidden="true" />Timezone</dt>
              <dd>{{ recurrence.timezone }}</dd>
            </div>
          </dl>
        </section>

        <section class="border-t border-border px-5 py-4" aria-labelledby="series-occurrences-heading">
          <div class="flex items-center justify-between gap-3">
            <h2 id="series-occurrences-heading" class="text-xs font-medium text-muted-foreground">Occurrences</h2>
            <span v-if="bookings.length" class="text-xs tabular-nums text-muted-foreground">
              {{ recurrence.occurrence_count ?? bookings.length }}
            </span>
          </div>

          <ul v-if="bookings.length" class="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border">
            <UiRecurrencesOccurrenceRow v-for="booking in bookings" :key="booking.id" :booking="booking" :timezone="recurrence.timezone" />
          </ul>

          <div v-else class="mt-3 rounded-lg border border-dashed border-border px-5 py-8 text-center">
            <span class="mx-auto grid size-9 place-items-center rounded-full bg-muted text-muted-foreground">
              <HugeiconsIcon :icon="RefreshCcwIcon" :size="17" :stroke-width="1.75" class="animate-spin motion-reduce:animate-none" aria-hidden="true" />
            </span>
            <p class="mt-3 text-[13px] font-medium">Preparing occurrences</p>
            <p class="mx-auto mt-1 max-w-xs text-xs leading-5 text-muted-foreground">Calendar events and invitations are created in the background. They may take a moment to appear.</p>
            <SharedButton type="button" variant="outline" size="sm" class="mt-4" :loading="query.isFetching.value" @click="query.refetch()">Refresh</SharedButton>
          </div>
        </section>
      </template>
    </div>
  </SharedSheet>

  <UiRecurrencesDeleteDialog v-model:open="deleteOpen" :recurrence="recurrence" @deleted="deleted" />
</template>
