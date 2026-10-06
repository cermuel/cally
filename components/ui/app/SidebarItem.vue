<script setup lang="ts">
import { ChevronDownIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

defineProps<{
  label: string;
  to: string;
  icon: typeof ChevronDownIcon;
  active: boolean;
  compact: boolean;
  hasChildren?: boolean;
  hideCopy: boolean;
  settling: boolean;
}>();

const expanded = ref(false);
const childrenId = useId();
</script>

<template>
  <div :class="compact && 'flex flex-col items-center'">
    <div
      class="group relative flex h-7.5 items-center rounded-[10px] text-[13px] font-medium text-muted-foreground transition-[background-color,color,transform] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:bg-sidebar-accent/50"
      :class="[
        compact ? 'w-10 justify-center' : 'min-w-0',
        active &&
          !settling &&
          'bg-sidebar-accent text-sidebar-accent-foreground dark:bg-sidebar-accent/50',
        active && 'text-sidebar-accent-foreground',
      ]"
    >
      <NuxtLink
        :to="to"
        class="flex min-w-0 flex-1 items-center rounded-[10px] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring"
        :class="compact ? 'justify-center' : 'gap-3 px-2'"
        :aria-label="compact ? label : undefined"
        :title="label"
      >
        <HugeiconsIcon
          :icon="icon"
          :size="16"
          :stroke-width="active ? 2 : 1.5"
          class="shrink-0"
          aria-hidden="true"
        />
        <span
          class="sidebar-copy truncate"
          :class="hideCopy && 'sidebar-copy--hidden'"
          :aria-hidden="hideCopy ? 'true' : undefined"
        >
          {{ label }}
        </span>
      </NuxtLink>
      <button
        v-if="hasChildren && !compact"
        type="button"
        class="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-[color,transform] hover:text-sidebar-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring active:scale-[0.96]"
        :aria-expanded="expanded"
        :aria-controls="childrenId"
        :aria-label="`Toggle ${label.toLowerCase()} children`"
        @click="expanded = !expanded"
      >
        <HugeiconsIcon
          :icon="ChevronDownIcon"
          :size="16"
          :stroke-width="1.75"
          class="transition-transform"
          :class="!expanded && '-rotate-90'"
          aria-hidden="true"
        />
      </button>
    </div>

    <div
      v-if="hasChildren && !compact"
      class="sidebar-item-children"
      :class="expanded && 'sidebar-item-children--expanded'"
      :inert="!expanded || undefined"
      :aria-hidden="!expanded ? 'true' : undefined"
    >
      <div :id="childrenId" class="sidebar-item-children-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar-item-children {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  overflow: hidden;
  transition:
    grid-template-rows 200ms var(--ease-out),
    opacity 140ms var(--ease-out);
}

.sidebar-item-children--expanded {
  grid-template-rows: 1fr;
  opacity: 1;
}

.sidebar-item-children-content {
  min-height: 0;
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .sidebar-item-children {
    transition: opacity 120ms ease;
  }
}
</style>
