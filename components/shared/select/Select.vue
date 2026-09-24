<script setup lang="ts">
import { SelectRoot } from 'reka-ui'
import { computed, provide, ref, useAttrs } from 'vue'
import { SELECT_FILTER_CONTEXT_KEY } from './filter'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  filter?: boolean | string
}>()

const attrs = useAttrs()
const filterQuery = ref('')

provide(SELECT_FILTER_CONTEXT_KEY, {
  enabled: computed(() => props.filter !== false && props.filter !== undefined),
  placeholder: computed(() => typeof props.filter === 'string' ? props.filter : 'Search...'),
  query: filterQuery,
})
</script>

<template>
  <SelectRoot data-slot="select" v-bind="attrs">
    <slot />
  </SelectRoot>
</template>
