<script setup lang="ts">
import { SelectRoot } from 'reka-ui'
import { computed, provide, ref, useAttrs } from 'vue'
import { SELECT_CONTEXT_KEY } from './context'
import { SELECT_FILTER_CONTEXT_KEY } from './filter'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  filter?: boolean | string
  loading?: boolean
}>()

const attrs = useAttrs()
const filterQuery = ref('')
const loading = computed(() => props.loading ?? false)

provide(SELECT_CONTEXT_KEY, {
  loading,
})

provide(SELECT_FILTER_CONTEXT_KEY, {
  enabled: computed(() => props.filter !== false && props.filter !== undefined),
  placeholder: computed(() => typeof props.filter === 'string' ? props.filter : 'Search...'),
  query: filterQuery,
})
</script>

<template>
  <SelectRoot
    data-slot="select"
    v-bind="attrs"
    :disabled="loading || attrs.disabled === true || attrs.disabled === ''"
  >
    <slot />
  </SelectRoot>
</template>
