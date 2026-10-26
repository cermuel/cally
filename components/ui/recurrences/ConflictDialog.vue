<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import { toast } from "vue-sonner";
import { getApiErrorMessage } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";
import {
  recurrencesApi,
  type CreateRecurrencePayload,
  type Recurrence,
} from "~/utils/api/recurrences";

const props = defineProps<{ payload: CreateRecurrencePayload | null }>();
const open = defineModel<boolean>("open", { default: false });
const emit = defineEmits<{ created: [recurrence: Recurrence] }>();
const client = useApiClient();
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (payload: CreateRecurrencePayload) =>
    recurrencesApi.create(client, { ...payload, override: true }),
  onSuccess: async (response, payload) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.links.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.recurrences.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all() }),
      ...(payload.team_id
        ? [
            queryClient.invalidateQueries({
              queryKey: queryKeys.teams.bookings(payload.team_id),
            }),
          ]
        : []),
    ]);
    open.value = false;
    emit("created", response.body);
  },
  onError: (error) =>
    toast.error(
      getApiErrorMessage(error, "Could not create the recurring meeting."),
    ),
});
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-80 bg-black/55 backdrop-blur-xs data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none"
      />
      <DialogContent
        class="fixed inset-s-1/2 top-1/2 z-80 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-5 shadow-xl outline-none"
      >
        <DialogTitle class="font-semibold">
          Create overlapping meetings?
        </DialogTitle>
        <DialogDescription class="mt-2 text-sm leading-6 text-muted-foreground">
          One or more dates in this recurring meeting overlap with existing
          bookings. Do you want to create the meetings anyway?
        </DialogDescription>
        <div class="mt-5 flex justify-end gap-2">
          <DialogClose as-child>
            <SharedButton
              type="button"
              variant="outline"
              :disabled="mutation.isPending.value"
            >
              Cancel
            </SharedButton>
          </DialogClose>
          <SharedButton
            type="button"
            :loading="mutation.isPending.value"
            :disabled="!payload"
            @click="payload && mutation.mutate(payload)"
          >
            Create anyway
          </SharedButton>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
