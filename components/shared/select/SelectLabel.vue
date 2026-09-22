<script setup lang="ts">
import type { SelectLabelSharedProps } from '../../../types/components/shared/select.d'
import { SelectLabel } from 'reka-ui'
import { cn } from '../../../lib/utils'

const props = defineProps<SelectLabelSharedProps>()
</script>

<template>
  <SelectLabel data-slot="select-label" v-bind="props" :class="cn('px-2 py-1.5 text-sm font-medium', props.class)">
    <slot />
  </SelectLabel>
</template>
