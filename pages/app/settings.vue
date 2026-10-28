<script setup lang="ts">
definePageMeta({ layout: false });
useHead({ title: "Settings" });

const section = ref("connections");
</script>

<template>
  <UiAppShell>
    <SharedTabs v-model="section" class="mx-auto w-full max-w-5xl gap-6">
      <SharedTabsList aria-label="Settings sections">
        <SharedTabsTrigger value="connections"> Connections </SharedTabsTrigger>
        <SharedTabsTrigger value="embed"> Embed </SharedTabsTrigger>
        <SharedTabsTrigger value="notifications">
          Notifications
        </SharedTabsTrigger>
        <SharedTabsTrigger value="account"> Account </SharedTabsTrigger>
      </SharedTabsList>

      <SharedTabsContent value="connections">
        <UiSettingsConnectionsList />
      </SharedTabsContent>

      <SharedTabsContent value="embed">
        <UiSettingsEmbedConfigurator />
      </SharedTabsContent>

      <SharedTabsContent value="account">
        <UiSettingsPasswordForm />
      </SharedTabsContent>

      <SharedTabsContent value="notifications">
        <UiSettingsNotificationPreferences />
      </SharedTabsContent>
    </SharedTabs>
  </UiAppShell>
</template>
