<script setup lang="ts">
defineProps<{
  description: string;
  title: string;
}>();
</script>

<template>
  <main
    class="h-dvh overflow-y-auto bg-background text-foreground antialiased selection:bg-foreground selection:text-background"
  >
    <header class="border-b border-foreground/8">
      <div
        class="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5 sm:px-8"
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
          <span class="text-base font-semibold tracking-tight">Cally</span>
        </NuxtLink>

        <div class="flex items-center gap-2">
          <SharedThemeToggle class="text-foreground/70 hover:text-foreground" />
          <NuxtLink
            to="/auth/register"
            class="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-[background-color,transform] hover:bg-foreground/90 active:scale-96"
          >
            Get started
          </NuxtLink>
        </div>
      </div>
    </header>

    <div class="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <header class="border-b border-foreground/8 pb-10">
        <p
          class="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          Legal
        </p>
        <h1
          class="text-balance text-4xl font-semibold tracking-tight sm:text-5xl"
        >
          {{ title }}
        </h1>
        <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground">
          {{ description }}
        </p>
        <p class="mt-4 text-sm text-muted-foreground">
          Effective 1 October 2026
        </p>
      </header>

      <article class="legal-copy pt-10">
        <slot />
      </article>
    </div>

    <footer class="border-t border-foreground/8">
      <div
        class="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8"
      >
        <span>© {{ new Date().getFullYear() }} Cally</span>
        <nav class="flex items-center gap-5" aria-label="Legal links">
          <NuxtLink class="transition-colors hover:text-foreground" to="/privacy">
            Privacy
          </NuxtLink>
          <NuxtLink class="transition-colors hover:text-foreground" to="/terms">
            Terms
          </NuxtLink>
        </nav>
      </div>
    </footer>
  </main>
</template>

<style scoped>
.legal-copy :deep(section + section) {
  margin-top: 2.5rem;
}

.legal-copy :deep(h2) {
  color: var(--foreground);
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.4;
}

.legal-copy :deep(p),
.legal-copy :deep(li) {
  color: var(--muted-foreground);
  font-size: 0.9375rem;
  line-height: 1.75;
}

.legal-copy :deep(h2 + p),
.legal-copy :deep(h2 + ul),
.legal-copy :deep(p + p),
.legal-copy :deep(p + ul) {
  margin-top: 0.875rem;
}

.legal-copy :deep(ul) {
  list-style: disc;
  padding-inline-start: 1.25rem;
}

.legal-copy :deep(li + li) {
  margin-top: 0.5rem;
}

.legal-copy :deep(a) {
  color: var(--foreground);
  font-weight: 500;
  text-decoration: underline;
  text-decoration-color: color-mix(in oklch, var(--foreground) 30%, transparent);
  text-underline-offset: 0.2em;
}

.legal-copy :deep(a:hover) {
  text-decoration-color: var(--foreground);
}
</style>
