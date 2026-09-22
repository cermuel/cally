<script setup lang="ts">
import type { CardFooterProps } from '../../../types/components/shared/card.d'
import { cn } from '../../../lib/utils'

const props = defineProps<CardFooterProps>()
</script>

<template>
  <div data-slot="card-footer" :class="cn('flex items-center px-6 [.border-t]:pt-6', props.class)">
    <slot />
  </div>
</template>
