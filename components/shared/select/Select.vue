<script setup lang="ts">
import type { SelectProps } from '../../../types/components/shared/select.d'
import { SelectRoot } from 'reka-ui'

const props = defineProps<SelectProps>()
</script>

<template>
  <SelectRoot data-slot="select" v-bind="props">
    <slot />
  </SelectRoot>
</template>
