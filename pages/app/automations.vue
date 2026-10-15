<script setup lang="ts">
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { getApiErrorMessage } from "~/utils/api/client";
import type { Automation, AutomationTemplate } from "~/utils/api/automations";

definePageMeta({ layout: false });
useHead({ title: "Automations" });

const automationsQuery = useAutomations();
const templatesQuery = useAutomationTemplates();
const variablesQuery = useAutomationVariables();
const createOpen = ref(false);
const selectedTemplate = ref<AutomationTemplate | null>(null);
const selectedAutomation = ref<Automation | null>(null);
const editOpen = ref(false);
const deleteOpen = ref(false);

const fallbackVariables = [
  "{{host_name}}",
  "{{host_email}}",
  "{{event_name}}",
  "{{guest_name}}",
  "{{guest_email}}",
  "{{starts_at}}",
  "{{ends_at}}",
  "{{booking_status}}",
];

const variables = computed(() => {
  const responseVariables = variablesQuery.data.value?.templates;
  if (!responseVariables) return fallbackVariables;

  const candidates = [
    ...Object.keys(responseVariables),
    ...Object.values(responseVariables),
  ].filter((value) => /^\{\{[a-z_]+\}\}$/i.test(value));

  return candidates.length ? [...new Set(candidates)] : fallbackVariables;
});

const openCreate = (template: AutomationTemplate | null = null) => {
  selectedTemplate.value = template;
  createOpen.value = true;
};

const openAutomation = (automation: Automation) => {
  selectedAutomation.value = automation;
  editOpen.value = true;
};

const requestDelete = (automation: Automation) => {
  selectedAutomation.value = automation;
  deleteOpen.value = true;
};

const handleDeleted = () => {
  editOpen.value = false;
  selectedAutomation.value = null;
};
</script>

<template>
  <UiAppShell>
    <div class="mx-auto max-w-2xl">
      <div class="relative flex items-center justify-between gap-4 mb-8">
        <UiAppPageHeader
          title="Automations"
          description="Automate follow-ups and routine actions around every booking."
          class="mb-0"
        />
        <SharedButton
          type="button"
          class="absolute right-0 -top-1 mt-1 sm:static"
          @click="openCreate()"
        >
          <HugeiconsIcon
            :icon="PlusSignIcon"
            :size="16"
            :stroke-width="2"
            aria-hidden="true"
          />
          <span class="hidden sm:inline">Create automation</span>
          <span class="sm:hidden">Create</span>
        </SharedButton>
      </div>

      <div
        v-if="automationsQuery.isError.value"
        role="alert"
        class="mb-5 flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
      >
        <p class="text-sm text-destructive">
          {{
            getApiErrorMessage(
              automationsQuery.error.value,
              "Could not load your automations.",
            )
          }}
        </p>
        <SharedButton
          type="button"
          variant="outline"
          size="sm"
          @click="automationsQuery.refetch()"
        >
          Try again
        </SharedButton>
      </div>

      <UiAutomationsList
        :automations="automationsQuery.data.value?.automations ?? []"
        :loading="automationsQuery.isPending.value"
        @create="openCreate()"
        @open="openAutomation"
      />

      <div class="mt-4">
        <UiAutomationsTemplates
          :templates="templatesQuery.data.value?.templates ?? []"
          :loading="templatesQuery.isPending.value"
          @select="openCreate"
        />
      </div>

      <UiAutomationsCreateDialog
        v-model:open="createOpen"
        :template="selectedTemplate"
        :variables="variables"
      />

      <UiAutomationsEditSheet
        v-model:open="editOpen"
        :automation="selectedAutomation"
        :variables="variables"
        @delete="requestDelete"
      />

      <UiAutomationsDeleteDialog
        v-model:open="deleteOpen"
        :automation="selectedAutomation"
        @deleted="handleDeleted"
      />
    </div>
  </UiAppShell>
</template>
