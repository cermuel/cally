<script setup lang="ts">
const route = useRoute();
const { data: post } = await useAsyncData(`blog:${route.path}`, () =>
  queryCollection("blog").path(route.path).first(),
);

if (!post.value || post.value.draft) {
  throw createError({ statusCode: 404, statusMessage: "Article not found" });
}

const url = `https://cally.cermuel.dev${route.path}`;
const title = post.value.title;
const description = post.value.description;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: "article",
  ogUrl: url,
  articlePublishedTime: post.value.date,
  articleModifiedTime: post.value.updated,
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
});
useHead({ link: [{ rel: "canonical", href: url }] });
useSchemaOrg([
  defineArticle({
    "@type": "BlogPosting",
    headline: title,
    description,
    url,
    image: "https://cally.cermuel.dev/cally-public-og.png",
    datePublished: post.value.date,
    dateModified: post.value.updated,
    author: { "@type": "Organization", name: post.value.author },
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: "Home", item: "https://cally.cermuel.dev/" },
      { name: "Blog", item: "https://cally.cermuel.dev/blog" },
      { name: title, item: url },
    ],
  }),
]);
</script>

<template>
  <div class="h-dvh overflow-y-auto bg-background text-foreground antialiased">
    <UiBlogHeader />
    <main class="mx-auto w-full max-w-4xl px-5 pb-24 pt-16 sm:px-8 sm:pb-32 sm:pt-24">
      <nav aria-label="Breadcrumb" class="text-sm text-muted-foreground">
        <NuxtLink to="/blog" class="underline underline-offset-4">Scheduling guides</NuxtLink>
        <span aria-hidden="true"> / </span>
        <span>Article</span>
      </nav>
      <header class="mt-8">
        <p class="text-sm text-muted-foreground">Published {{ new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(post.date)) }} · By {{ post.author }}</p>
        <h1 class="mt-4 text-balance text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-6xl">{{ post.title }}</h1>
        <p class="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">{{ post.description }}</p>
      </header>
      <ContentRenderer :value="post" class="typeset-blog mt-14" />
    </main>
    <UiBlogFooter />
  </div>
</template>

<style scoped>
.typeset-blog :deep(h2) {
  margin-top: 3.5rem;
  scroll-margin-top: 2rem;
  font-size: 1.875rem;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.typeset-blog :deep(h3) {
  margin-top: 2.25rem;
  scroll-margin-top: 2rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.typeset-blog :deep(p),
.typeset-blog :deep(li) {
  color: var(--muted-foreground);
  line-height: 1.8;
}

.typeset-blog :deep(p),
.typeset-blog :deep(ul),
.typeset-blog :deep(ol),
.typeset-blog :deep(table),
.typeset-blog :deep(blockquote) {
  margin-top: 1.25rem;
}

.typeset-blog :deep(ul),
.typeset-blog :deep(ol) {
  padding-inline-start: 1.5rem;
}

.typeset-blog :deep(ul) {
  list-style: disc;
}

.typeset-blog :deep(ol) {
  list-style: decimal;
}

.typeset-blog :deep(a) {
  color: var(--foreground);
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.typeset-blog :deep(table) {
  display: block;
  width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
}

.typeset-blog :deep(th),
.typeset-blog :deep(td) {
  border: 1px solid color-mix(in oklch, var(--foreground) 12%, transparent);
  padding: 0.75rem;
  text-align: start;
  vertical-align: top;
}

.typeset-blog :deep(blockquote) {
  border-inline-start: 3px solid var(--foreground);
  padding-inline-start: 1rem;
}
</style>
