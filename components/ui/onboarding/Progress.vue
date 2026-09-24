<script setup lang="ts">
const props = defineProps<{ current: number; total: number }>()

const progress = computed(() => ((props.current + 1) / props.total) * 100)
const progressStyle = computed(() => ({
  background: `conic-gradient(var(--primary) ${progress.value}%, var(--muted) 0)`,
}))
</script>

<template>
  <div class="flex items-center gap-2" role="progressbar" :aria-valuenow="current + 1" :aria-valuemax="total">
    <span
      class="grid size-6 rounded-full transition-[background] duration-500 ease-out after:m-[3px] after:rounded-full after:bg-card after:content-['']"
      :style="progressStyle"
      aria-hidden="true"
    />
    <span class="text-xs tabular-nums text-muted-foreground">{{ current + 1 }}/{{ total }}</span>
  </div>
</template>
