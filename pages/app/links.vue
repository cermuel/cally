<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Links | Cally' })
</script>

<template>
  <UiAppShell>
    <UiAppPageHeader
      title="Links"
      description="Create and manage the booking links you share with guests."
    />

    <section class="grid gap-4 md:grid-cols-2">
      <article class="rounded-lg border border-border bg-card p-5 shadow-xs">
        <h2 class="text-base font-medium">Default booking page</h2>
        <p class="mt-2 text-sm leading-6 text-muted-foreground">
          Your primary booking link is ready to connect to availability and event
          type settings.
        </p>
      </article>
      <article class="rounded-lg border border-border bg-card p-5 shadow-xs">
        <h2 class="text-base font-medium">Custom links</h2>
        <p class="mt-2 text-sm leading-6 text-muted-foreground">
          Add focused links for calls, demos, interviews, or any other meeting
          format you want to offer.
        </p>
      </article>
    </section>
  </UiAppShell>
</template>
