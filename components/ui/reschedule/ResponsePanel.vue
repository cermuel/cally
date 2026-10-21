<script setup lang="ts">
import type { AxiosError } from "axios";
import { getApiErrorMessage, type ApiErrorPayload } from "~/utils/api/client";
import {
  reschedulesApi,
  type RescheduleDecision,
  type RescheduleParticipantResponse,
} from "~/utils/api/reschedules";

const props = defineProps<{
  email: string;
  rescheduleId: number;
}>();

type PanelState =
  | "loading"
  | "awaiting-response"
  | "responding"
  | "accepted"
  | "declined"
  | "already-responded"
  | "not-found"
  | "error";

const client = useApiClient();
const state = ref<PanelState>("loading");
const response = ref<RescheduleParticipantResponse | null>(null);
const respondingWith = ref<RescheduleDecision | null>(null);
const errorMessage = ref("");

const syncState = (status: RescheduleParticipantResponse["status"]) => {
  state.value = status === "pending" ? "awaiting-response" : status;
};

const loadResponse = async () => {
  state.value = "loading";
  errorMessage.value = "";

  try {
    const result = await reschedulesApi.getParticipantResponse(
      client,
      props.email,
      props.rescheduleId,
    );
    response.value = result.response;
    syncState(result.response.status);
  } catch (error) {
    const apiError = error as AxiosError<ApiErrorPayload>;
    state.value = apiError.response?.status === 404 ? "not-found" : "error";
    errorMessage.value = getApiErrorMessage(
      error,
      "Could not load your invitation response.",
    );
  }
};

const respond = async (decision: RescheduleDecision) => {
  if (!response.value || response.value.status !== "pending") return;

  state.value = "responding";
  respondingWith.value = decision;
  errorMessage.value = "";
  try {
    const result = await reschedulesApi.updateParticipantResponse(
      client,
      response.value.id,
      decision,
    );
    response.value = result.response;
    syncState(result.response.status);
  } catch (error) {
    const apiError = error as AxiosError<ApiErrorPayload>;
    if (apiError.response?.status === 409) {
      state.value = "already-responded";
      return;
    }

    state.value = apiError.response?.status === 404 ? "not-found" : "error";
    errorMessage.value = getApiErrorMessage(
      error,
      "Could not save your response.",
    );
  } finally {
    respondingWith.value = null;
  }
};

watch(
  () => [props.email, props.rescheduleId] as const,
  () => void loadResponse(),
  { immediate: true },
);
</script>

<template>
  <div class="border-t p-5 text-center">
    <div
      v-if="state === 'loading'"
      class="space-y-3"
      role="status"
      aria-label="Loading invitation"
    >
      <div
        class="mx-auto h-4 w-48 animate-pulse rounded bg-muted motion-reduce:animate-none"
      />
      <div
        class="h-9 w-full animate-pulse rounded-md bg-muted motion-reduce:animate-none"
      />
    </div>

    <template
      v-else-if="state === 'awaiting-response' || state === 'responding'"
    >
      <h2 class="font-medium">Can you make the proposed time?</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        The original meeting time changes only after every required attendee
        accepts.
      </p>
      <div class="mt-5 grid grid-cols-2 gap-2">
        <SharedButton
          type="button"
          variant="secondary"
          :loading="respondingWith === 'declined'"
          :disabled="state === 'responding'"
          @click="respond('declined')"
        >
          Decline
        </SharedButton>
        <SharedButton
          type="button"
          :loading="respondingWith === 'accepted'"
          :disabled="state === 'responding'"
          @click="respond('accepted')"
        >
          Accept
        </SharedButton>
      </div>
    </template>

    <template v-else-if="state === 'accepted'">
      <h2 class="font-medium text-emerald-600 dark:text-emerald-400">
        You accepted the new time
      </h2>
      <p class="mt-1 text-sm text-muted-foreground">
        We’ll update the meeting after everyone accepts.
      </p>
    </template>

    <template v-else-if="state === 'declined'">
      <h2 class="font-medium">You declined the new time</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        The original meeting time remains unchanged.
      </p>
    </template>

    <template v-else-if="state === 'already-responded'">
      <h2 class="font-medium">Response already recorded</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        You have already responded to this request.
      </p>
    </template>

    <template v-else>
      <h2 class="font-medium">
        {{
          state === "not-found"
            ? "Invitation unavailable"
            : "Something went wrong"
        }}
      </h2>
      <p class="mt-1 text-sm text-muted-foreground">
        {{ errorMessage }}
      </p>
      <SharedButton
        v-if="state === 'error'"
        type="button"
        variant="secondary"
        size="sm"
        class="mt-4"
        @click="loadResponse"
      >
        Try again
      </SharedButton>
    </template>
  </div>
</template>
