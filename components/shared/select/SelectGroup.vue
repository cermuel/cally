<script setup lang="ts">
import { SelectGroup } from 'reka-ui'
</script>

<template>
  <SelectGroup data-slot="select-group" v-bind="$attrs">
    <slot />
  </SelectGroup>
</template>
