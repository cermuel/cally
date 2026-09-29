<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "../../../lib/utils";

const props = defineProps<{
  image?: string;
  name: string;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div
    data-slot="avatar"
    :class="
      cn(
        'relative flex size-8 shrink-0 overflow-hidden rounded-full',
        props.class,
      )
    "
  >
    <img
      :src="
        props.image ||
        `https://api.dicebear.com/10.x/glass/svg?seed=${encodeURIComponent(props.name)}`
      "
      :alt="props.name"
      class="size-full object-cover"
    />
  </div>
</template>
