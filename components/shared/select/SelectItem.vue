<script setup lang="ts">
import type { SelectItemSharedProps } from '../../../types/components/shared/select.d'
import { CheckIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { SelectItem, SelectItemIndicator, SelectItemText } from 'reka-ui'
import { cn } from '../../../lib/utils'

const props = defineProps<SelectItemSharedProps>()
</script>

<template>
  <SelectItem
    data-slot="select-item"
    v-bind="props"
    :class="cn('focus:bg-accent focus:text-accent-foreground [&_svg:not([class*=text-])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4', props.class)"
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
