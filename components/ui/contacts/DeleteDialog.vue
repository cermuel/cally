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
import { contactsApi } from "~/utils/api/contacts";
import { queryKeys } from "~/utils/api/query-keys";

const props = defineProps<{
  contactId?: number | null;
  contactLabel?: string | null;
  contactIds?: number[];
}>();

const open = defineModel<boolean>("open", { default: false });
const emit = defineEmits<{ deleted: [ids: number[]] }>();

const client = useApiClient();
const queryClient = useQueryClient();

const ids = computed(() =>
  props.contactId ? [props.contactId] : (props.contactIds ?? []),
);
const total = computed(() => ids.value.length);

const title = computed(() =>
  total.value === 1 ? "Delete contact" : `Delete ${total.value} contacts`,
);

const deleteMutation = useMutation({
  mutationFn: (contactIds: number[]) =>
    props.contactId
      ? contactsApi.remove(client, props.contactId)
      : contactsApi.removeMany(client, contactIds),
  onSuccess: async (_response, contactIds) => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.contacts.all(),
    });
    emit("deleted", contactIds);
    open.value = false;
    toast.success(
      contactIds.length === 1 ? "Contact deleted" : "Contacts deleted",
    );
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not delete the contacts.")),
});

const deleteContacts = () => {
  if (!ids.value.length) return;
  deleteMutation.mutate([...ids.value]);
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-60 bg-black/60 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed left-1/2 top-1/3 z-60 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      >
        <DialogTitle class="text-lg font-semibold">{{ title }}</DialogTitle>
        <DialogDescription class="mt-2 text-sm leading-6 text-muted-foreground">
          <template v-if="contactLabel">
            Are you sure you want to delete
            <strong>{{ contactLabel }}</strong>?
          </template>
          <template v-else>
            Are you sure you want to delete the selected contacts?
          </template>
          This can’t be undone.
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
            @click="deleteContacts"
          >
            {{ total === 1 ? "Delete contact" : "Delete contacts" }}
          </SharedButton>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
