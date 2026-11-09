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

const { due, snooze } = useTwoFactorReminder("prompt");
const open = ref(false);

watch(
  due,
  (isDue) => {
    if (!isDue) return;

    open.value = true;
    snooze();
  },
  { immediate: true },
);

const goToSettings = async () => {
  open.value = false;
  await navigateTo("/app/settings?tab=account");
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-1/2 rounded-xl border border-border bg-background p-6 shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      >
        <DialogTitle class="text-lg font-semibold">
          Protect your account with 2FA
        </DialogTitle>
        <DialogDescription class="mt-2 text-sm/6 text-muted-foreground">
          Two-factor authentication adds a second step when you log in: we email
          you a one-time code, so a stolen password alone isn’t enough to get
          into your account.
        </DialogDescription>

        <div
          class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
        >
          <DialogClose as-child>
            <SharedButton type="button" variant="outline">
              Maybe later
            </SharedButton>
          </DialogClose>
          <SharedButton type="button" @click="goToSettings">
            Enable 2FA
          </SharedButton>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
