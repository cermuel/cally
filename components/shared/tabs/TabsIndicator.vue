<script setup lang="ts">
import { TabsIndicator } from 'reka-ui'
import type { Component, HTMLAttributes } from 'vue'
import { cn } from '../../../lib/utils'

const props = withDefaults(defineProps<{
  as?: Component | string
  asChild?: boolean
  class?: HTMLAttributes['class']
}>(), {
  as: 'span',
})
</script>

<template>
  <TabsIndicator
    data-slot="tabs-indicator"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        'pointer-events-none absolute z-0 rounded-md bg-background shadow-sm transition-transform duration-200 ease-[var(--ease-in-out)] motion-reduce:transition-none group-data-[variant=line]/tabs-list:hidden group-data-[orientation=horizontal]/tabs-list:start-0 group-data-[orientation=horizontal]/tabs-list:top-1/2 group-data-[orientation=horizontal]/tabs-list:h-[var(--reka-tabs-indicator-thickness)] group-data-[orientation=horizontal]/tabs-list:w-[var(--reka-tabs-indicator-size)] group-data-[orientation=horizontal]/tabs-list:translate-x-[var(--reka-tabs-indicator-position)] group-data-[orientation=horizontal]/tabs-list:-translate-y-1/2 group-data-[orientation=vertical]/tabs-list:start-1/2 group-data-[orientation=vertical]/tabs-list:top-0 group-data-[orientation=vertical]/tabs-list:h-[var(--reka-tabs-indicator-size)] group-data-[orientation=vertical]/tabs-list:w-[var(--reka-tabs-indicator-thickness)] group-data-[orientation=vertical]/tabs-list:-translate-x-1/2 group-data-[orientation=vertical]/tabs-list:translate-y-[var(--reka-tabs-indicator-position)]',
        props.class,
      )
    "
  />
</template>
