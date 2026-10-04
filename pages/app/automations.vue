<script setup lang="ts">
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { getApiErrorMessage, getApiFieldErrors } from "~/utils/api/client";
import {
  automationsApi,
  type Automation,
  type AutomationsListResponse,
  type AutomationTemplate,
  type CreateAutomationPayload,
} from "~/utils/api/automations";
import { queryKeys } from "~/utils/api/query-keys";

definePageMeta({ layout: false });
useHead({ title: "Automations | Cally" });

const client = useApiClient();
const queryClient = useQueryClient();
const automationsQuery = useAutomations();
const templatesQuery = useAutomationTemplates();
const variablesQuery = useAutomationVariables();
const createOpen = ref(false);
const selectedTemplate = ref<AutomationTemplate | null>(null);
const createErrors = ref<Record<string, string[]>>({});
const selectedAutomation = ref<Automation | null>(null);
const editOpen = ref(false);
const editErrors = ref<Record<string, string[]>>({});
const deleteOpen = ref(false);
const togglingIds = ref<Set<number>>(new Set());

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
  createErrors.value = {};
  createOpen.value = true;
};

const openAutomation = (automation: Automation) => {
  selectedAutomation.value = automation;
  editErrors.value = {};
  editOpen.value = true;
};

const refreshAutomations = () =>
  queryClient.invalidateQueries({ queryKey: queryKeys.automations.list() });

const createMutation = useMutation({
  mutationFn: (payload: CreateAutomationPayload) =>
    automationsApi.create(client, payload),
  onSuccess: async (response) => {
    if (!response.automation) {
      toast.info(response.message);
      createOpen.value = false;
      return;
    }

    await refreshAutomations();
    createOpen.value = false;
    createErrors.value = {};
    toast.success("Automation created");
  },
  onError: (error) => {
    createErrors.value = getApiFieldErrors(error);
    toast.error(getApiErrorMessage(error, "Could not create the automation."));
  },
});

const updateMutation = useMutation({
  mutationFn: (payload: CreateAutomationPayload) => {
    if (!selectedAutomation.value) throw new Error("No automation selected");
    return automationsApi.update(client, selectedAutomation.value.id, payload);
  },
  onSuccess: async () => {
    await refreshAutomations();
    editOpen.value = false;
    selectedAutomation.value = null;
    editErrors.value = {};
    toast.success("Automation updated");
  },
  onError: (error) => {
    editErrors.value = getApiFieldErrors(error);
    toast.error(getApiErrorMessage(error, "Could not update the automation."));
  },
});

const deleteMutation = useMutation({
  mutationFn: (automation: Automation) =>
    automationsApi.remove(client, automation.id),
  onSuccess: async () => {
    await refreshAutomations();
    deleteOpen.value = false;
    editOpen.value = false;
    selectedAutomation.value = null;
    toast.success("Automation deleted");
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not delete the automation.")),
});

const toggleMutation = useMutation({
  mutationFn: ({
    automation,
    enabled,
  }: {
    automation: Automation;
    enabled: boolean;
  }) =>
    automationsApi.update(client, automation.id, {
      is_active: enabled,
    }),
  onMutate: async ({ automation, enabled }) => {
    togglingIds.value = new Set(togglingIds.value).add(automation.id);
    await queryClient.cancelQueries({
      queryKey: queryKeys.automations.list(),
    });

    const previousAutomation = queryClient
      .getQueryData<AutomationsListResponse>(queryKeys.automations.list())
      ?.automations.find((item) => item.id === automation.id);

    queryClient.setQueryData<AutomationsListResponse>(
      queryKeys.automations.list(),
      (current) =>
        current && {
          ...current,
          automations: current.automations.map((item) =>
            item.id === automation.id
              ? { ...item, is_active: enabled }
              : item,
          ),
        },
    );

    return { previousAutomation };
  },
  onSuccess: (response) => {
    queryClient.setQueryData<AutomationsListResponse>(
      queryKeys.automations.list(),
      (current) =>
        current && {
          ...current,
          automations: current.automations.map((automation) =>
            automation.id === response.automation.id
              ? response.automation
              : automation,
          ),
        },
    );
  },
  onError: (error, _variables, context) => {
    if (context?.previousAutomation) {
      queryClient.setQueryData<AutomationsListResponse>(
        queryKeys.automations.list(),
        (current) =>
          current && {
            ...current,
            automations: current.automations.map((automation) =>
              automation.id === context.previousAutomation?.id
                ? context.previousAutomation
                : automation,
            ),
          },
      );
    }

    toast.error(getApiErrorMessage(error, "Could not update the automation."));
  },
  onSettled: (_data, _error, { automation }) => {
    const nextTogglingIds = new Set(togglingIds.value);
    nextTogglingIds.delete(automation.id);
    togglingIds.value = nextTogglingIds;
  },
});

const requestDelete = (automation: Automation) => {
  selectedAutomation.value = automation;
  deleteOpen.value = true;
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
        :busy-ids="togglingIds"
        @create="openCreate()"
        @open="openAutomation"
        @toggle="
          (automation, enabled) =>
            toggleMutation.mutate({ automation, enabled })
        "
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
        :submitting="createMutation.isPending.value"
        :errors="createErrors"
        @submit="createMutation.mutate($event)"
      />

      <UiAutomationsEditSheet
        v-model:open="editOpen"
        :automation="selectedAutomation"
        :variables="variables"
        :submitting="updateMutation.isPending.value"
        :deleting="deleteMutation.isPending.value"
        :errors="editErrors"
        @delete="requestDelete"
        @submit="updateMutation.mutate($event)"
      />

      <UiAutomationsDeleteDialog
        v-model:open="deleteOpen"
        :automation="selectedAutomation"
        :deleting="deleteMutation.isPending.value"
        @confirm="
          selectedAutomation && deleteMutation.mutate(selectedAutomation)
        "
      />
    </div>
  </UiAppShell>
</template>
