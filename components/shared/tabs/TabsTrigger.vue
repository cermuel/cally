<script setup lang="ts">
import { TabsTrigger } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { useAttrs } from "vue";
import { cn } from "../../../lib/utils";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  class?: HTMLAttributes["class"];
  disabled?: boolean;
  value: string | number;
}>();
const attrs = useAttrs();
</script>

<template>
  <TabsTrigger
    data-slot="tabs-trigger"
    v-bind="attrs"
    :disabled="disabled"
    :value="value"
    :class="
      cn(
        'relative z-10 inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 outline-none transition-[border-color,box-shadow,color,opacity,transform] duration-150 ease-out group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none dark:text-muted-foreground dark:hover:text-foreground dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
        'after:absolute after:scale-x-75 after:bg-foreground after:opacity-0 after:transition-[opacity,transform] after:duration-200 after:ease-out group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:-bottom-1 group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-inset-e-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:scale-x-100 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100 motion-reduce:after:transition-none',
        props.class,
      )
    "
  >
    <slot />
  </TabsTrigger>
</template>
