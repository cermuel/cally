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
import type { TeamInvite } from "~/utils/api/teams";

defineProps<{
  invite: TeamInvite | null;
  deleting: boolean;
}>();

const open = defineModel<boolean>("open", { default: false });
const emit = defineEmits<{ confirm: [] }>();
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
        <DialogTitle class="text-lg font-semibold">Delete invitation</DialogTitle>
        <DialogDescription class="mt-2 text-sm leading-6 text-muted-foreground">
          Delete the invitation for <strong>{{ invite?.email }}</strong>? They
          will no longer be able to join with this invite.
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
            Delete invitation
          </SharedButton>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
