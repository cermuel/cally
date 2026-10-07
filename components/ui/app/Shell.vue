<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    contentOverflow?: "auto" | "hidden";
    fullWidth?: boolean;
  }>(),
  {
    contentOverflow: "auto",
    fullWidth: false,
  },
);

const {
  closeSidebar,
  hideSidebarCopy,
  isDragging,
  isMobile,
  isSettling,
  mobileOpen,
  mode,
  motionReady,
  openSidebar,
  resizeWithKeyboard,
  sidebarWidth,
  startResize,
} = useAppSidebar();

const content = useTemplateRef("content");
let widthAnimation: Animation | undefined;

watch(
  () => props.fullWidth,
  async () => {
    const element = content.value;
    if (!element || !import.meta.client) return;

    const previousWidth = element.getBoundingClientRect().width;
    widthAnimation?.cancel();

    await nextTick();

    const nextWidth = element.getBoundingClientRect().width;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const styles = getComputedStyle(document.documentElement);
    const easing = styles.getPropertyValue(
      reduceMotion ? "--ease-out" : "--ease-in-out",
    );

    if (!reduceMotion && Math.abs(previousWidth - nextWidth) < 1) return;

    widthAnimation = element.animate(
      reduceMotion
        ? [{ opacity: 0.92 }, { opacity: 1 }]
        : [
            { transform: `scaleX(${previousWidth / nextWidth})` },
            { transform: "scaleX(1)" },
          ],
      {
        duration: reduceMotion ? 150 : 240,
        easing: easing.trim(),
      },
    );

    const animation = widthAnimation;
    animation.onfinish = () => {
      if (widthAnimation === animation) widthAnimation = undefined;
    };
  },
  { flush: "pre" },
);

onBeforeUnmount(() => widthAnimation?.cancel());
</script>

<template>
  <div
    class="app-shell bg-muted/20 text-foreground antialiased"
    :class="{
      'app-shell--booting': !motionReady,
      'select-none': isDragging,
    }"
  >
    <a
      href="#app-content"
      class="fixed inset-s-4 top-3 z-70 -translate-y-20 rounded-md bg-background px-3 py-2 text-sm font-medium shadow-lg transition-transform focus:translate-y-0"
    >
      Skip to content
    </a>

    <Transition name="backdrop">
      <div
        v-if="mobileOpen"
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] md:hidden"
        aria-hidden="true"
        @click="closeSidebar"
      />
    </Transition>

    <UiAppSidebar
      :mode="mode"
      :width="sidebarWidth"
      :is-mobile="isMobile"
      :mobile-open="mobileOpen"
      :is-dragging="isDragging"
      :is-settling="isSettling"
      :motion-ready="motionReady"
      :hide-copy="hideSidebarCopy"
      @close="closeSidebar"
      @resize-start="startResize"
      @resize-keydown="resizeWithKeyboard"
    />

    <section
      class="main-surface relative flex min-w-0 flex-1 flex-col overflow-hidden border-border border bg-background"
      :inert="mobileOpen || undefined"
    >
      <UiAppNavbar
        :show-sidebar-toggle="isMobile || mode === 'hidden'"
        :sidebar-open="mobileOpen"
        @open-sidebar="openSidebar"
      >
        <template #actions>
          <slot name="navbar-actions" />
        </template>
      </UiAppNavbar>

      <main
        id="app-content"
        class="min-h-0 flex-1 px-4 py-8 sm:px-6 lg:px-8"
        :class="
          contentOverflow === 'hidden' ? 'overflow-y-hidden' : 'overflow-y-auto'
        "
        tabindex="-1"
      >
        <div
          ref="content"
          class="mx-auto w-full origin-center"
          :class="[
            !fullWidth && 'max-w-5xl',
            contentOverflow === 'hidden' && 'h-full min-h-0',
          ]"
        >
          <slot />
        </div>
      </main>
    </section>
  </div>
</template>

<style scoped>
.app-shell {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
  display: flex;
  height: 100vh;
  height: 100dvh;
  padding: 0.5rem;
}

.app-shell--booting {
  visibility: hidden;
}

.main-surface {
  min-height: 0;
  height: calc(100vh - 1rem);
  height: calc(100dvh - 1rem);
  border-radius: 0.75rem;
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 200ms var(--ease-out);
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

@media (max-width: 47.999rem) {
  .app-shell {
    padding: 0;
  }

  .main-surface {
    height: 100vh;
    height: 100dvh;
    border-width: 0;
    border-radius: 0;
  }
}
</style>
