<script setup lang="ts">
import {
  Cancel01Icon,
  CancelCircleIcon,
  CheckmarkCircle01Icon,
  InformationCircleIcon,
  LoaderCircleIcon,
  TriangleAlertIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { Toaster as Sonner } from "vue-sonner";
import type { PropType } from "vue";
import { h } from "vue";
import { cn } from "../../../lib/utils";
import "vue-sonner/style.css";

const props = defineProps({
  class: {
    type: null as unknown as PropType<unknown>,
    default: undefined,
  },
  icons: {
    type: Object,
    default: () => ({}),
  },
  position: {
    type: String,
    default: "top-center",
  },
  style: {
    type: Object,
    default: () => ({}),
  },
  theme: {
    type: String,
    default: "system",
  },
  toastOptions: {
    type: Object,
    default: () => ({}),
  },
});

const sonnerIcon = (icon: unknown) => {
  return () =>
    h(HugeiconsIcon, {
      color: "currentColor",
      icon,
      size: 18,
      strokeWidth: 1.75,
    });
};
</script>

<template>
  <Sonner
    data-slot="sonner"
    v-bind="props"
    :class="cn('toaster group pointer-events-auto', props.class)"
    :toast-options="{
      classes: {
        toast:
          'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
        description: 'group-[.toast]:text-muted-foreground',
        actionButton:
          'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
        cancelButton:
          'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
      },
      ...props.toastOptions,
    }"
    :icons="{
      success: sonnerIcon(CheckmarkCircle01Icon),
      info: sonnerIcon(InformationCircleIcon),
      warning: sonnerIcon(TriangleAlertIcon),
      error: sonnerIcon(CancelCircleIcon),
      loading: sonnerIcon(LoaderCircleIcon),
      close: sonnerIcon(Cancel01Icon),
      ...props.icons,
    }"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
      ...props.style,
    }"
  />
</template>
