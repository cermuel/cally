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

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    closeLabel?: string;
    size?: "default" | "compact";
  }>(),
  {
    closeLabel: "Close panel",
    size: "default",
  },
);

const open = defineModel<boolean>("open", { default: false });
const isClosing = ref(false);
let closeTimer: number | undefined;

const finishClose = () => {
  open.value = false;
  isClosing.value = false;
  closeTimer = undefined;
};

const requestClose = () => {
  if (isClosing.value) return;
  isClosing.value = true;
  closeTimer = window.setTimeout(
    finishClose,
    reduceMotion.value ? 0 : 280,
  );
};

const { handleClick, isDragging, isFull, reduceMotion, sheet, startDrag } =
  useSheetSnap(open, requestClose);

const setDialogOpen = (nextOpen: boolean) => {
  if (nextOpen) {
    open.value = true;
    return;
  }
  requestClose();
};

onBeforeUnmount(() => {
  if (closeTimer !== undefined) window.clearTimeout(closeTimer);
});

const desktopWidth = computed(() =>
  props.size === "compact" ? "md:w-110" : "md:w-120",
);
</script>

<template>
  <DialogRoot :open="open" @update:open="setDialogOpen">
    <DialogPortal>
      <DialogOverlay
        class="sheet-overlay fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none motion-reduce:transition-none"
        :data-closing="isClosing || undefined"
      />
      <DialogContent
        ref="sheet"
        class="responsive-sheet fixed inset-x-0 bottom-0 z-50 mx-auto flex h-dvh w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-b-0 border-border bg-background shadow-[0_-16px_48px_oklch(0_0_0/0.16)] outline-none md:inset-y-0 md:start-auto md:end-0 md:mx-0 md:max-w-full md:rounded-none md:border-y-0 md:border-e-0 md:shadow-[-16px_0_48px_oklch(0_0_0/0.14)]"
        :class="desktopWidth"
        :data-dragging="isDragging || undefined"
        :data-full="isFull || undefined"
        :data-closing="isClosing || undefined"
      >
        <button
          type="button"
          class="sheet-grabber flex h-5 shrink-0 cursor-grab touch-none items-center justify-center outline-none active:cursor-grabbing md:hidden"
          :class="isFull ? 'invisible pointer-events-none' : undefined"
          :disabled="isFull"
          :aria-hidden="isFull || undefined"
          aria-label="Expand panel"
          :aria-expanded="isFull"
          @click="handleClick"
          @pointerdown="startDrag"
        >
          <span class="h-1 w-9 rounded-full bg-border" aria-hidden="true" />
        </button>

        <header
          class="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4"
        >
          <DialogTitle class="flex-1 text-sm font-medium">
            {{ title }}
          </DialogTitle>
          <DialogDescription class="sr-only">
            {{ description }}
          </DialogDescription>
          <slot name="actions" />
          <DialogClose as-child>
            <SharedButton
              type="button"
              variant="ghost"
              size="icon-sm"
              class="shrink-0 text-muted-foreground hover:text-foreground"
              :aria-label="closeLabel"
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

        <slot />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.responsive-sheet {
  --sheet-offset: 40dvh;
  transform: translateY(var(--sheet-offset));
  transition: transform 280ms var(--ease-drawer);
  will-change: transform;
}

.responsive-sheet[data-state="closed"] {
  transform: translateY(100%);
}

.responsive-sheet[data-closing="true"] {
  transform: translateY(100%);
}

.sheet-overlay[data-closing="true"] {
  opacity: 0;
}

.responsive-sheet[data-dragging="true"] {
  transition: none;
}

.responsive-sheet[data-full="true"] {
  border-radius: 0;
}

.sheet-grabber:focus-visible span {
  outline: 2px solid var(--ring);
  outline-offset: 3px;
}

@media (min-width: 48rem) {
  .responsive-sheet {
    transform: translateX(0);
    transition: transform 250ms var(--ease-drawer);
  }

  .responsive-sheet[data-state="closed"] {
    transform: translateX(100%);
  }

  .responsive-sheet[data-closing="true"] {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .responsive-sheet {
    transition: none;
  }
}
</style>
