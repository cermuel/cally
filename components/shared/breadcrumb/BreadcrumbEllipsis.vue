<script setup lang="ts">
import type { BreadcrumbEllipsisProps } from '../../../types/components/shared/breadcrumb.d'
import { MoreHorizontalIcon } from '@lucide/vue'
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
    <MoreHorizontalIcon class="size-4" />
    <span class="sr-only">More</span>
  </span>
</template>
