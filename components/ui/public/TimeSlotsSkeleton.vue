<template>
  <aside
    class="flex min-h-0 flex-col px-4 py-3 md:p-6"
    aria-label="Loading time slots"
    aria-busy="true"
  >
    <div class="mb-3 flex shrink-0 items-center justify-between gap-4 md:mb-4">
      <div class="h-6 w-20 rounded bg-white/10 motion-safe:animate-pulse" />
    </div>

    <div class="flex min-h-0 flex-1 flex-col space-y-2 overflow-hidden pb-4 pr-1">
      <div
        v-for="slot in 12"
        :key="slot"
        class="h-8 w-full rounded-md border border-white/10 bg-white/6 motion-safe:animate-pulse"
      />
    </div>
  </aside>
</template>
