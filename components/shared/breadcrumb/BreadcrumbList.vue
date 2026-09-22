<script setup lang="ts">
import type { BreadcrumbListProps } from '../../../types/components/shared/breadcrumb.d'
import { cn } from '../../../lib/utils'

const props = defineProps<BreadcrumbListProps>()
</script>

<template>
  <ol
    data-slot="breadcrumb-list"
    :class="cn('flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5', props.class)"
  >
    <slot />
  </ol>
</template>
