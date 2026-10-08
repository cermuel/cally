<template>
  <header class="border-b border-foreground/8 bg-background/90 backdrop-blur-xl">
    <div
      class="mx-auto flex min-h-18 w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-3 sm:px-8"
    >
      <NuxtLink
        to="/"
        class="flex items-center gap-2.5"
        aria-label="Cally home"
      >
        <NuxtImg
          src="/logo.png"
          alt=""
          width="32"
          height="32"
          format="webp"
          loading="eager"
          class="size-8 rounded-lg outline outline-foreground/10"
        />
        <span class="font-semibold tracking-[-0.02em]">Cally</span>
      </NuxtLink>

      <nav
        class="flex items-center gap-5 text-sm text-muted-foreground"
        aria-label="Blog navigation"
      >
        <NuxtLink class="transition-colors hover:text-foreground" to="/"
          >Home</NuxtLink
        >
        <NuxtLink class="transition-colors hover:text-foreground" to="/blog"
          >Blog</NuxtLink
        >
        <NuxtLink
          class="rounded-full bg-foreground px-4 py-2 font-semibold text-background"
          to="/auth/register"
          >Get started</NuxtLink
        >
      </nav>
    </div>
  </header>
</template>
