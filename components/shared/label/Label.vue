<script setup lang="ts">
import type { LabelProps as SharedLabelProps } from '../../../types/components/shared/label.d'
import { Label } from 'reka-ui'
import { cn } from '../../../lib/utils'

const props = defineProps<SharedLabelProps>()
</script>

<template>
  <Label
    data-slot="label"
    v-bind="props"
    :class="cn('flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50', props.class)"
  >
    <slot />
  </Label>
</template>
