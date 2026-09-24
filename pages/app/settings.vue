<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Settings | Cally' })
</script>

<template>
  <UiAppShell>
    <UiAppPageHeader
      title="Settings"
      description="Control account preferences, calendar connections, notifications, and security options."
    />

    <section class="divide-y divide-border rounded-lg border border-border bg-card shadow-xs">
      <div class="p-5">
        <h2 class="text-base font-medium">Calendar connection</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Connect Google Calendar to check conflicts and create meeting events.
        </p>
      </div>
      <div class="p-5">
        <h2 class="text-base font-medium">Notifications</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Choose when Cally sends confirmations, reminders, and booking updates.
        </p>
      </div>
      <div class="p-5">
        <h2 class="text-base font-medium">Security</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Manage password changes and active sessions from one place.
        </p>
      </div>
    </section>
  </UiAppShell>
</template>
