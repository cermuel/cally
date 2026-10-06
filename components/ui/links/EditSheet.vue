<script setup lang="ts">
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import type { Link, UpdateLinkPayload } from "~/utils/api/links";

defineProps<{
  link: Link | null;
  username?: string | null;
  saving: boolean;
  deleting: boolean;
  errors?: Record<string, string[]>;
}>();

const open = defineModel<boolean>("open", { default: false });

defineEmits<{
  delete: [link: Link];
  save: [payload: UpdateLinkPayload];
}>();
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none"
      />
      <DialogContent
        class="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-b-0 border-border bg-background shadow-[0_-16px_48px_oklch(0_0_0/0.16)] outline-none duration-250 ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom motion-reduce:duration-200 motion-reduce:ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:data-[state=closed]:fade-out-0 motion-reduce:data-[state=open]:fade-in-0 motion-reduce:data-[state=closed]:slide-out-to-bottom-0 motion-reduce:data-[state=open]:slide-in-from-bottom-0 md:inset-y-0 md:start-auto md:end-0 md:mx-0 md:h-dvh md:max-h-none md:w-120 md:max-w-full md:rounded-none md:border-y-0 md:border-e-0 md:shadow-[-16px_0_48px_oklch(0_0_0/0.14)] md:data-[state=closed]:slide-out-to-bottom-0 md:data-[state=open]:slide-in-from-bottom-0 md:data-[state=closed]:slide-out-to-right md:data-[state=open]:slide-in-from-right"
      >
        <div class="flex justify-center pt-2 md:hidden" aria-hidden="true">
          <span class="h-1 w-9 rounded-full bg-border" />
        </div>

        <template v-if="link">
          <header
            class="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4"
          >
            <DialogTitle class="flex-1 text-sm font-medium">
              Edit link
            </DialogTitle>
            <DialogDescription class="sr-only">
              Edit link details
            </DialogDescription>
            <DialogClose as-child>
              <SharedButton
                type="button"
                variant="ghost"
                size="icon-sm"
                class="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="Close link details"
              >
                <HugeiconsIcon
                  :icon="Cancel01Icon"
                  :size="17"
                  :stroke-width="1.75"
                  aria-hidden="true"
                />
              </SharedButton>
            </DialogClose>
          </header>

          <UiLinksDetailsForm
            :link="link"
            :username="username"
            :saving="saving"
            :deleting="deleting"
            :errors="errors"
            sheet
            @delete="$emit('delete', $event)"
            @save="$emit('save', $event)"
          />
        </template>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
