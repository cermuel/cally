<script setup lang="ts">
const header = useTemplateRef<HTMLElement>("header");
const isScrolled = ref(false);

let scrollRoot: HTMLElement | null = null;

const updateScrollState = () => {
  isScrolled.value = (scrollRoot?.scrollTop ?? 0) > 48;
};

onMounted(() => {
  scrollRoot = header.value?.parentElement ?? null;
  updateScrollState();
  scrollRoot?.addEventListener("scroll", updateScrollState, { passive: true });
});

onUnmounted(() => {
  scrollRoot?.removeEventListener("scroll", updateScrollState);
});
</script>

<template>
  <header
    ref="header"
    class="sticky top-0 z-50 w-full px-3 pt-3 sm:px-5"
    :data-scrolled="isScrolled"
  >
    <div
      class="header-shell mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-transparent px-3 py-2.5 max-sm:py-2 sm:px-4"
    >
      <NuxtLink
        to="/"
        class="flex items-center gap-2.5"
        aria-label="Cally home"
      >
        <img
          src="/logo.png"
          alt=""
          class="size-8 rounded-lg outline outline-foreground/10"
        />
        <span class="text-base font-semibold tracking-[-0.02em] text-foreground"
          >Cally</span
        >
      </NuxtLink>

      <nav
        class="hidden items-center gap-1 rounded-full border border-foreground/8 bg-foreground/4 p-1 text-sm text-muted-foreground md:flex"
        aria-label="Main navigation"
      >
        <a
          class="rounded-full px-4 py-2 transition-colors hover:bg-foreground/6 hover:text-foreground"
          href="#features"
        >
          Features
        </a>
        <a
          class="rounded-full px-4 py-2 transition-colors hover:bg-foreground/6 hover:text-foreground"
          href="#how-it-works"
        >
          How it works
        </a>
        <a
          class="rounded-full px-4 py-2 transition-colors hover:bg-foreground/6 hover:text-foreground"
          href="#faq"
        >
          FAQ
        </a>
      </nav>

      <div class="flex items-center gap-2">
        <SharedThemeToggle class="text-foreground/70 hover:text-foreground" />
        <NuxtLink
          to="/auth/register"
          class="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-[color,background-color,transform] hover:bg-foreground/90 active:scale-96"
        >
          Get started
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header-shell {
  transform: translateY(0);
  transition:
    transform 220ms var(--ease-out),
    background-color 200ms var(--ease-out),
    border-color 200ms var(--ease-out),
    box-shadow 200ms var(--ease-out);
}

header[data-scrolled="true"] .header-shell {
  transform: translateY(0.25rem);
  border-color: color-mix(in oklch, var(--foreground) 10%, transparent);
  background-color: color-mix(in oklch, var(--background) 82%, transparent);
  box-shadow:
    0 1px 0 color-mix(in oklch, var(--foreground) 4%, transparent) inset,
    0 16px 48px oklch(0 0 0 / 28%);
  backdrop-filter: blur(20px) saturate(140%);
}

@media (prefers-reduced-motion: reduce) {
  .header-shell {
    transition:
      background-color 120ms var(--ease-out),
      border-color 120ms var(--ease-out),
      box-shadow 120ms var(--ease-out);
  }

  header[data-scrolled="true"] .header-shell {
    transform: none;
  }
}
</style>
