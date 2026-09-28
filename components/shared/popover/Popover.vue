<script setup lang="ts">
import { PopoverRoot } from 'reka-ui'
import { useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()
</script>

<template>
  <PopoverRoot data-slot="popover" v-bind="attrs">
    <slot />
  </PopoverRoot>
</template>
