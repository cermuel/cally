<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Bookings | Cally' })
</script>

<template>
  <UiAppShell>
    <UiAppPageHeader
      title="Bookings"
      description="Review upcoming meetings, recent booking activity, and the appointments waiting for your attention."
    />

    <section
      class="rounded-lg border border-border bg-card p-6 shadow-xs"
      aria-labelledby="bookings-empty-title"
    >
      <div class="max-w-xl space-y-3">
        <h2 id="bookings-empty-title" class="text-lg font-medium">
          No bookings yet
        </h2>
        <p class="text-sm leading-6 text-muted-foreground">
          Once guests schedule time through your public page, their bookings will
          appear here with meeting details and calendar status.
        </p>
      </div>
    </section>
  </UiAppShell>
</template>
