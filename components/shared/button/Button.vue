<script setup lang="ts">
import type { ButtonProps } from '../../../types/components/shared/button.d'
import { Primitive } from 'reka-ui'
import { cn } from '../../../lib/utils'
import { buttonVariants } from './variants'

const props = withDefaults(defineProps<ButtonProps>(), {
  as: 'button',
})
</script>

<template>
  <Primitive
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </Primitive>
</template>
