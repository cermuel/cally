<script setup lang="ts">
import type { CardDescriptionProps } from '../../../types/components/shared/card.d'
import { cn } from '../../../lib/utils'

const props = defineProps<CardDescriptionProps>()
</script>

<template>
  <div data-slot="card-description" :class="cn('text-sm text-muted-foreground', props.class)">
    <slot />
  </div>
</template>
