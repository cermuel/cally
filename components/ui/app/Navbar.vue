<script setup lang="ts">
import { PanelLeftOpenIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { appNavigationItems } from "~/constants/app-navigation";
import type { BreadcrumbItem } from "~/composables/useBreadcrumb";

defineProps<{
  showSidebarToggle: boolean;
  sidebarOpen: boolean;
}>();

defineSlots<{
  actions?: () => unknown;
}>();

const emit = defineEmits<{
  openSidebar: [];
}>();

const route = useRoute();
const { getItems } = useBreadcrumb();

const navigationItem = computed(() =>
  appNavigationItems.find(
    (item) => route.path === item.to || route.path.startsWith(`${item.to}/`),
  ),
);

const fallbackTitle = computed(() => {
  if (navigationItem.value) {
    return navigationItem.value.label;
  }

  const segment = route.path.split("/").filter(Boolean).at(-1);

  if (!segment || /^\d+$/.test(segment)) {
    return "Cally";
  }

  return segment.charAt(0).toUpperCase() + segment.slice(1).replaceAll("-", " ");
});

const breadcrumbItems = computed<readonly BreadcrumbItem[]>(() => {
  const configuredItems = getItems();

  if (configuredItems.length > 0) {
    return configuredItems;
  }

  return [
    {
      title: fallbackTitle.value,
      icon: navigationItem.value?.icon,
    },
  ];
});
</script>

<template>
  <header
    class="flex h-12 shrink-0 items-center gap-3 border-b border-border px-3 sm:px-5"
  >
    <SharedButton
      v-if="showSidebarToggle"
      variant="ghost"
      size="icon-sm"
      class="h-7 w-7"
      aria-label="Open sidebar"
      :aria-expanded="sidebarOpen"
      @click="emit('openSidebar')"
    >
      <HugeiconsIcon
        :icon="PanelLeftOpenIcon"
        :size="24"
        :stroke-width="1.75"
        aria-hidden="true"
      />
    </SharedButton>

    <UiAppBreadcrumb :items="breadcrumbItems" />

    <div class="ms-auto flex items-center gap-2">
      <slot name="actions" />
      <UiNotificationsTestButton />
      <UiAppNotificationButton />
    </div>
  </header>
</template>
