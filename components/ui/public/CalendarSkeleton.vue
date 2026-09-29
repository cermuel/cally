<template>
  <section
    class="min-w-0 p-4 md:p-6"
    aria-label="Loading calendar"
    aria-busy="true"
  >
    <div class="mb-4 flex items-center justify-between gap-4 md:mb-7">
      <div class="h-6 w-32 rounded bg-white/10 motion-safe:animate-pulse" />
      <div class="flex items-center gap-6">
        <div
          v-for="item in 2"
          :key="item"
          class="size-6 rounded-md bg-white/10 motion-safe:animate-pulse"
        />
      </div>
    </div>

    <div class="grid grid-cols-7 gap-x-1 gap-y-2 text-center">
      <div
        v-for="day in ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']"
        :key="day"
        class="pb-3 text-sm font-medium tracking-tight text-foreground/80 md:pb-6"
      >
        {{ day }}
      </div>
      <div
        v-for="day in 35"
        :key="`date-${day}`"
        class="mx-auto size-8 rounded bg-white/[0.07] motion-safe:animate-pulse sm:size-9 md:size-10"
      />
    </div>
  </section>
</template>
