<script setup lang="ts">
import { TabsContent } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { useAttrs } from "vue";
import { cn } from "../../../lib/utils";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  class?: HTMLAttributes["class"];
  value: string | number;
}>();
const attrs = useAttrs();
</script>

<template>
  <TabsContent
    data-slot="tabs-content"
    v-bind="attrs"
    :value="value"
    :class="
      cn(
        'flex-1 translate-y-0 opacity-100 outline-none transition-[opacity,transform] duration-150 ease-out data-[state=inactive]:translate-y-1 data-[state=inactive]:opacity-0 motion-reduce:translate-y-0 motion-reduce:transition-opacity',
        props.class,
      )
    "
  >
    <slot />
  </TabsContent>
</template>
