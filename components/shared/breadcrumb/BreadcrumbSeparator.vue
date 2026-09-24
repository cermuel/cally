<script setup lang="ts">
import type { BreadcrumbSeparatorProps } from '../../../types/components/shared/breadcrumb.d'
import { ChevronRightIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { cn } from '../../../lib/utils'

const props = defineProps<BreadcrumbSeparatorProps>()
</script>

<template>
  <li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" :class="cn('[&>svg]:size-3.5', props.class)">
    <slot>
      <HugeiconsIcon :icon="ChevronRightIcon" :size="14" color="currentColor" :stroke-width="1.75" />
    </slot>
  </li>
</template>
