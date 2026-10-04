<script setup lang="ts">
const props = defineProps<{
  id: string;
  variables: string[];
  activeIndex?: number;
  position?: {
    top: number;
    left: number;
  };
}>();

const emit = defineEmits<{
  select: [variable: string];
  activate: [index: number];
}>();

const listbox = ref<HTMLElement | null>(null);

watch(
  () => [props.activeIndex, props.variables] as const,
  async () => {
    await nextTick();
    listbox.value
      ?.querySelector<HTMLElement>("[aria-selected='true']")
      ?.scrollIntoView({ block: "nearest" });
  },
);
</script>

<template>
  <div
    v-if="variables.length"
    :id="id"
    ref="listbox"
    role="listbox"
    aria-label="Variable suggestions"
    class="absolute z-30 max-h-48 overflow-y-auto rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-lg"
    :class="
      position
        ? 'w-64 max-w-[calc(100%-1rem)]'
        : 'inset-x-0 top-full mt-1'
    "
    :style="
      position
        ? { top: `${position.top}px`, left: `${position.left}px` }
        : undefined
    "
  >
    <button
      v-for="(variable, index) in variables"
      :key="variable"
      :id="`${id}-option-${index}`"
      type="button"
      role="option"
      tabindex="-1"
      :aria-selected="index === activeIndex"
      class="flex w-full rounded-md px-2.5 py-2 font-mono text-xs transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring aria-selected:bg-accent aria-selected:text-accent-foreground"
      @mousedown.prevent
      @mousemove="emit('activate', index)"
      @click="emit('select', variable)"
    >
      {{ variable }}
    </button>
  </div>
</template>
