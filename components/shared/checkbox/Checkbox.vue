<script setup lang="ts">
import type { CheckboxRootEmits } from 'reka-ui'
import type { CheckboxProps } from '../../../types/components/shared/checkbox.d'
import { CheckIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from 'reka-ui'
import { computed } from 'vue'
import { cn } from '../../../lib/utils'

const props = defineProps<CheckboxProps>()
const emits = defineEmits<CheckboxRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <CheckboxRoot
    data-slot="checkbox"
    v-bind="forwarded"
    :class="cn('peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs outline-none transition-shadow focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40', props.class)"
  >
    <CheckboxIndicator data-slot="checkbox-indicator" class="flex items-center justify-center text-current">
      <HugeiconsIcon :icon="CheckIcon" :size="14" color="currentColor" :stroke-width="2.5" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
