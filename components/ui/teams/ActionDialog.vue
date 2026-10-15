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
import { teamsApi } from "~/utils/api/teams";

const props = defineProps<{
  teamId: number;
  action: "delete" | "leave";
  teamName: string;
}>();

const open = defineModel<boolean>("open", { default: false });
const client = useApiClient();
const queryClient = useQueryClient();

const actionMutation = useMutation({
  mutationFn: () =>
    props.action === "delete"
      ? teamsApi.remove(client, props.teamId)
      : teamsApi.leave(client, props.teamId),
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
    toast.success(props.action === "delete" ? "Team deleted" : "You left the team");
    await navigateTo("/app/teams");
  },
  onError: (error) =>
    toast.error(
      getApiErrorMessage(
        error,
        props.action === "delete"
          ? "Could not delete the team."
          : "Could not leave the team.",
      ),
    ),
});

const title = computed(() =>
  props.action === "delete" ? "Delete team?" : "Leave team?",
);
const buttonLabel = computed(() =>
  props.action === "delete" ? "Delete team" : "Leave team",
);
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
        <DialogTitle class="text-lg font-semibold">{{ title }}</DialogTitle>
        <DialogDescription class="mt-2 text-sm leading-6 text-muted-foreground">
          <template v-if="action === 'delete'">
            This permanently deletes <strong>{{ teamName }}</strong> for every
            member. This can’t be undone.
          </template>
          <template v-else>
            You will lose access to <strong>{{ teamName }}</strong>. An admin
            will need to invite you again if you want to rejoin.
          </template>
        </DialogDescription>
        <div class="mt-6 flex justify-end gap-2">
          <DialogClose as-child>
            <SharedButton type="button" variant="outline" :disabled="actionMutation.isPending.value">
              Cancel
            </SharedButton>
          </DialogClose>
          <SharedButton
            type="button"
            variant="destructive"
            :loading="actionMutation.isPending.value"
            @click="actionMutation.mutate()"
          >
            {{ buttonLabel }}
          </SharedButton>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
