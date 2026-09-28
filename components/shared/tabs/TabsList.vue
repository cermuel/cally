<script setup lang="ts">
import { TabsList } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { useAttrs } from 'vue'
import { cn } from '../../../lib/utils'
import { tabsListVariants } from './variants'
import TabsIndicator from './TabsIndicator.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  showIndicator?: boolean
  variant?: 'default' | 'line'
}>(), {
  showIndicator: true,
  variant: 'default',
})
const attrs = useAttrs()
</script>

<template>
  <TabsList
    data-slot="tabs-list"
    :data-variant="variant"
    v-bind="attrs"
    :class="cn(tabsListVariants({ variant }), props.class)"
  >
    <slot />
    <TabsIndicator v-if="showIndicator" />
  </TabsList>
</template>
