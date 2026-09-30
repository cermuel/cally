<script setup lang="ts">
import { HoverCardRoot } from 'reka-ui'
</script>

<template>
  <HoverCardRoot data-slot="hover-card" v-bind="$attrs">
    <slot />
  </HoverCardRoot>
</template>
