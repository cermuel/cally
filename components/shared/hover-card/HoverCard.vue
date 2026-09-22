<script setup lang="ts">
import type { HoverCardProps } from '../../../types/components/shared/hover-card.d'
import { HoverCardRoot } from 'reka-ui'

const props = defineProps<HoverCardProps>()
</script>

<template>
  <HoverCardRoot data-slot="hover-card" v-bind="props">
    <slot />
  </HoverCardRoot>
</template>
