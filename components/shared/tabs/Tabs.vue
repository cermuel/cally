<script setup lang="ts">
import { TabsRoot } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../../lib/utils'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  modelValue?: string | number
  orientation?: 'horizontal' | 'vertical'
}>(), {
  orientation: 'horizontal',
})
const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>

<template>
  <TabsRoot
    data-slot="tabs"
    :data-orientation="orientation"
    :model-value="modelValue"
    :orientation="orientation"
    :class="cn('group/tabs flex gap-2 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:flex-row', props.class)"
    @update:model-value="emit('update:modelValue', $event as string | number)"
  >
    <slot />
  </TabsRoot>
</template>
