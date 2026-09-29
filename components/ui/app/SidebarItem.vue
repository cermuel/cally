<script setup lang="ts">
import type { IconSvgObject } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

defineProps<{
  label: string;
  to: string;
  icon: IconSvgObject;
  active: boolean;
  compact: boolean;
  hideCopy: boolean;
  settling: boolean;
}>();
</script>

<template>
  <NuxtLink
    :to="to"
    class="group relative flex h-8 items-center rounded-[10px] text-sm font-medium text-muted-foreground transition-[background-color,color,transform] hover:bg-sidebar-accent dark:hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
    :class="[
      compact ? 'w-10 justify-center' : 'gap-3 px-2',
      active &&
        !settling &&
        'dark:bg-sidebar-accent/50 bg-sidebar-accent text-sidebar-accent-foreground',
      active && 'text-sidebar-accent-foreground',
    ]"
    :aria-label="compact ? label : undefined"
    :title="label"
  >
    <HugeiconsIcon
      :icon="icon"
      :size="18"
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
</template>
