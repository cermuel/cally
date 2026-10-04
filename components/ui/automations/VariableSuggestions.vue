<script setup lang="ts">
defineProps<{
  variables: string[];
}>();

const emit = defineEmits<{
  select: [variable: string];
}>();
</script>

<template>
  <div
    v-if="variables.length"
    role="listbox"
    aria-label="Variable suggestions"
    class="absolute inset-x-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-lg"
  >
    <button
      v-for="variable in variables"
      :key="variable"
      type="button"
      role="option"
      class="flex w-full rounded-md px-2.5 py-2 font-mono text-xs transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
      @mousedown.prevent
      @click="emit('select', variable)"
    >
      {{ variable }}
    </button>
  </div>
</template>
