<script setup lang="ts">
import type { BadgeProps } from '../../../types/components/shared/badge.d'
import { Primitive } from 'reka-ui'
import { cn } from '../../../lib/utils'
import { badgeVariants } from './variants'

const props = withDefaults(defineProps<BadgeProps>(), {
  as: 'span',
})
</script>

<template>
  <Primitive
    data-slot="badge"
    :as="as"
    :as-child="asChild"
    :class="cn(badgeVariants({ variant }), props.class)"
  >
    <slot />
  </Primitive>
</template>
