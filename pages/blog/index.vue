<script setup lang="ts">
const title = "Meeting Scheduling Guides and Booking Tips";
const description =
  "Practical guides to meeting scheduling, booking pages, calendar workflows, and scheduling tools. Make booking easier with clear, useful advice.";
const url = "https://cally.cermuel.dev/blog";

const { data: posts } = await useAsyncData("published-blog-posts", () =>
  queryCollection("blog")
    .where("draft", "=", false)
    .order("date", "DESC")
    .select("title", "description", "path", "date")
    .all(),
);

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: "website",
  ogUrl: url,
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
});
useHead({ link: [{ rel: "canonical", href: url }] });
defineOgImage("Cally", {
  title: "Practical meeting scheduling guides",
  description: "Useful advice for booking pages, calendars, and easier scheduling.",
  label: "Cally Blog",
});
</script>

<template>
  <div class="h-dvh overflow-y-auto bg-background text-foreground antialiased">
    <UiBlogHeader />
    <main class="mx-auto w-full max-w-5xl px-5 py-20 sm:px-8 sm:py-28">
      <header class="max-w-3xl">
        <p class="text-sm font-medium text-muted-foreground">Scheduling guides</p>
        <h1 class="mt-4 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Make booking a meeting feel easy</h1>
        <p class="mt-6 text-lg leading-8 text-muted-foreground">Clear, practical writing about meeting schedulers, booking pages, calendar habits, and choosing tools without the marketing fog.</p>
      </header>

      <section class="mt-16 grid gap-5" aria-labelledby="latest-guides">
        <h2 id="latest-guides" class="text-2xl font-semibold tracking-[-0.03em]">Latest guides</h2>
        <article v-for="post in posts" :key="post.path" class="rounded-3xl bg-foreground/5 p-6 ring-1 ring-foreground/8 sm:p-8">
          <p class="text-xs text-muted-foreground">{{ new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(post.date)) }}</p>
          <h3 class="mt-3 text-2xl font-semibold tracking-[-0.025em]">
            <NuxtLink :to="post.path" class="hover:underline">{{ post.title }}</NuxtLink>
          </h3>
          <p class="mt-3 max-w-3xl leading-7 text-muted-foreground">{{ post.description }}</p>
          <NuxtLink :to="post.path" class="mt-5 inline-flex text-sm font-medium underline underline-offset-4">Read the scheduling guide</NuxtLink>
        </article>
      </section>

      <section class="mt-16 border-t border-foreground/8 pt-10">
        <h2 class="text-2xl font-semibold tracking-[-0.03em]">Explore Cally</h2>
        <p class="mt-4 max-w-3xl leading-7 text-muted-foreground">
          See Cally’s existing landing page for its
          <NuxtLink class="text-foreground underline" to="/#features"
            >meeting scheduling features</NuxtLink
          >,
          <NuxtLink class="text-foreground underline" to="/#product"
            >booking page preview</NuxtLink
          >, and
          <NuxtLink class="text-foreground underline" to="/#faq"
            >scheduling FAQ</NuxtLink
          >.
        </p>
      </section>
    </main>
    <UiBlogFooter />
  </div>
</template>
