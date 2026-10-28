<script setup lang="ts">
const props = defineProps<{
  buttonColor: string;
  buttonLabel: string;
  buttonTextColor: string;
  embedType: "inline" | "popup";
  src: string;
}>();

const dialog = useTemplateRef("dialog");
const inlineFrame = useTemplateRef("inlineFrame");
const popupFrame = useTemplateRef("popupFrame");
const inlineHeight = ref(560);
const popupHeight = 476;
const trigger = useTemplateRef("trigger");

const previewUrlLabel = computed(() => {
  const url = new URL(props.src);
  return url.host + url.pathname;
});
const openPopup = () => {
  document.documentElement.style.overflow = "hidden";
  dialog.value?.showModal();
};
const closePopup = () => dialog.value?.close();
const restoreTriggerFocus = () => {
  document.documentElement.style.overflow = "";
  trigger.value?.$el?.focus?.();
};

const receiveHeight = (event: MessageEvent) => {
  if (
    event.origin !== new URL(props.src).origin ||
    event.data?.source !== "cally" ||
    event.data?.type !== "resize" ||
    !Number.isFinite(event.data.height)
  ) {
    return;
  }

  if (event.source === inlineFrame.value?.contentWindow) {
    inlineHeight.value = Math.max(320, event.data.height);
  }

};

onMounted(() => window.addEventListener("message", receiveHeight));
onBeforeUnmount(() => {
  window.removeEventListener("message", receiveHeight);
  document.documentElement.style.overflow = "";
});
watch(
  () => props.src,
  () => {
    inlineHeight.value = 560;
  },
);
</script>

<template>
  <div class="preview-grid relative min-h-136 overflow-hidden p-4 sm:p-6">
    <div
      v-if="embedType === 'inline'"
      class="mx-auto max-w-2xl overflow-hidden rounded-xl bg-background shadow-[0_0_0_1px_oklch(0_0_0/0.08),0_18px_50px_oklch(0_0_0/0.12)] dark:shadow-[0_0_0_1px_oklch(1_0_0/0.1),0_18px_50px_oklch(0_0_0/0.32)]"
    >
      <div class="flex h-10 items-center gap-3 border-b border-border bg-muted/45 px-3">
        <div class="flex gap-1.5" aria-hidden="true">
          <span class="size-2 rounded-full bg-foreground/12" />
          <span class="size-2 rounded-full bg-foreground/12" />
          <span class="size-2 rounded-full bg-foreground/12" />
        </div>
        <div
          class="min-w-0 flex-1 truncate rounded-md bg-background/80 px-2.5 py-1 text-center text-[11px] text-muted-foreground shadow-xs"
        >
          {{ previewUrlLabel }}
        </div>
        <div class="w-8" aria-hidden="true" />
      </div>
      <iframe
        ref="inlineFrame"
        :key="src"
        :src="src"
        title="Cally inline embed preview"
        class="block w-full border-0 bg-transparent"
        :style="{ height: inlineHeight + 'px' }"
      />
    </div>

    <div
      v-else
      class="mx-auto min-h-120 max-w-3xl overflow-hidden rounded-xl bg-background shadow-[0_0_0_1px_oklch(0_0_0/0.08),0_18px_50px_oklch(0_0_0/0.12)] dark:shadow-[0_0_0_1px_oklch(1_0_0/0.1),0_18px_50px_oklch(0_0_0/0.32)]"
    >
      <div class="flex h-12 items-center justify-between border-b border-border px-4">
        <div class="h-2.5 w-18 rounded-full bg-foreground/12" />
        <div class="flex gap-4" aria-hidden="true">
          <span class="h-2 w-10 rounded-full bg-foreground/8" />
          <span class="h-2 w-12 rounded-full bg-foreground/8" />
        </div>
      </div>
      <div class="flex min-h-108 flex-col items-center justify-center px-6 text-center">
        <div class="h-3 w-48 rounded-full bg-foreground/12" />
        <div class="mt-3 h-2.5 w-64 max-w-full rounded-full bg-foreground/7" />
        <div class="mt-1.5 h-2.5 w-52 max-w-full rounded-full bg-foreground/7" />
        <SharedButton
          ref="trigger"
          type="button"
          class="mt-8 active:scale-96 transition-transform"
          :style="{ backgroundColor: buttonColor, color: buttonTextColor }"
          @click="openPopup"
        >
          {{ buttonLabel }}
        </SharedButton>
      </div>
    </div>

    <dialog
      ref="dialog"
      class="embed-preview-dialog m-auto w-[calc(100%_-_2rem)] max-w-2xl overflow-hidden rounded-2xl border-0 bg-transparent p-0 text-foreground"
      :style="{ height: popupHeight + 'px' }"
      aria-label="Booking preview"
      tabindex="-1"
      @close="restoreTriggerFocus"
      @click.self="closePopup"
    >
      <iframe
        ref="popupFrame"
        :key="src"
        :src="src"
        title="Cally popup embed preview"
        class="block size-full rounded-2xl border-0 bg-transparent"
      />
    </dialog>
  </div>
</template>

<style scoped>
.preview-grid {
  background-color: color-mix(in oklch, var(--muted) 35%, var(--background));
  background-image: radial-gradient(
    circle,
    color-mix(in oklch, var(--foreground) 8%, transparent) 1px,
    transparent 1px
  );
  background-size: 16px 16px;
}

.embed-preview-dialog {
  max-height: calc(100dvh - 2rem);
  opacity: 0;
  transform: scale(0.96);
  transition:
    opacity 250ms var(--ease-out),
    transform 250ms var(--ease-out),
    display 250ms allow-discrete,
    overlay 250ms allow-discrete;
}

.embed-preview-dialog[open] {
  opacity: 1;
  transform: scale(1);
}

.embed-preview-dialog::backdrop {
  background: oklch(0 0 0 / 0%);
  backdrop-filter: blur(3px);
  transition:
    background-color 250ms var(--ease-out),
    display 250ms allow-discrete,
    overlay 250ms allow-discrete;
}

.embed-preview-dialog[open]::backdrop {
  background: oklch(0 0 0 / 58%);
}

@starting-style {
  .embed-preview-dialog[open] {
    opacity: 0;
    transform: scale(0.96);
  }

  .embed-preview-dialog[open]::backdrop {
    background: oklch(0 0 0 / 0%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .embed-preview-dialog,
  .embed-preview-dialog[open] {
    transform: none;
  }

  .embed-preview-dialog {
    transition:
      opacity 200ms var(--ease-out),
      display 200ms allow-discrete,
      overlay 200ms allow-discrete;
  }
}

</style>
