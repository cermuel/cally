<script setup lang="ts">
import { CheckIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { SelectItem, SelectItemIndicator, SelectItemText } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../../lib/utils'
import { SELECT_FILTER_CONTEXT_KEY } from './filter'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  class?: HTMLAttributes['class']
  textValue?: string
  value?: unknown
}>()

const attrs = useAttrs()
const filterContext = inject(SELECT_FILTER_CONTEXT_KEY, null)

const searchableText = computed(() => {
  if (props.textValue) return props.textValue
  if (typeof props.value === 'string' || typeof props.value === 'number') return String(props.value)
  return ''
})

const isVisible = computed(() => {
  if (!filterContext?.enabled.value) return true

  const query = filterContext.query.value.trim().toLowerCase()
  if (!query) return true

  return searchableText.value.toLowerCase().includes(query)
})
</script>

<template>
  <SelectItem
    v-if="isVisible"
    data-slot="select-item"
    v-bind="attrs"
    :value="value"
    :text-value="textValue"
    :class="cn('focus:bg-accent focus:text-accent-foreground data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground [&_svg:not([class*=text-])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4', props.class)"
  >
    <span class="absolute right-2 flex size-3.5 items-center justify-center">
      <SelectItemIndicator>
        <HugeiconsIcon :icon="CheckIcon" :size="16" color="currentColor" :stroke-width="2.5" />
      </SelectItemIndicator>
    </span>
    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>
