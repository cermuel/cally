<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { useAttrs } from "vue";
import { cn } from "../../../lib/utils";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const attrs = useAttrs();
</script>

<template>
  <SwitchRoot
    v-slot="slotProps"
    data-slot="switch"
    v-bind="attrs"
    :class="
      cn(
        'peer cursor-pointer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80',
        props.class,
      )
    "
  >
    <SwitchThumb
      data-slot="switch-thumb"
      :class="
        cn(
          'pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground',
        )
      "
    >
      <slot name="thumb" v-bind="slotProps" />
    </SwitchThumb>
  </SwitchRoot>
</template>
