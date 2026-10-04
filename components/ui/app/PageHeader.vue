<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>

<template>
  <header class="mb- max-w-3xl space-y-2">
    <h1 class="text-lg font-semibold tracking-tight sm:text-2xl">
      {{ title }}
    </h1>
    <!-- <p class="text-sm leading-6 text-muted-foreground sm:text-base">
      {{ description }}
    </p> -->
  </header>
</template>
