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
import type { Contact } from "~/utils/api/contacts";

const props = defineProps<{
  contact?: Contact | null;
  count?: number;
  deleting: boolean;
}>();

const open = defineModel<boolean>("open", { default: false });
const emit = defineEmits<{ confirm: [] }>();

const total = computed(() => props.count ?? (props.contact ? 1 : 0));
const title = computed(() =>
  total.value === 1 ? "Delete contact" : `Delete ${total.value} contacts`,
);
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
          <template v-if="contact">
            Are you sure you want to delete
            <strong>{{ contact.name || contact.email }}</strong>?
          </template>
          <template v-else>
            Are you sure you want to delete the selected contacts?
          </template>
          This can’t be undone.
        </DialogDescription>
        <div class="mt-6 flex justify-end gap-2">
          <DialogClose as-child>
            <SharedButton type="button" variant="outline" :disabled="deleting">
              Cancel
            </SharedButton>
          </DialogClose>
          <SharedButton
            type="button"
            variant="destructive"
            :loading="deleting"
            @click="emit('confirm')"
          >
            {{ total === 1 ? "Delete contact" : "Delete contacts" }}
          </SharedButton>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
