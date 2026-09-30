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

withDefaults(
  defineProps<{
    confirmLabel: string;
    description: string;
    destructive?: boolean;
    title: string;
  }>(),
  { destructive: false },
);

const emit = defineEmits<{
  confirm: [];
}>();

const open = defineModel<boolean>("open", { default: false });

const confirm = () => {
  open.value = false;
  emit("confirm");
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed left-1/2 top-1/4 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      >
        <DialogTitle class="text-lg font-semibold">{{ title }}</DialogTitle>
        <DialogDescription class="mt-2 text-sm leading-6 text-muted-foreground">
          {{ description }}
        </DialogDescription>
        <div
          class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
        >
          <DialogClose as-child>
            <SharedButton type="button" variant="outline">Go back</SharedButton>
          </DialogClose>
          <SharedButton
            type="button"
            :variant="destructive ? 'destructive' : 'default'"
            @click="confirm"
          >
            {{ confirmLabel }}
          </SharedButton>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
