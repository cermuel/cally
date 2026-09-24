<script setup lang="ts">
const route = useRoute()
const username = computed(() => String(route.params.username || ''))

useHead(() => ({
  title: `${username.value} | Cally`,
}))
</script>

<template>
  <main class="min-h-screen bg-background text-foreground antialiased">
    <section class="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-10">
      <header class="flex items-center justify-between gap-4">
        <NuxtLink to="/" class="flex items-center gap-3">
          <img src="/logo.png" alt="" class="size-8 rounded-md" >
          <span class="text-sm font-semibold">Cally</span>
        </NuxtLink>
      </header>

      <div class="flex flex-1 items-center py-12">
        <section class="grid w-full gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
          <div class="space-y-5">
            <div
              class="grid size-16 place-items-center rounded-full border border-border bg-card text-xl font-semibold"
              aria-hidden="true"
            >
              {{ username.charAt(0).toUpperCase() || 'C' }}
            </div>
            <div class="space-y-3">
              <p class="text-sm font-medium text-muted-foreground">
                cally.com/{{ username }}
              </p>
              <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
                Book time with {{ username }}
              </h1>
              <p class="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Pick an available time and Cally will send the meeting details
                to everyone invited.
              </p>
            </div>
          </div>

          <aside class="rounded-lg border border-border bg-card p-5 shadow-xs">
            <h2 class="text-base font-medium">30 minute meeting</h2>
            <p class="mt-2 text-sm leading-6 text-muted-foreground">
              Booking times for this public profile will appear here once event
              types and calendar availability are connected.
            </p>
          </aside>
        </section>
      </div>
    </section>
  </main>
</template>
