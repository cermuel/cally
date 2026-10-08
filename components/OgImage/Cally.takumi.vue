<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    label?: string;
  }>(),
  {
    title: "Scheduling, without the back-and-forth",
    description:
      "Share your availability and let people book a time with Cally.",
    label: "Cally",
  },
);
</script>

<template>
  <div class="flex h-full w-full bg-neutral-950 p-16 text-white">
    <div
      class="flex h-full w-full flex-col justify-between rounded-4xl bg-neutral-900 p-16"
      style="border: 1px solid rgb(255 255 255 / 0.15)"
    >
      <div class="flex items-center text-3xl font-semibold">
        <div
          class="mr-4 flex size-14 items-center justify-center rounded-2xl bg-orange-400 text-2xl font-bold text-neutral-950"
        >
          C
        </div>
        {{ label }}
      </div>
      <div class="flex flex-col">
        <h1
          class="m-0 max-w-5xl text-7xl font-bold leading-tight tracking-tight"
        >
          {{ title }}
        </h1>
        <p class="mt-7 max-w-4xl text-3xl leading-normal text-neutral-300">
          {{ description }}
        </p>
      </div>
      <div class="text-2xl text-neutral-400">cally.cermuel.dev</div>
    </div>
  </div>
</template>
