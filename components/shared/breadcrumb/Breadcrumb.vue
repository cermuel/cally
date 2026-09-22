<script setup lang="ts">
import type { BreadcrumbProps } from '../../../types/components/shared/breadcrumb.d'
import { cn } from '../../../lib/utils'

const props = defineProps<BreadcrumbProps>()
</script>

<template>
  <nav data-slot="breadcrumb" aria-label="breadcrumb" :class="cn(props.class)">
    <slot />
  </nav>
</template>
