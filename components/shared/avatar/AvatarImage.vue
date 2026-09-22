<script setup lang="ts">
import type { SharedAvatarImageProps } from '../../../types/components/shared/avatar.d'
import { AvatarImage } from 'reka-ui'
import { cn } from '../../../lib/utils'

const props = defineProps<SharedAvatarImageProps>()
</script>

<template>
  <AvatarImage data-slot="avatar-image" v-bind="props" :class="cn('aspect-square size-full', props.class)" />
</template>
