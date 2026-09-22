<script setup lang="ts">
import { HoverCardTrigger } from 'reka-ui'
</script>

<template>
  <HoverCardTrigger data-slot="hover-card-trigger" v-bind="$attrs">
    <slot />
  </HoverCardTrigger>
</template>
