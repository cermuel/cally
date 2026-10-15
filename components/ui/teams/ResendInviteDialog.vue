<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { getApiErrorMessage } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";
import { teamsApi, type TeamInvite } from "~/utils/api/teams";

const props = defineProps<{
  teamId: number;
  invite: TeamInvite | null;
}>();

const open = defineModel<boolean>("open", { default: false });
const emit = defineEmits<{ completed: [] }>();
const client = useApiClient();
const queryClient = useQueryClient();

const resendMutation = useMutation({
  mutationFn: () => {
    if (!props.invite) throw new Error("No invitation selected");
    return teamsApi.invite(client, props.teamId, {
      users: [{ email: props.invite.email, role: props.invite.role }],
    });
  },
  onSuccess: async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.teams.invites(props.teamId),
    });
    open.value = false;
    emit("completed");
    toast.success("Invitation resent");
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not resend the invitation.")),
});
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-60 bg-black/60 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed top-1/3 left-1/2 z-60 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      >
        <DialogTitle class="text-lg font-semibold">Resend invitation</DialogTitle>
        <DialogDescription class="mt-2 text-sm leading-6 text-muted-foreground">
          Send another invitation email to
          <strong>{{ invite?.email }}</strong>?
        </DialogDescription>

        <div class="mt-6 flex justify-end gap-2">
          <DialogClose as-child>
            <SharedButton type="button" variant="outline" :disabled="resendMutation.isPending.value">
              Cancel
            </SharedButton>
          </DialogClose>
          <SharedButton
            type="button"
            :disabled="!invite"
            :loading="resendMutation.isPending.value"
            @click="resendMutation.mutate()"
          >
            Resend invitation
          </SharedButton>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
