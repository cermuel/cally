<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <header class="mb-8 max-w-3xl space-y-2">
    <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">
      {{ title }}
    </h1>
    <p class="text-sm leading-6 text-muted-foreground sm:text-base">
      {{ description }}
    </p>
  </header>
</template>
