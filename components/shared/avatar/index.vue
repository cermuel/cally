<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "../../../lib/utils";

const props = defineProps<{
  image?: string;
  name: string;
  class?: HTMLAttributes["class"];
}>();

const imageFailed = ref(false);
const fallbackImage = computed(
  () =>
    `https://api.dicebear.com/10.x/glass/svg?seed=${encodeURIComponent(props.name)}`,
);
const imageSource = computed(() =>
  props.image && !imageFailed.value ? props.image : fallbackImage.value,
);

watch(
  () => props.image,
  () => {
    imageFailed.value = false;
  },
);
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
      :src="imageSource"
      :alt="props.name"
      class="size-full object-cover"
      @error="imageFailed = true"
    />
  </div>
</template>
