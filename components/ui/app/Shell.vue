<script setup lang="ts">
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
      />

      <main
        id="app-content"
        class="min-h-0 flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8"
        tabindex="-1"
      >
        <div class="mx-auto h-full overflow-y-scroll w-full max-w-5xl">
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
  min-height: 100vh;
  min-height: 100dvh;
  padding: 0.5rem;
}

.app-shell--booting {
  visibility: hidden;
}

.main-surface {
  min-height: calc(100vh - 1rem);
  min-height: calc(100dvh - 1rem);
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
    min-height: 100vh;
    min-height: 100dvh;
    border-width: 0;
    border-radius: 0;
  }
}
</style>
