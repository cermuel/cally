<script setup lang="ts">
import type { PopoverProps } from '../../../types/components/shared/popover.d'
import { PopoverRoot } from 'reka-ui'

const props = defineProps<PopoverProps>()
</script>

<template>
  <PopoverRoot data-slot="popover" v-bind="props">
    <slot />
  </PopoverRoot>
</template>
