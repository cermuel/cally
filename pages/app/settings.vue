<script setup lang="ts">
definePageMeta({ layout: false });
useHead({ title: "Settings | Cally" });

const section = ref("connections");
</script>

<template>
  <UiAppShell>
    <SharedTabs v-model="section" class="mx-auto w-full max-w-5xl gap-6">
      <SharedTabsList aria-label="Settings sections">
        <SharedTabsTrigger value="connections"> Connections </SharedTabsTrigger>
        <SharedTabsTrigger value="account"> Account </SharedTabsTrigger>
      </SharedTabsList>

      <SharedTabsContent value="connections">
        <UiSettingsConnectionsList />
      </SharedTabsContent>

      <SharedTabsContent value="account">
        <UiSettingsPasswordForm />
      </SharedTabsContent>
    </SharedTabs>
  </UiAppShell>
</template>
