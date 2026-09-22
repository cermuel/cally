<script setup lang="ts">
import type { CardTitleProps } from '../../../types/components/shared/card.d'
import { cn } from '../../../lib/utils'

const props = defineProps<CardTitleProps>()
</script>

<template>
  <div data-slot="card-title" :class="cn('leading-none font-semibold', props.class)">
    <slot />
  </div>
</template>
