<script setup lang="ts">
const route = useRoute()
const auth = useAuth()

const navItems = [
  { label: 'Bookings', to: '/app/bookings' },
  { label: 'Links', to: '/app/links' },
  { label: 'Availability', to: '/app/availability' },
  { label: 'Profile', to: '/app/profile' },
  { label: 'Settings', to: '/app/settings' },
]

const userInitial = computed(() => {
  const name = auth.user.value?.name || auth.user.value?.email || 'C'
  return name.trim().charAt(0).toUpperCase()
})

const isActive = (path: string) => route.path === path
</script>

<template>
  <main class="min-h-screen bg-background text-foreground antialiased">
    <div class="mx-auto flex min-h-screen w-full max-w-7xl">
      <aside
        class="hidden w-64 shrink-0 border-r border-border px-4 py-5 lg:block"
      >
        <NuxtLink to="/app/bookings" class="flex items-center gap-3 px-2">
          <img src="/logo.png" alt="" class="size-8 rounded-md" >
          <span class="text-sm font-semibold">Cally</span>
        </NuxtLink>

        <nav class="mt-8 space-y-1" aria-label="App">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex h-9 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            :class="isActive(item.to) && 'bg-accent text-foreground'"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </aside>

      <section class="flex min-w-0 flex-1 flex-col">
        <header
          class="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8"
        >
          <NuxtLink to="/app/bookings" class="flex items-center gap-3 lg:hidden">
            <img src="/logo.png" alt="" class="size-8 rounded-md" >
            <span class="text-sm font-semibold">Cally</span>
          </NuxtLink>

          <nav class="hidden items-center gap-1 md:flex lg:hidden" aria-label="App">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              :class="isActive(item.to) && 'bg-accent text-foreground'"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>

          <div class="ml-auto flex items-center gap-3">
            <NuxtLink
              v-if="auth.user.value?.username"
              :to="`/${auth.user.value.username}`"
              class="hidden text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:inline"
            >
              Public page
            </NuxtLink>
            <div
              class="grid size-8 place-items-center rounded-full border border-border bg-card text-xs font-semibold"
              aria-hidden="true"
            >
              {{ userInitial }}
            </div>
          </div>
        </header>

        <nav
          class="grid grid-cols-5 border-b border-border md:hidden"
          aria-label="App"
        >
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="min-w-0 px-2 py-3 text-center text-xs font-medium text-muted-foreground"
            :class="isActive(item.to) && 'text-foreground'"
          >
            <span class="block truncate">{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <div class="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <slot />
        </div>
      </section>
    </div>
  </main>
</template>
