<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{ error: NuxtError }>();
const isNotFound = computed(() => props.error.statusCode === 404);

useSeoMeta({
  title: isNotFound.value
    ? "Page Not Found | Cally"
    : "Something Went Wrong | Cally",
  description: "Return to Cally to create or manage a meeting scheduling page.",
  robots: "noindex, nofollow",
});

if (import.meta.server) {
  setResponseStatus(useRequestEvent()!, props.error.statusCode || 500);
}
</script>

<template>
  <main
    class="grid min-h-dvh place-items-center bg-background px-5 py-16 text-center text-foreground"
  >
    <div class="max-w-lg">
      <NuxtImg
        src="/logo.png"
        alt=""
        width="48"
        height="48"
        format="webp"
        class="mx-auto size-12 rounded-xl"
      />
      <p class="mt-8 text-sm font-medium text-muted-foreground">
        {{ error.statusCode }}
      </p>
      <h1 class="mt-3 text-4xl font-semibold tracking-[-0.04em]">
        {{
          isNotFound ? "This page could not be found" : "Something went wrong"
        }}
      </h1>
      <p class="mt-4 leading-7 text-muted-foreground">
        {{
          isNotFound
            ? "The link may be outdated, or the page may have moved."
            : "Try returning to the Cally home page."
        }}
      </p>
      <button
        type="button"
        class="mt-8 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background"
        @click="clearError({ redirect: '/' })"
      >
        Return to Cally
      </button>
    </div>
  </main>
</template>
