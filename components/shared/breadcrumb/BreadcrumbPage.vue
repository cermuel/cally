<script setup lang="ts">
import type { BreadcrumbPageProps } from '../../../types/components/shared/breadcrumb.d'
import { cn } from '../../../lib/utils'

const props = defineProps<BreadcrumbPageProps>()
</script>

<template>
  <span
    data-slot="breadcrumb-page"
    role="link"
    aria-disabled="true"
    aria-current="page"
    :class="cn('font-normal text-foreground', props.class)"
  >
    <slot />
  </span>
</template>
