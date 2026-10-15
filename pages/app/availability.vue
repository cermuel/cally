<script setup lang="ts">
definePageMeta({ layout: false });
useHead({ title: "Availability" });
</script>

<template>
  <UiAppShell>
    <div class="mx-auto max-w-2xl">
      <UiAppPageHeader
        title="Availability"
        description="Set the weekly windows when guests can book time with you."
        class="mb-8"
      />

      <UiAvailabilityForm />
    </div>
  </UiAppShell>
</template>
