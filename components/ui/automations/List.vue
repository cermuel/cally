<script setup lang="ts">
import {
  ArrowMoveLeftDownIcon,
  ArrowRight02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import {
  getAutomationAction,
  getAutomationTriggerLabel,
} from "~/constants/automations";
import {
  automationsApi,
  type Automation,
  type AutomationsListResponse,
} from "~/utils/api/automations";
import { getApiErrorMessage } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";

defineProps<{
  automations: Automation[];
  loading: boolean;
}>();

const emit = defineEmits<{
  create: [];
  open: [automation: Automation];
}>();

const client = useApiClient();
const queryClient = useQueryClient();
const busyIds = ref<Set<number>>(new Set());

const toggleMutation = useMutation({
  mutationFn: ({ automation, enabled }: { automation: Automation; enabled: boolean }) =>
    automationsApi.update(client, automation.id, { is_active: enabled }),
  onMutate: async ({ automation, enabled }) => {
    busyIds.value = new Set(busyIds.value).add(automation.id);
    await queryClient.cancelQueries({ queryKey: queryKeys.automations.list() });
    const previousAutomation = queryClient
      .getQueryData<AutomationsListResponse>(queryKeys.automations.list())
      ?.automations.find((item) => item.id === automation.id);
    queryClient.setQueryData<AutomationsListResponse>(
      queryKeys.automations.list(),
      (current) => current && {
        ...current,
        automations: current.automations.map((item) =>
          item.id === automation.id ? { ...item, is_active: enabled } : item,
        ),
      },
    );
    return { previousAutomation };
  },
  onSuccess: (response) => {
    queryClient.setQueryData<AutomationsListResponse>(
      queryKeys.automations.list(),
      (current) => current && {
        ...current,
        automations: current.automations.map((automation) =>
          automation.id === response.automation.id ? response.automation : automation,
        ),
      },
    );
  },
  onError: (error, _variables, context) => {
    if (context?.previousAutomation) {
      queryClient.setQueryData<AutomationsListResponse>(
        queryKeys.automations.list(),
        (current) => current && {
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
    const next = new Set(busyIds.value);
    next.delete(automation.id);
    busyIds.value = next;
  },
});

const FALLBACK = "var(--muted-foreground)";

function tint(color: string | undefined, pct: number) {
  return `color-mix(in srgb, ${color || FALLBACK} ${pct}%, transparent)`;
}

function automationColor(automation: Automation) {
  return automation.color || FALLBACK;
}
</script>

<template>
  <section aria-labelledby="automations-heading">
    <div
      v-if="loading"
      class="rounded-xl border border-border bg-card"
      aria-busy="true"
    >
      <div class="divide-y divide-border px-4">
        <div
          v-for="index in 3"
          :key="index"
          class="flex animate-pulse items-center justify-between gap-6 py-4"
        >
          <div class="space-y-2">
            <div class="h-3.5 w-20 sm:w-44 rounded bg-muted" />
            <div class="h-3 w-40 sm:w-72 max-w-full rounded bg-muted/60" />
          </div>
          <div class="h-5 w-9 shrink-0 rounded-full bg-muted" />
        </div>
      </div>
    </div>

    <div
      v-else-if="automations.length"
      class="rounded-xl border border-border bg-card"
    >
      <ul class="divide-y divide-border px-4">
        <li
          v-for="automation in automations"
          :key="automation.id"
          class="group relative flex items-center justify-between gap-6 py-4"
        >
          <button
            type="button"
            class="absolute inset-0 rounded-md outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            :aria-label="`Edit ${automation.name}`"
            @click="emit('open', automation)"
          />
          <div
            class="pointer-events-none relative min-w-0 transition-opacity"
            :class="{ 'opacity-60': !automation.is_active }"
          >
            <h3 class="truncate text-sm font-medium">
              {{ automation.name }}
            </h3>
            <div class="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
              <span
                class="rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-muted-foreground"
              >
                When
                <span class="font-medium text-foreground">
                  {{
                    getAutomationTriggerLabel(automation.trigger).toLowerCase()
                  }}
                </span>
              </span>
              <HugeiconsIcon
                :icon="ArrowRight02Icon"
                :size="12"
                :stroke-width="2"
                class="text-muted-foreground/60 max-sm:hidden"
                aria-hidden="true"
              />
              <HugeiconsIcon
                :icon="ArrowMoveLeftDownIcon"
                :size="14"
                :stroke-width="2"
                class="text-muted-foreground mt-1 sm:hidden"
                aria-hidden="true"
              />

              <span
                class="rounded-md px-1.5 py-0.5 font-medium"
                :style="{
                  background: tint(automationColor(automation), 14),
                  color: automationColor(automation),
                }"
              >
                {{ getAutomationAction(automation.action)?.label }}
              </span>
            </div>
          </div>

          <SharedSwitch
            class="relative z-10 shrink-0"
            :model-value="automation.is_active"
            :disabled="busyIds?.has(automation.id)"
            :aria-label="`${automation.name} enabled`"
            @update:model-value="toggleMutation.mutate({ automation, enabled: $event })"
          />
        </li>
      </ul>
    </div>

    <div
      v-else
      class="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-14 text-center"
    >
      <h3 class="text-sm font-medium">No automations yet</h3>
      <p class="mt-1 max-w-sm text-[13px] leading-5 text-muted-foreground">
        Start from scratch or pick a template below to automate routine booking
        work.
      </p>
      <SharedButton type="button" class="mt-5" @click="emit('create')">
        Create automation
      </SharedButton>
    </div>
  </section>
</template>
