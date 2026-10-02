<template>
  <footer
    class="mx-auto w-full overflow-hidden rounded-t-[60px] bg-foreground/5"
  >
    <div
      class="grid gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-center lg:px-14"
    >
      <h2
        class="mt-3 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-foreground sm:text-5xl"
      >
        Make room for the meetings that matter.
      </h2>

      <NuxtLink
        to="/auth/register"
        class="w-fit rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-[background-color,transform] hover:bg-foreground/90 active:scale-96"
      >
        Start scheduling free
      </NuxtLink>
    </div>

    <div
      class="grid gap-10 border-t border-foreground/8 px-6 py-8 sm:grid-cols-[1fr_auto_auto] sm:px-10 lg:px-14"
    >
      <div class="max-w-xs">
        <NuxtLink
          to="/"
          class="flex w-fit items-center gap-2.5"
          aria-label="Cally home"
        >
          <img
            src="/logo.png"
            alt=""
            class="size-7 rounded-lg outline outline-foreground/10"
          />
          <span class="font-semibold text-foreground">Cally</span>
        </NuxtLink>
        <p class="mt-4 text-sm leading-6 text-muted-foreground">
          Less back-and-forth. More time for the conversation.
        </p>
        <a
          href="https://usefulshelf.co/?utm_source=cally.cermuel.dev&amp;utm_medium=referral&amp;utm_campaign=badge&amp;utm_content=lime"
          target="_blank"
          rel="noopener"
          class="mt-6 block w-fit transition-opacity hover:opacity-80"
        >
          <img
            src="https://usefulshelf.co/badge/usefulshelf.svg?theme=lime"
            alt="Featured on UsefulShelf"
            width="248"
            height="66"
          />
        </a>
      </div>

      <nav
        class="grid content-start gap-3 text-sm text-muted-foreground"
        aria-label="Product links"
      >
        <p class="mb-1 text-xs font-medium text-muted-foreground/70">Product</p>
        <a class="transition-colors hover:text-foreground" href="#product"
          >Preview</a
        >
        <a class="transition-colors hover:text-foreground" href="#features"
          >Features</a
        >
        <a class="transition-colors hover:text-foreground" href="#faq">FAQ</a>
      </nav>

      <nav
        class="grid content-start gap-3 text-sm text-muted-foreground"
        aria-label="Account links"
      >
        <p class="mb-1 text-xs font-medium text-muted-foreground/70">Account</p>
        <NuxtLink
          class="transition-colors hover:text-foreground"
          to="/auth/login"
          >Sign in</NuxtLink
        >
        <NuxtLink
          class="transition-colors hover:text-foreground"
          to="/auth/register"
          >Create account</NuxtLink
        >
      </nav>
    </div>

    <div
      class="flex flex-col gap-2 px-6 py-5 text-xs text-muted-foreground/70 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-14"
    >
      <span>© {{ new Date().getFullYear() }} Cally</span>
      <nav class="flex items-center gap-4" aria-label="Legal links">
        <NuxtLink class="transition-colors hover:text-foreground" to="/privacy">
          Privacy
        </NuxtLink>
        <NuxtLink class="transition-colors hover:text-foreground" to="/terms">
          Terms
        </NuxtLink>
      </nav>
    </div>
  </footer>
</template>
