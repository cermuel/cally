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

const props = defineProps<{
  confirmText: string;
  deleting?: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
}>();

const open = defineModel<boolean>("open", { default: false });
const typed = ref("");
const canDelete = computed(() => typed.value.trim() === props.confirmText);

watch(open, (isOpen) => {
  if (!isOpen) typed.value = "";
});

const submit = () => {
  if (canDelete.value && !props.deleting) emit("confirm");
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed left-1/2 top-1/3 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        @escape-key-down="deleting && $event.preventDefault()"
        @pointer-down-outside="deleting && $event.preventDefault()"
      >
        <form @submit.prevent="submit">
          <DialogTitle class="text-lg font-semibold"
            >Delete your account?</DialogTitle
          >
          <DialogDescription
            class="mt-2 text-sm leading-6 text-muted-foreground"
          >
            This permanently deletes your profile, booking links, availability,
            and booking history. You can’t undo this.
          </DialogDescription>

          <SharedLabel
            for="delete-account-confirmation"
            class="mb-1.5 mt-5 text-sm"
          >
            Type
            <span class="font-mono font-semibold text-foreground">{{
              confirmText
            }}</span>
            to confirm
          </SharedLabel>
          <SharedInput
            id="delete-account-confirmation"
            v-model="typed"
            name="delete-account-confirmation"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            :placeholder="confirmText"
            :disabled="deleting"
          />

          <div
            class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
          >
            <DialogClose as-child>
              <SharedButton type="button" variant="outline" :disabled="deleting"
                >Cancel</SharedButton
              >
            </DialogClose>
            <SharedButton
              type="submit"
              variant="destructive"
              :disabled="!canDelete"
              :loading="deleting"
            >
              Delete account
            </SharedButton>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
