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
import { automationsApi, type Automation } from "~/utils/api/automations";
import { getApiErrorMessage } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";

const props = defineProps<{
  automation: Automation | null;
}>();

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{
  deleted: [id: number];
}>();

const client = useApiClient();
const queryClient = useQueryClient();

const deleteMutation = useMutation({
  mutationFn: (id: number) => automationsApi.remove(client, id),
  onSuccess: async (_response, id) => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.automations.list(),
    });
    open.value = false;
    emit("deleted", id);
    toast.success("Automation deleted");
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not delete the automation.")),
});

const deleteAutomation = () => {
  if (props.automation) deleteMutation.mutate(props.automation.id);
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-60 bg-black/60 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed left-1/2 top-1/3 z-60 w-[calc(100%-2rem)] max-w-125 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      >
        <DialogTitle class="text-lg font-semibold">Delete automation</DialogTitle>
        <DialogDescription class="mt-2 text-sm leading-6 text-muted-foreground">
          Are you sure you want to delete
          <strong>{{ automation?.name }}</strong>? It will stop running and this
          can’t be undone.
        </DialogDescription>
        <div class="mt-6 flex justify-end gap-2">
          <DialogClose as-child>
            <SharedButton
              type="button"
              variant="outline"
              :disabled="deleteMutation.isPending.value"
            >
              Cancel
            </SharedButton>
          </DialogClose>
          <SharedButton
            type="button"
            variant="destructive"
            :loading="deleteMutation.isPending.value"
            @click="deleteAutomation"
          >
            Delete automation
          </SharedButton>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
