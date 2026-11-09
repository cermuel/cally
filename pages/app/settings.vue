<script setup lang="ts">
definePageMeta({ layout: false });
useHead({ title: "Settings" });

const sections = ["connections", "embed", "notifications", "account"];
const route = useRoute();
const router = useRouter();

const section = computed({
  get: () =>
    typeof route.query.tab === "string" && sections.includes(route.query.tab)
      ? route.query.tab
      : "connections",
  set: (tab: string | number) =>
    router.replace({ query: { ...route.query, tab: String(tab) } }),
});
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

      <SharedTabsContent
        value="account"
        class="grid items-start gap-6 lg:grid-cols-7"
      >
        <UiSettingsTwoFactor class="lg:order-last lg:col-span-3" />
        <UiSettingsPasswordForm class="lg:col-span-4" />
      </SharedTabsContent>

      <SharedTabsContent value="notifications">
        <UiSettingsNotificationPreferences />
      </SharedTabsContent>
    </SharedTabs>
  </UiAppShell>
</template>
