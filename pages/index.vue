<script setup lang="ts">
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

useSeoMeta({
  title: "Cally — Scheduling, without the back-and-forth",
  description:
    "Share your availability, let people book a time, and keep every meeting in sync with Google Calendar.",
  ogTitle: "Cally — Scheduling, without the back-and-forth",
  ogDescription:
    "A beautifully simple way to share your availability and book meetings.",
});
</script>

<template>
  <main
    class="relative h-dvh overflow-y-auto bg-background text-foreground antialiased selection:bg-foreground selection:text-background"
  >
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-168 bg-[radial-gradient(circle_at_50%_-20%,oklch(0.68_0.17_30_/_0.18),transparent_58%)] dark:bg-[radial-gradient(circle_at_50%_-20%,oklch(0.68_0.17_30_/_0.18),transparent_58%)]"
    />
    <UiLandingHeader />
    <div class="relative overflow-hidden">
      <section
        class="relative mx-auto flex w-full max-w-4xl flex-col items-center px-5 pb-20 pt-28 text-center sm:px-8 sm:pb-24 sm:pt-36"
      >
        <h1
          class="max-w-3xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-foreground sm:text-7xl lg:text-[5.25rem]"
        >
          Scheduling, without the back-and-forth.
        </h1>
        <p
          class="mt-7 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
        >
          Share your availability, let people book a time, and keep every
          meeting in sync with your calendar.
        </p>
        <div class="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <NuxtLink
            to="/auth/register"
            class="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-[background-color,transform] hover:bg-foreground/90 active:scale-96"
          >
            Start scheduling free
            <HugeiconsIcon
              class="transition-transform group-hover:translate-x-0.5"
              :icon="ArrowRight02Icon"
              :size="17"
              :stroke-width="2"
              aria-hidden="true"
            />
          </NuxtLink>
          <NuxtLink
            to="/samuel"
            target="_blank"
            class="rounded-full bg-foreground/6 px-6 py-3 text-sm font-medium text-foreground/75 ring-1 ring-foreground/8 transition-[color,background-color,transform] hover:bg-foreground/10 hover:text-foreground active:scale-96"
          >
            See it in action
          </NuxtLink>
        </div>
        <p class="mt-4 text-xs text-muted-foreground/70">
          Free to start · No credit card required
        </p>
      </section>

      <UiLandingProductPreview />
      <UiLandingFeatures />
      <UiLandingHowItWorks />
      <UiLandingFaq />
      <UiLandingFooter />
    </div>
  </main>
</template>

<style scoped>
main {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  main {
    scroll-behavior: auto;
  }
}
</style>
