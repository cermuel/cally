<script setup lang="ts">
import { PopoverTrigger } from 'reka-ui'
</script>

<template>
  <PopoverTrigger data-slot="popover-trigger" v-bind="$attrs">
    <slot />
  </PopoverTrigger>
</template>
