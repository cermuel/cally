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
import { recurrencesApi, type Recurrence } from "~/utils/api/recurrences";

const props = defineProps<{ recurrence: Recurrence | null }>();
const open = defineModel<boolean>("open", { default: false });
const emit = defineEmits<{ deleted: [id: number] }>();
const client = useApiClient();
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (id: number) => recurrencesApi.remove(client, id),
  onSuccess: async (_response, id) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.recurrences.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() }),
    ]);
    open.value = false;
    toast.success("Recurring meeting deleted");
    emit("deleted", id);
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not delete the recurring meeting.")),
});
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-70 bg-black/55 backdrop-blur-xs data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none" />
      <DialogContent class="fixed inset-s-1/2 top-1/2 z-70 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-5 shadow-xl outline-none">
        <DialogTitle class="font-semibold">Delete recurring meeting?</DialogTitle>
        <DialogDescription class="mt-2 text-sm leading-6 text-muted-foreground">
          Every occurrence and the Google recurring event will be removed. This cannot be undone.
        </DialogDescription>
        <div class="mt-5 flex justify-end gap-2">
          <DialogClose as-child><SharedButton type="button" variant="outline" :disabled="mutation.isPending.value">Keep series</SharedButton></DialogClose>
          <SharedButton type="button" variant="destructive" :loading="mutation.isPending.value" :disabled="!recurrence" @click="recurrence && mutation.mutate(recurrence.id)">Delete series</SharedButton>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
