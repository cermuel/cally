<script setup lang="ts">
import type { SharedAvatarProps } from "../../../types/components/shared/avatar.d";
import { AvatarRoot } from "reka-ui";
import { cn } from "../../../lib/utils";

const props = defineProps<SharedAvatarProps>();
</script>

<template>
  <AvatarRoot
    data-slot="avatar"
    v-bind="props"
    :class="
      cn(
        'relative flex size-8 shrink-0 overflow-hidden rounded-full',
        props.class,
      )
    "
  >
    <slot />
  </AvatarRoot>
</template>
