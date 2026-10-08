<script setup lang="ts">
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
</script>

<template>
  <section
    id="product"
    class="mx-auto w-full max-w-7xl scroll-mt-8 px-5 sm:px-8 lg:px-10"
  >
    <div
      class="relative mx-auto max-w-sm rounded-4xl bg-foreground/6 p-2 shadow-[0_32px_100px_oklch(0_0_0/0.24)] ring-1 ring-foreground/10 sm:hidden"
    >
      <div
        class="pointer-events-none absolute -inset-16 -z-10 bg-[radial-gradient(circle_at_center,oklch(1_0_0/0.06),transparent_62%)]"
      />
      <div class="overflow-hidden rounded-3xl bg-[#0d0d0d] ring-1 ring-white/8">
        <NuxtImg
          src="/cally-mobile-booking-page.png"
          alt="A mobile Cally booking page showing a profile and three meeting types"
          width="640"
          height="826"
          format="webp"
          loading="eager"
          fetchpriority="high"
          sizes="100vw sm:384px"
          class="block w-full"
        />
      </div>
    </div>

    <div class="relative hidden rounded-4xl bg-foreground/6 sm:block">
      <div
        class="pointer-events-none absolute -inset-20 -z-10 bg-[radial-gradient(circle_at_center,oklch(1_0_0/0.06),transparent_62%)]"
      />

      <div
        class="overflow-hidden rounded-4xl bg-[#0d0d0d] dark:bg-muted/20 ring-1 ring-white/8"
      >
        <div
          class="flex h-11 items-center justify-between border-b border-white/7 px-4 sm:px-5"
        >
          <div class="flex gap-1.5" aria-hidden="true">
            <span class="size-2 rounded-full bg-white/20" />
            <span class="size-2 rounded-full bg-white/12" />
            <span class="size-2 rounded-full bg-white/8" />
          </div>
          <div
            class="rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/40"
          >
            cally.cermuel.dev/samuel
          </div>
          <span class="w-9" aria-hidden="true" />
        </div>

        <NuxtImg
          src="/cally-public-page.png"
          alt="A Cally booking page showing a profile and three meeting types"
          width="1764"
          height="1002"
          format="webp"
          loading="eager"
          fetchpriority="high"
          sizes="sm:100vw lg:1280px"
          class="block aspect-video w-full object-cover"
        />
      </div>
    </div>

    <div
      class="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground"
    >
      <span>One link, ready to share</span>
      <HugeiconsIcon
        :icon="ArrowUpRight01Icon"
        :size="15"
        :stroke-width="1.75"
        aria-hidden="true"
      />
    </div>
  </section>
</template>
