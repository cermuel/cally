<script setup lang="ts">
import type { SharedAvatarFallbackProps } from '../../../types/components/shared/avatar.d'
import { AvatarFallback } from 'reka-ui'
import { cn } from '../../../lib/utils'

const props = defineProps<SharedAvatarFallbackProps>()
</script>

<template>
  <AvatarFallback
    data-slot="avatar-fallback"
    v-bind="props"
    :class="cn('flex size-full items-center justify-center rounded-full bg-muted', props.class)"
  >
    <slot />
  </AvatarFallback>
</template>
