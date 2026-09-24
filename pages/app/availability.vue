<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Availability | Cally' })
</script>

<template>
  <UiAppShell>
    <UiAppPageHeader
      title="Availability"
      description="Set the weekly windows when guests can book time with you."
    />

    <section class="rounded-lg border border-border bg-card p-6 shadow-xs">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']"
          :key="day"
          class="rounded-md border border-border p-4"
        >
          <p class="text-sm font-medium">{{ day }}</p>
          <p class="mt-1 text-sm text-muted-foreground">9:00am to 5:00pm</p>
        </div>
      </div>
    </section>
  </UiAppShell>
</template>
