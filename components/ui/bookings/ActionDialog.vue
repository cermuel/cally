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
  action: "cancel" | "decline" | "delete";
  submitting?: boolean;
}>();

const emit = defineEmits<{
  confirm: [reason?: string];
}>();

const open = defineModel<boolean>("open", { default: false });
const reason = ref("");

watch(open, (isOpen) => {
  if (!isOpen) reason.value = "";
});

const title = computed(
  () =>
    ({
      cancel: "Cancel this event?",
      decline: "Decline this invitation?",
      delete: "Delete this booking?",
    })[props.action],
);
const description = computed(
  () =>
    ({
      cancel: "The event will be cancelled and all guests will be notified.",
      decline: "The booking request will be declined and the guests will be notified.",
      delete:
        "This permanently removes the booking from your account. This action cannot be undone.",
    })[props.action],
);
const confirmLabel = computed(
  () =>
    ({
      cancel: "Cancel event",
      decline: "Decline invitation",
      delete: "Delete booking",
    })[props.action],
);
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs" />
      <DialogContent
        class="fixed left-1/2 top-1/4 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-xl outline-none"
      >
        <DialogTitle class="text-lg font-semibold">{{ title }}</DialogTitle>
        <DialogDescription class="mt-2 text-sm leading-6 text-muted-foreground">
          {{ description }}
        </DialogDescription>

        <div v-if="action !== 'delete'" class="mt-5 space-y-2">
          <SharedLabel for="booking-cancellation-reason"
            >Reason (optional)</SharedLabel
          >
          <SharedTextarea
            id="booking-cancellation-reason"
            v-model="reason"
            :rows="3"
            :placeholder="
              action === 'cancel'
                ? 'Let the guests know why the event was cancelled'
                : 'Let the guests know why you cannot accept'
            "
          />
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <DialogClose as-child>
            <SharedButton type="button" variant="outline" :disabled="submitting"
              >Go back</SharedButton
            >
          </DialogClose>
          <SharedButton
            :loading="submitting"
            type="button"
            variant="destructive"
            :disabled="submitting"
            @click="emit('confirm', reason.trim() || undefined)"
          >
            {{ confirmLabel }}
          </SharedButton>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
