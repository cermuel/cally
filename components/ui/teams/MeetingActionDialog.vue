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
import { getApiErrorMessage, getApiFieldErrors } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";
import { teamBookingsApi, type TeamBooking } from "~/utils/api/team-bookings";

const props = defineProps<{
  teamId: number;
  booking: TeamBooking | null;
  action: "cancel" | "delete";
}>();
const emit = defineEmits<{ completed: [] }>();
const open = defineModel<boolean>("open", { default: false });
const reason = ref("");
const error = ref("");
const client = useApiClient();
const queryClient = useQueryClient();

const title = computed(() =>
  props.action === "delete" ? "Delete this team meeting?" : "Cancel this team meeting?",
);
const description = computed(() =>
  props.action === "delete"
    ? "The meeting will be permanently removed. Its Google Calendar event will also be deleted."
    : "The meeting will be cancelled and calendar attendees will receive an update.",
);

const mutation = useMutation({
  mutationFn: async () => {
    if (!props.booking) throw new Error("No team meeting selected");
    return props.action === "delete"
      ? teamBookingsApi.remove(client, props.teamId, props.booking.id)
      : teamBookingsApi.update(client, props.teamId, props.booking.id, {
          booking: {
            status: "cancelled",
            cancellation_reason: reason.value.trim() || null,
          },
        });
  },
  onSuccess: async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.teams.bookings(props.teamId),
    });
    open.value = false;
    emit("completed");
    toast.success(props.action === "delete" ? "Team meeting deleted" : "Team meeting cancelled");
  },
  onError: (mutationError) => {
    error.value = getApiFieldErrors(mutationError)["booking.cancellation_reason"]?.[0] ?? "";
    toast.error(
      getApiErrorMessage(
        mutationError,
        props.action === "delete"
          ? "Could not delete the team meeting."
          : "Could not cancel the team meeting.",
      ),
    );
  },
});

watch(open, (isOpen) => {
  if (!isOpen) return;
  reason.value = "";
  error.value = "";
});
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-70 bg-black/55 backdrop-blur-xs" />
      <DialogContent class="fixed inset-s-1/2 top-1/2 z-70 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-xl outline-none">
        <DialogTitle class="text-lg font-semibold">{{ title }}</DialogTitle>
        <DialogDescription class="mt-2 text-sm leading-6 text-muted-foreground">{{ description }}</DialogDescription>
        <div v-if="action === 'cancel'" class="mt-5">
          <SharedLabel for="team-meeting-cancellation-reason">Reason (optional)</SharedLabel>
          <SharedTextarea
            id="team-meeting-cancellation-reason"
            v-model="reason"
            :rows="3"
            class="mt-1.5"
            placeholder="Let the team know why the meeting was cancelled"
            :aria-invalid="error ? 'true' : undefined"
          />
          <p v-if="error" class="mt-1.5 text-xs text-destructive">{{ error }}</p>
        </div>
        <div class="mt-6 flex justify-end gap-2">
          <DialogClose as-child>
            <SharedButton type="button" variant="outline" :disabled="mutation.isPending.value">Go back</SharedButton>
          </DialogClose>
          <SharedButton
            type="button"
            variant="destructive"
            :loading="mutation.isPending.value"
            @click="mutation.mutate()"
          >
            {{ action === "delete" ? "Delete meeting" : "Cancel meeting" }}
          </SharedButton>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
