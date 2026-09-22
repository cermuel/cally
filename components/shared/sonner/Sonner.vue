<script setup lang="ts">
import type { SonnerProps } from '../../../types/components/shared/sonner.d'
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon, XIcon } from '@lucide/vue'
import { Toaster as Sonner } from 'vue-sonner'
import { cn } from '../../../lib/utils'
import 'vue-sonner/style.css'

const props = withDefaults(defineProps<SonnerProps>(), {
  position: 'bottom-right',
  theme: 'system',
})
</script>

<template>
  <Sonner
    data-slot="sonner"
    v-bind="props"
    :class="cn('toaster group pointer-events-auto', props.class)"
    :toast-options="{
      classes: {
        toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
        description: 'group-[.toast]:text-muted-foreground',
        actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
        cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
      },
      ...props.toastOptions,
    }"
    :icons="{
      success: CircleCheckIcon,
      info: InfoIcon,
      warning: TriangleAlertIcon,
      error: OctagonXIcon,
      loading: Loader2Icon,
      close: XIcon,
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
