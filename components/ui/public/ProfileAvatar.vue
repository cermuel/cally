<script setup lang="ts">
defineProps<{
  image?: string;
  name: string;
  size?: "sm" | "md" | "lg";
}>();
</script>

<template>
  <SharedAvatar
    class="grid shrink-0 rounded-full overflow-hidden place-items-center bg-muted font-semibold text-foreground shadow-[inset_0_0_0_1px_oklch(1_0_0/0.14)]"
    :class="{
      'size-8': size === 'sm',
      'size-14': size !== 'sm' && size !== 'lg',
      'size-16': size === 'lg',
    }"
    :image="image"
    :name="name"
  />
</template>
