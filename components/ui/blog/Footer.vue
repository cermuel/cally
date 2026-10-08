<template>
  <footer class="border-t border-foreground/8 bg-foreground/3">
    <div
      class="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8"
    >
      <p>© {{ new Date().getFullYear() }} Cally</p>
      <nav class="flex flex-wrap gap-5" aria-label="Footer navigation">
        <NuxtLink to="/">Cally home</NuxtLink>
        <NuxtLink to="/blog">Scheduling blog</NuxtLink>
        <NuxtLink to="/privacy">Privacy</NuxtLink>
        <NuxtLink to="/terms">Terms</NuxtLink>
      </nav>
    </div>
  </footer>
</template>
