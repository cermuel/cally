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

const emit = defineEmits<{
  submit: [note: string];
}>();

const open = defineModel<boolean>("open", { default: false });
const note = ref("");

watch(open, (isOpen) => {
  if (!isOpen) note.value = "";
});

const submit = () => {
  emit("submit", note.value.trim());
  open.value = false;
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed left-1/2 top-1/4 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-5 shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      >
        <form @submit.prevent="submit">
          <DialogTitle class="font-semibold">Request a new time</DialogTitle>
          <DialogDescription class="mt-1 text-sm text-muted-foreground">
            The meeting stays confirmed until you both agree on a new time.
          </DialogDescription>
          <SharedLabel
            for="reschedule-note"
            class="mb-1.5 mt-4 block text-xs text-muted-foreground"
          >
            Times that work for you
          </SharedLabel>
          <SharedTextarea
            id="reschedule-note"
            v-model="note"
            name="reschedule-note"
            :rows="3"
            required
            placeholder="Wednesday after 2pm, or Friday morning"
          />
          <div class="mt-4 flex justify-end gap-2">
            <DialogClose as-child>
              <SharedButton type="button" variant="ghost" size="sm"
                >Cancel</SharedButton
              >
            </DialogClose>
            <SharedButton type="submit" size="sm" :disabled="!note.trim()">
              Send
            </SharedButton>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
