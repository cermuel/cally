<script setup lang="ts">
import {
  Calendar03Icon,
  Clock01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { Booking } from "~/utils/api/bookings";
import { getApiErrorMessage } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";
import {
  reschedulesApi,
  type Reschedule,
  type RescheduleDecision,
} from "~/utils/api/reschedules";

const props = defineProps<{
  active: boolean;
  booking: Booking;
}>();

const client = useApiClient();
const auth = useAuth();
const queryClient = useQueryClient();
const respondingWith = ref<RescheduleDecision | null>(null);
const timezone = computed(
  () => props.booking.booking_timezone ?? props.booking.host?.timezone ?? "UTC",
);

const reschedulesQuery = useQuery({
  queryKey: computed(() => queryKeys.reschedules.list(props.booking.id)),
  queryFn: () => reschedulesApi.list(client, props.booking.id),
  enabled: computed(() => props.active),
});
const reschedules = computed(() =>
  [...(reschedulesQuery.data.value?.reschedules ?? [])].sort(
    (first, second) =>
      new Date(second.created_at).getTime() - new Date(first.created_at).getTime(),
  ),
);
const pendingReschedule = computed(
  () => reschedules.value.find((reschedule) => reschedule.status === "pending") ?? null,
);
const hostEmail = computed(() => auth.user.value?.email ?? "");
const hostResponseQuery = useQuery({
  queryKey: computed(() =>
    queryKeys.reschedules.response(
      pendingReschedule.value?.id ?? "none",
      hostEmail.value,
    ),
  ),
  queryFn: () =>
    reschedulesApi.getParticipantResponse(
      client,
      hostEmail.value,
      pendingReschedule.value!.id,
    ),
  enabled: computed(
    () => props.active && Boolean(pendingReschedule.value && hostEmail.value),
  ),
});

const dateLabel = (reschedule: Reschedule) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: timezone.value,
  }).format(new Date(reschedule.starts_at));

const timeLabel = (reschedule: Reschedule) => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone.value,
  });
  const start = formatter.format(new Date(reschedule.starts_at)).toLowerCase();
  const end = formatter.format(new Date(reschedule.ends_at)).toLowerCase();
  return `${start}–${end}`;
};

const responseMutation = useMutation({
  mutationFn: (decision: RescheduleDecision) => {
    const response = hostResponseQuery.data.value?.response;
    if (!response) throw new Error("Host response is unavailable");
    respondingWith.value = decision;
    return reschedulesApi.updateParticipantResponse(
      client,
      response.id,
      decision,
    );
  },
  onSuccess: async (_result, decision) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.reschedules.all() }),
    ]);
    toast.success(
      decision === "accepted"
        ? "Proposed time accepted"
        : "Proposed time declined",
    );
  },
  onError: (error) => {
    toast.error(getApiErrorMessage(error, "Could not save your response."));
  },
  onSettled: () => {
    respondingWith.value = null;
  },
});

const respond = (decision: RescheduleDecision) => {
  const response = hostResponseQuery.data.value?.response;
  if (!response || response.status !== "pending") return;
  responseMutation.mutate(decision);
};
</script>

<template>
  <section
    class="border-t border-border px-5 py-4"
    aria-labelledby="booking-reschedules-heading"
  >
    <div class="flex items-center justify-between gap-3">
      <h2
        id="booking-reschedules-heading"
        class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
      >
        <HugeiconsIcon
          :icon="RefreshIcon"
          :size="14"
          :stroke-width="1.75"
          aria-hidden="true"
        />
        Reschedule requests
      </h2>
      <span
        v-if="reschedules.length"
        class="text-xs tabular-nums text-muted-foreground"
      >
        {{ reschedules.length }}
      </span>
    </div>

    <div
      v-if="reschedulesQuery.isPending.value"
      class="mt-3 space-y-2"
      role="status"
      aria-label="Loading reschedule requests"
    >
      <div class="h-4 w-40 animate-pulse rounded bg-muted motion-reduce:animate-none" />
      <div class="h-16 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
    </div>

    <div
      v-else-if="reschedulesQuery.isError.value"
      class="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
      role="alert"
    >
      <p class="text-xs text-destructive">
        {{
          getApiErrorMessage(
            reschedulesQuery.error.value,
            "Could not load reschedule requests.",
          )
        }}
      </p>
      <SharedButton
        type="button"
        variant="outline"
        size="xs"
        class="mt-2"
        @click="reschedulesQuery.refetch()"
      >
        Try again
      </SharedButton>
    </div>

    <p v-else-if="!reschedules.length" class="mt-3 text-xs text-muted-foreground">
      No reschedule requests for this meeting.
    </p>

    <div v-else class="mt-3 space-y-3">
      <article
        v-for="reschedule in reschedules"
        :key="reschedule.id"
        class="rounded-lg border border-border p-3"
      >
        <div class="flex items-center justify-between gap-3">
          <p class="text-[13px] font-medium">
            {{ reschedule.status === "pending" ? "Proposed time" : "Reschedule" }}
          </p>
          <span
            class="rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize"
            :class="{
              'bg-amber-500/10 text-amber-700 dark:text-amber-300':
                reschedule.status === 'pending',
              'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300':
                reschedule.status === 'accepted',
              'bg-destructive/10 text-destructive':
                reschedule.status === 'declined',
            }"
          >
            {{ reschedule.status }}
          </span>
        </div>

        <dl class="mt-2.5 space-y-2 text-[13px]">
          <div class="flex items-center gap-2">
            <dt class="text-muted-foreground">
              <HugeiconsIcon
                :icon="Calendar03Icon"
                :size="14"
                :stroke-width="1.75"
                aria-label="Date"
              />
            </dt>
            <dd>{{ dateLabel(reschedule) }}</dd>
          </div>
          <div class="flex items-center gap-2">
            <dt class="text-muted-foreground">
              <HugeiconsIcon
                :icon="Clock01Icon"
                :size="14"
                :stroke-width="1.75"
                aria-label="Time"
              />
            </dt>
            <dd>
              {{ timeLabel(reschedule) }}
              <span class="text-muted-foreground">· {{ timezone }}</span>
            </dd>
          </div>
        </dl>

        <template v-if="reschedule.id === pendingReschedule?.id">
          <div
            v-if="hostResponseQuery.isPending.value"
            class="mt-3 h-8 animate-pulse rounded-md bg-muted motion-reduce:animate-none"
            role="status"
            aria-label="Loading your response"
          />
          <div
            v-else-if="hostResponseQuery.data.value?.response.status === 'pending'"
            class="mt-3 grid grid-cols-2 gap-2"
          >
            <SharedButton
              type="button"
              variant="outline"
              size="sm"
              :loading="respondingWith === 'declined'"
              :disabled="responseMutation.isPending.value"
              @click="respond('declined')"
            >
              Decline
            </SharedButton>
            <SharedButton
              type="button"
              size="sm"
              :loading="respondingWith === 'accepted'"
              :disabled="responseMutation.isPending.value"
              @click="respond('accepted')"
            >
              Accept new time
            </SharedButton>
          </div>
          <p
            v-else-if="hostResponseQuery.data.value?.response.status"
            class="mt-3 text-xs text-muted-foreground"
          >
            You {{ hostResponseQuery.data.value.response.status }} this proposal.
          </p>
          <div
            v-else-if="hostResponseQuery.isError.value"
            class="mt-3 flex items-center justify-between gap-3"
          >
            <p class="text-xs text-destructive">Could not load your response.</p>
            <SharedButton
              type="button"
              variant="ghost"
              size="xs"
              @click="hostResponseQuery.refetch()"
            >
              Try again
            </SharedButton>
          </div>
        </template>
      </article>
    </div>
  </section>
</template>
