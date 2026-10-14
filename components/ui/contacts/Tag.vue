<script setup lang="ts">
import { getContactTagColor } from "~/constants/contact-tags";

defineProps<{
  tag: string;
}>();
</script>

<template>
  <span
    class="inline-flex max-w-full items-center truncate rounded-md px-2 py-0.5 text-xs font-medium text-black ring-1 ring-black/10"
    :style="{ backgroundColor: getContactTagColor(tag) }"
  >
    {{ tag }}
  </span>
</template>
