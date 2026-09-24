<script setup lang="ts">
import type { BreadcrumbEllipsisProps } from '../../../types/components/shared/breadcrumb.d'
import { MoreHorizontalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { cn } from '../../../lib/utils'

const props = defineProps<BreadcrumbEllipsisProps>()
</script>

<template>
  <span
    data-slot="breadcrumb-ellipsis"
    role="presentation"
    aria-hidden="true"
    :class="cn('flex size-9 items-center justify-center', props.class)"
  >
    <HugeiconsIcon :icon="MoreHorizontalIcon" :size="16" color="currentColor" :stroke-width="1.75" />
    <span class="sr-only">More</span>
  </span>
</template>
