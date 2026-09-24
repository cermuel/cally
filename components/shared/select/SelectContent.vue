<script setup lang="ts">
import { SelectContent, SelectPortal, SelectViewport } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { inject, useAttrs } from 'vue'
import { cn } from '../../../lib/utils'
import { SELECT_FILTER_CONTEXT_KEY } from './filter'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  position?: 'popper' | 'item-aligned'
}>(), {
  position: 'popper',
})

const attrs = useAttrs()
const filterContext = inject(SELECT_FILTER_CONTEXT_KEY, null)
</script>

<template>
  <SelectPortal>
    <SelectContent
      data-slot="select-content"
      v-bind="attrs"
      :position="position"
      :class="cn('bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border shadow-md origin-[--reka-select-content-transform-origin]', position === 'popper' && 'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1', props.class)"
    >
      <div v-if="filterContext?.enabled.value" class="border-b p-1">
        <input
          v-model="filterContext.query.value"
          type="search"
          :placeholder="filterContext.placeholder.value"
          class="h-8 w-full rounded-sm bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground focus:bg-accent/50"
          @keydown.stop
        >
      </div>
      <SelectViewport :class="cn('p-1', position === 'popper' && 'max-h-[var(--reka-select-content-available-height)] w-full min-w-[var(--reka-select-trigger-width)] scroll-my-1')">
        <slot />
      </SelectViewport>
    </SelectContent>
  </SelectPortal>
</template>
