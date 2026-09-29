<script setup lang="ts">
const steps = [
  {
    number: "01",
    title: "Set your availability",
    description: "Choose the days and hours you want to meet.",
  },
  {
    number: "02",
    title: "Share your link",
    description: "Send one clean booking page to anyone, anywhere.",
  },
  {
    number: "03",
    title: "Meet, without the admin",
    description: "Calendar event, Meet link, and confirmations—done.",
  },
];
</script>

<template>
  <section id="how-it-works" class="mx-auto w-full max-w-7xl scroll-mt-12 px-5 pb-28 sm:px-8 sm:pb-36 lg:px-10">
    <div class="rounded-4xl bg-foreground px-6 py-10 text-background sm:px-10 sm:py-14 lg:px-14">
      <div class="grid gap-12 lg:grid-cols-5 lg:gap-20">
        <div class="lg:col-span-2">
          <p class="text-sm font-semibold text-background/60">How it works</p>
          <h2 class="mt-3 max-w-sm text-3xl font-semibold tracking-tight sm:text-4xl">
            From free time to face time.
          </h2>
        </div>
        <ol class="grid gap-8 sm:grid-cols-3 sm:gap-5 lg:col-span-3">
          <li v-for="step in steps" :key="step.number">
            <span class="font-mono text-xs text-background/50">{{ step.number }}</span>
            <h3 class="mt-5 text-base font-semibold">{{ step.title }}</h3>
            <p class="mt-2 text-sm leading-6 text-background/65">{{ step.description }}</p>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
