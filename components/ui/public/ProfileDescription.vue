<script setup lang="ts">
defineProps<{
  description: string;
  pending: boolean;
}>();
</script>

<template>
  <div v-if="pending" class="mt-6 space-y-2">
    <span
      class="block h-4 w-full rounded bg-muted motion-safe:animate-pulse"
    />
    <span
      class="block h-4 w-2/3 rounded bg-muted motion-safe:animate-pulse"
    />
  </div>
  <div v-else-if="description" class="rich-text mt-6" v-html="description" />
</template>

<style scoped>
.rich-text {
  font-size: 15px;
  line-height: 1.65;
  color: color-mix(in oklch, var(--foreground) 65%, transparent);
  overflow-wrap: anywhere;
}
.rich-text :deep(> * + *) {
  margin-top: 0.75em;
}
.rich-text :deep(h1),
.rich-text :deep(h2),
.rich-text :deep(h3) {
  color: var(--foreground);
  font-weight: 600;
  line-height: 1.3;
  margin-top: 1.25em;
}
.rich-text :deep(h1) {
  font-size: 1.25rem;
}
.rich-text :deep(h2) {
  font-size: 1.125rem;
}
.rich-text :deep(h3) {
  font-size: 1rem;
}
.rich-text :deep(strong) {
  color: var(--foreground);
  font-weight: 600;
}
.rich-text :deep(a) {
  color: #fff;
  text-decoration: underline;
  text-decoration-color: color-mix(in oklch, var(--foreground) 30%, transparent);
  text-underline-offset: 3px;
  transition: text-decoration-color 0.15s;
}
.rich-text :deep(a:hover) {
  text-decoration-color: var(--foreground);
}
.rich-text :deep(ul),
.rich-text :deep(ol) {
  padding-left: 1.25rem;
}
.rich-text :deep(ul) {
  list-style: disc;
}
.rich-text :deep(ol) {
  list-style: decimal;
}
.rich-text :deep(li + li) {
  margin-top: 0.25em;
}
.rich-text :deep(li::marker) {
  color: color-mix(in oklch, var(--foreground) 30%, transparent);
}
.rich-text :deep(blockquote) {
  border-inline-start: 2px solid color-mix(in oklch, var(--foreground) 15%, transparent);
  padding-inline-start: 1rem;
  font-style: italic;
}
.rich-text :deep(code) {
  background: color-mix(in oklch, var(--foreground) 8%, transparent);
  border-radius: 4px;
  padding: 0.1em 0.35em;
  font-size: 0.9em;
  color: var(--foreground);
}
.rich-text :deep(hr) {
  border-color: color-mix(in oklch, var(--foreground) 10%, transparent);
}
.rich-text :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}
</style>
