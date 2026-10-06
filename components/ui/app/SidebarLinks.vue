<script setup lang="ts">
const props = defineProps<{
  enabled: boolean;
  hideCopy: boolean;
}>();

const route = useRoute();
const { data, isPending } = useLinks({
  enabled: computed(() => props.enabled),
});
const links = computed(() => data.value?.links.slice(0, 3) ?? []);
</script>

<template>
  <div
    class="sidebar-copy mt-1 space-y-0.5 pl-4"
    :class="hideCopy && 'sidebar-copy--hidden'"
  >
    <div
      v-if="isPending"
      class="space-y-2 px-2 py-1.5"
      aria-label="Loading recent links"
    >
      <div
        v-for="index in 3"
        :key="index"
        class="h-6 w-full animate-pulse rounded-md bg-sidebar-accent"
      />
    </div>
    <template v-else>
      <NuxtLink
        v-for="link in links"
        :key="link.id"
        :to="`/app/links/${link.id}`"
        class="flex h-8 min-w-0 items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground outline-none transition-[background-color,color] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring"
        :class="
          route.path === `/app/links/${link.id}` &&
          'bg-sidebar-accent text-sidebar-accent-foreground'
        "
      >
        <span
          class="size-3 shrink-0 rounded-full"
          :class="!link.color && 'bg-muted-foreground/40'"
          :style="link.color ? { backgroundColor: link.color } : undefined"
          aria-hidden="true"
        />
        <span class="truncate">{{ link.name }}</span>
      </NuxtLink>
    </template>
  </div>
</template>
