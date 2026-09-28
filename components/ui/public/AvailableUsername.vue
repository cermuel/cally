<script setup lang="ts">
defineProps<{
  registrationPath: string;
  username: string;
}>();
</script>

<template>
  <div class="my-auto py-10">
    <p class="text-sm text-muted-foreground">
      cally.cermuel.dev/{{ username }}
    </p>
    <h1 class="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
      @{{ username }} is available
    </h1>
    <p class="mt-3 max-w-sm text-[15px] leading-6 text-muted-foreground">
      Nobody has claimed this username yet. Register to make it yours and start
      taking bookings.
    </p>
    <SharedButton as-child class="mt-6">
      <NuxtLink :to="registrationPath">Claim @{{ username }}</NuxtLink>
    </SharedButton>
  </div>
</template>
