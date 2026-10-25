<script setup lang="ts">
import {
  ChevronDownIcon,
  LoaderCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { SelectIcon, SelectTrigger } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { computed, inject, useAttrs } from "vue";
import { cn } from "../../../lib/utils";
import { SELECT_CONTEXT_KEY } from "./context";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  class?: HTMLAttributes["class"];
  size?: "sm" | "default";
}>();

const attrs = useAttrs();
const selectContext = inject(SELECT_CONTEXT_KEY, null);
const loading = computed(() => selectContext?.loading.value ?? false);
</script>

<template>
  <SelectTrigger
    data-slot="select-trigger"
    :data-size="size ?? 'default'"
    :data-loading="loading ? '' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    v-bind="attrs"
    :class="
      cn(
        'group border-input data-placeholder:text-muted-foreground [&_svg:not([class*=text-])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 dark:bg-input/30 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
        props.class,
      )
    "
  >
    <slot />
    <SelectIcon as-child>
      <HugeiconsIcon
        :icon="loading ? LoaderCircleIcon : ChevronDownIcon"
        :size="16"
        color="currentColor"
        :stroke-width="1.75"
        :class="
          loading
            ? 'animate-spin opacity-50'
            : 'opacity-50 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-data-[state=open]:rotate-180 motion-reduce:transition-none'
        "
        aria-hidden="true"
      />
    </SelectIcon>
  </SelectTrigger>
</template>
