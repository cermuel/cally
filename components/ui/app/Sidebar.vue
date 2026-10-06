<script setup lang="ts">
import type { AppSidebarMode } from "~/composables/useAppSidebar";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  APP_SIDEBAR_COMPACT_WIDTH,
  APP_SIDEBAR_EXPANDED_MAX,
} from "~/composables/useAppSidebar";
import { appNavigationItems } from "~/constants/app-navigation";

const props = defineProps<{
  mode: AppSidebarMode;
  width: number;
  isMobile: boolean;
  mobileOpen: boolean;
  isDragging: boolean;
  isSettling: boolean;
  motionReady: boolean;
  hideCopy: boolean;
}>();

const emit = defineEmits<{
  close: [];
  resizeStart: [event: PointerEvent];
  resizeKeydown: [event: KeyboardEvent];
}>();

const route = useRoute();
const sidebar = ref<HTMLElement | null>(null);

const compact = computed(() => !props.isMobile && props.mode === "compact");
const unavailable = computed(() =>
  props.isMobile ? !props.mobileOpen : props.mode === "hidden",
);
const showDesktopResizeHandle = computed(
  () => !props.isMobile && props.mode !== "hidden",
);
const trapMobileFocus = (event: KeyboardEvent) => {
  if (event.key !== "Tab" || !props.mobileOpen || !sidebar.value) return;

  const focusable = Array.from(
    sidebar.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
  const first = focusable.at(0);
  const last = focusable.at(-1);

  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};
</script>

<template>
  <aside
    id="app-sidebar"
    ref="sidebar"
    class="sidebar max-md:bg-sidebar fixed inset-y-0 inset-s-0 z-50 flex flex-col overflow-visible bg-transparent text-sidebar-foreground md:relative md:z-auto md:shrink-0"
    :class="[
      isDragging || !motionReady ? 'sidebar--dragging' : 'sidebar--settled',
      isMobile &&
        (mobileOpen ? 'sidebar--mobile-open' : 'sidebar--mobile-closed'),
      mode === 'hidden' && !isMobile ? 'sidebar--hidden' : '',
    ]"
    :style="{ width: isMobile ? undefined : `${width}px` }"
    :role="isMobile ? 'dialog' : undefined"
    :aria-modal="isMobile ? 'true' : undefined"
    :aria-hidden="unavailable ? 'true' : undefined"
    :inert="unavailable || undefined"
    aria-label="App navigation"
    @keydown="trapMobileFocus"
  >
    <div class="relative flex h-16 shrink-0 items-center gap-3 px-4">
      <NuxtLink
        to="/app/bookings"
        class="flex min-w-0 items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2"
        :class="!compact && 'gap-2'"
        :aria-label="compact ? 'Cally home' : undefined"
      >
        <img src="/logo.png" alt="" class="size-8 shrink-0 rounded-lg" />
        <span
          class="sidebar-copy truncate text-sm font-semibold"
          :class="hideCopy && 'sidebar-copy--hidden'"
          :aria-hidden="hideCopy ? 'true' : undefined"
        >
          Cally
        </span>
      </NuxtLink>

      <SharedThemeToggle v-if="!compact" class="ml-auto" />

      <SharedButton
        v-if="isMobile"
        variant="ghost"
        size="icon-sm"
        aria-label="Close sidebar"
        class="-mr-2 h-6 w-6"
        @click="emit('close')"
      >
        <HugeiconsIcon
          :icon="Cancel01Icon"
          :size="24"
          :stroke-width="1.75"
          aria-hidden="true"
        />
      </SharedButton>
    </div>

    <nav
      class="flex-1 space-y-1 overflow-y-auto py-4"
      :class="compact ? 'flex flex-col items-center' : 'px-3'"
      aria-label="Primary"
    >
      <UiAppSidebarItem
        v-for="item in appNavigationItems"
        :key="item.to"
        :label="item.label"
        :to="item.to"
        :icon="item.icon"
        :active="
          route.path === item.to || route.path.startsWith(`${item.to}/`)
        "
        :compact="compact"
        :has-children="item.to === '/app/links'"
        :hide-copy="hideCopy"
        :settling="isSettling"
      >
        <UiAppSidebarLinks
          v-if="item.to === '/app/links'"
          :enabled="!unavailable && !compact"
          :hide-copy="hideCopy"
        />
      </UiAppSidebarItem>
    </nav>

    <div class="p-3">
      <UiAppAccountMenu :compact="compact" :hide-copy="hideCopy" />
    </div>

    <div
      v-if="showDesktopResizeHandle"
      role="separator"
      aria-label="Resize sidebar"
      aria-orientation="vertical"
      :aria-valuemin="APP_SIDEBAR_COMPACT_WIDTH"
      :aria-valuemax="APP_SIDEBAR_EXPANDED_MAX"
      :aria-valuenow="width"
      tabindex="0"
      class="absolute inset-y-0 -inset-e-1 z-20 w-2 cursor-col-resize touch-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      @pointerdown="emit('resizeStart', $event)"
      @keydown="emit('resizeKeydown', $event)"
    />
  </aside>
</template>

<style scoped>
.sidebar--settled {
  transition:
    width 240ms var(--ease-in-out),
    transform 280ms var(--ease-drawer),
    opacity 140ms var(--ease-out),
    visibility 0ms linear;
}

.sidebar--dragging {
  transition: none;
}

.sidebar--hidden {
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

:deep(.sidebar-copy) {
  max-width: 14rem;
  opacity: 1;
  transform: translateX(0);
  transition:
    max-width 200ms var(--ease-in-out),
    opacity 140ms var(--ease-out),
    transform 200ms var(--ease-out);
}

:deep(.sidebar-copy--hidden) {
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  transform: translateX(-0.25rem);
}

@media (max-width: 47.999rem) {
  .sidebar {
    width: min(19rem, calc(100vw - 1rem));

    transform: translateX(-102%);
  }

  .sidebar--mobile-open {
    visibility: visible;
    opacity: 1;
    transform: translateX(0);
  }

  .sidebar--mobile-closed {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
    transition-delay: 0ms, 0ms, 0ms, 280ms;
  }

  :dir(rtl) .sidebar {
    transform: translateX(102%);
  }

  :dir(rtl) .sidebar--mobile-open {
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sidebar--settled {
    transition:
      width 1ms linear,
      transform 1ms linear,
      opacity 120ms ease,
      visibility 0ms linear;
  }

  :deep(.sidebar-copy) {
    transform: none;
    transition:
      max-width 1ms linear,
      opacity 120ms ease;
  }
}
</style>
