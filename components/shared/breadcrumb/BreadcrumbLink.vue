<script setup lang="ts">
import type { BreadcrumbLinkProps } from '../../../types/components/shared/breadcrumb.d'
import { Primitive } from 'reka-ui'
import { cn } from '../../../lib/utils'

const props = withDefaults(defineProps<BreadcrumbLinkProps>(), {
  as: 'a',
})
</script>

<template>
  <Primitive
    data-slot="breadcrumb-link"
    :as="as"
    :as-child="asChild"
    :class="cn('transition-colors hover:text-foreground', props.class)"
  >
    <slot />
  </Primitive>
</template>
