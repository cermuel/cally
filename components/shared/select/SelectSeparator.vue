<script setup lang="ts">
import type { SelectSeparatorSharedProps } from '../../../types/components/shared/select.d'
import { SelectSeparator } from 'reka-ui'
import { cn } from '../../../lib/utils'

const props = defineProps<SelectSeparatorSharedProps>()
</script>

<template>
  <SelectSeparator data-slot="select-separator" v-bind="props" :class="cn('-mx-1 my-1 h-px bg-border', props.class)" />
</template>
