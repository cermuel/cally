<script setup lang="ts">
defineProps<{
  image?: string;
  name?: string;
  pending: boolean;
  username: string;
}>();
</script>

<template>
  <header class="flex items-center gap-4">
    <UiPublicProfileAvatar
      :image="image"
      :name="name || username"
      size="md"
    />
    <div class="min-w-0">
      <span
        v-if="pending"
        class="block h-7 w-40 rounded bg-white/10 motion-safe:animate-pulse"
      />
      <h1
        v-else
        class="truncate text-2xl font-semibold tracking-tight text-white"
      >
        {{ name }}
      </h1>
      <p class="mt-0.5 text-sm text-muted-foreground">@{{ username }}</p>
    </div>
  </header>
</template>
