<script setup lang="ts">
import { APP_NAME, HERO } from "~/constants/onboarding";
</script>

<template>
  <aside
    class="relative flex flex-col justify-between overflow-hidden rounded-l-xl border-r border-border/10 bg-muted/50 p-8 xl:p-10"
  >
    <div
      class="pointer-events-none absolute inset-0 text-foreground/25 dark:text-foreground/18"
      aria-hidden="true"
    >
      <div class="halftone halftone-fine" />
      <div class="halftone halftone-bold" />
    </div>
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-muted to-transparent"
      aria-hidden="true"
    />

    <div class="relative flex items-center gap-2.5">
      <img
        src="/logo.png"
        alt=""
        class="size-8 rounded-md"
        aria-hidden="true"
      />
      <span class="text-lg font-medium tracking-tight text-foreground">{{
        APP_NAME
      }}</span>
    </div>

    <div class="relative">
      <slot />
      <p
        class="max-w-xs text-2xl font-medium leading-snug tracking-tight text-foreground"
      >
        {{ HERO.title }}
      </p>
      <p class="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
        {{ HERO.subtitle }}
      </p>
    </div>
  </aside>
</template>

<style scoped>
.halftone {
  position: absolute;
  inset: -10%;
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;
  animation: drift 22s ease-in-out infinite alternate;
}

.halftone-fine {
  background-image: radial-gradient(
    circle,
    currentColor 1px,
    transparent 1.7px
  );
  background-size: 7px 7px;
  opacity: 0.6;
  --m:
    radial-gradient(ellipse 40% 22% at 62% 32%, #000, transparent),
    radial-gradient(ellipse 30% 18% at 90% 78%, #000, transparent),
    radial-gradient(ellipse 22% 14% at 18% 60%, rgb(0 0 0 / 0.45), transparent);
  mask-image: var(--m);
  -webkit-mask-image: var(--m);
}

.halftone-bold {
  background-image: radial-gradient(
    circle,
    currentColor 2.2px,
    transparent 2.9px
  );
  background-size: 11px 11px;
  animation-direction: alternate-reverse;
  --m:
    radial-gradient(ellipse 22% 11% at 60% 33%, #000, transparent),
    radial-gradient(ellipse 15% 9% at 92% 80%, #000, transparent);
  mask-image: var(--m);
  -webkit-mask-image: var(--m);
}

@keyframes drift {
  from {
    transform: translate3d(-1.5%, -1%, 0);
  }
  to {
    transform: translate3d(1.5%, 1%, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .halftone {
    animation: none;
  }
}
</style>
