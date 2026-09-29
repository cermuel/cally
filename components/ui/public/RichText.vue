<script setup lang="ts">
defineProps<{ html: string }>();
</script>

<template>
  <div class="rich-text" v-html="html" />
</template>

<style scoped>
.rich-text {
  font-size: 15px;
  line-height: 1.65;
  color: rgb(255 255 255 / 0.65);
  overflow-wrap: anywhere;
}
.rich-text :deep(p),
.rich-text :deep(ul),
.rich-text :deep(ol),
.rich-text :deep(blockquote) {
  margin-top: 0.75em;
}
.rich-text :deep(h1),
.rich-text :deep(h2),
.rich-text :deep(h3) {
  color: #fff;
  font-weight: 600;
  line-height: 1.3;
  margin-top: 1.25em;
}
.rich-text :deep(h1) { font-size: 1.25rem; }
.rich-text :deep(h2) { font-size: 1.125rem; }
.rich-text :deep(h3) { font-size: 1rem; }
.rich-text :deep(strong) { color: #fff; font-weight: 600; }
.rich-text :deep(a) {
  color: #fff;
  text-decoration: underline;
  text-decoration-color: rgb(255 255 255 / 0.3);
  text-underline-offset: 3px;
  transition: text-decoration-color 0.15s;
}
.rich-text :deep(a:hover) { text-decoration-color: #fff; }
.rich-text :deep(ul),
.rich-text :deep(ol) { padding-left: 1.25rem; }
.rich-text :deep(ul) { list-style: disc; }
.rich-text :deep(ol) { list-style: decimal; }
.rich-text :deep(li + li) { margin-top: 0.25em; }
.rich-text :deep(li::marker) { color: rgb(255 255 255 / 0.3); }
.rich-text :deep(blockquote) {
  border-left: 2px solid rgb(255 255 255 / 0.15);
  padding-left: 1rem;
  font-style: italic;
}
.rich-text :deep(code) {
  background: rgb(255 255 255 / 0.08);
  border-radius: 4px;
  padding: 0.1em 0.35em;
  font-size: 0.9em;
  color: #fff;
}
.rich-text :deep(hr) { border-color: rgb(255 255 255 / 0.1); }
.rich-text :deep(img) { max-width: 100%; border-radius: 8px; }
.rich-text :deep(:first-child) { margin-top: 0; }
</style>
