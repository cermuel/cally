<script setup lang="ts">
import { ChevronDownIcon, Link01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

const props = defineProps<{
  active: boolean;
  compact: boolean;
  enabled: boolean;
  hideCopy: boolean;
  settling: boolean;
}>();

const route = useRoute();
const expanded = ref(false);
const { data, isPending } = useLinks({
  enabled: computed(() => props.enabled && !props.compact),
});
const links = computed(() => data.value?.links.slice(0, 3) ?? []);
</script>

<template>
  <div :class="compact && 'flex flex-col items-center'">
    <div
      v-if="compact"
      class="flex items-center"
      :class="compact ? 'w-10' : 'gap-1'"
    >
      <UiAppSidebarItem
        label="Links"
        to="/app/links"
        :icon="Link01Icon"
        :active="active"
        :compact="compact"
        :hide-copy="hideCopy"
        :settling="settling"
      />
    </div>
    <div
      v-else
      class="group flex h-8 min-w-0 items-center rounded-[10px] text-sm font-medium text-muted-foreground transition-[background-color,color] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      :class="
        active &&
        !settling &&
        'bg-sidebar-accent text-sidebar-accent-foreground'
      "
    >
      <NuxtLink
        to="/app/links"
        class="flex min-w-0 flex-1 items-center gap-3 rounded-[10px] px-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring"
        :class="active && 'text-sidebar-accent-foreground'"
      >
        <HugeiconsIcon
          :icon="Link01Icon"
          :size="18"
          :stroke-width="active ? 2 : 1.5"
          class="shrink-0"
          aria-hidden="true"
        />
        <span
          class="sidebar-copy truncate"
          :class="hideCopy && 'sidebar-copy--hidden'"
          :aria-hidden="hideCopy ? 'true' : undefined"
          >Links</span
        >
      </NuxtLink>
      <button
        type="button"
        class="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-[color,transform] hover:text-sidebar-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring active:scale-[0.96]"
        :aria-expanded="expanded"
        aria-controls="sidebar-link-children"
        aria-label="Toggle recent links"
        @click="expanded = !expanded"
      >
        <HugeiconsIcon
          :icon="ChevronDownIcon"
          :size="16"
          :stroke-width="1.75"
          class="transition-transform"
          :class="!expanded && '-rotate-90'"
          aria-hidden="true"
        />
      </button>
    </div>

    <div
      v-if="!compact"
      class="sidebar-links-clip"
      :class="expanded && 'sidebar-links-clip--expanded'"
      :inert="!expanded || undefined"
      :aria-hidden="!expanded ? 'true' : undefined"
    >
      <div
        id="sidebar-link-children"
        class="sidebar-copy sidebar-links-content pl-4 mt-1 space-y-0.5"
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
    </div>
  </div>
</template>

<style scoped>
.sidebar-links-clip {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  overflow: hidden;
  transition:
    grid-template-rows 200ms var(--ease-out),
    opacity 140ms var(--ease-out);
}

.sidebar-links-clip--expanded {
  grid-template-rows: 1fr;
  opacity: 1;
}

.sidebar-links-content {
  min-height: 0;
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .sidebar-links-clip {
    transition: opacity 120ms ease;
  }
}
</style>
