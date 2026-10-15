<script setup lang="ts">
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { getApiErrorMessage } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";
import { teamsApi } from "~/utils/api/teams";

const props = defineProps<{
  teamId: number;
  name: string;
  editable: boolean;
}>();

const client = useApiClient();
const queryClient = useQueryClient();

const draft = ref(props.name);
const input = ref<HTMLInputElement | null>(null);
const focused = ref(false);
const saved = ref(false);
const error = ref("");
let timer: ReturnType<typeof setTimeout>;
const updateMutation = useMutation({
  mutationFn: (name: string) => teamsApi.update(client, props.teamId, { name }),
  onSuccess: async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(props.teamId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() }),
    ]);
    toast.success("Team name updated");
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not update the team name.")),
});
const saving = computed(() => updateMutation.isPending.value);

const trimmed = computed(() => draft.value.trim());
const hasChanges = computed(() => trimmed.value !== props.name.trim());
const showActions = computed(() => focused.value || hasChanges.value);

function save() {
  if (saving.value || !hasChanges.value) return;
  if (!trimmed.value) {
    error.value = "Enter a team name.";
    return;
  }
  updateMutation.mutate(trimmed.value);
}

function cancel() {
  if (saving.value) return;
  draft.value = props.name;
  error.value = "";
  input.value?.blur();
}

watch(draft, () => (error.value = ""));

watch(
  () => props.name,
  (name) => (draft.value = name),
);

watch(
  saving,
  async (saving, wasSaving) => {
    if (!wasSaving || saving) return;
    await nextTick();
    if (hasChanges.value) return;
    input.value?.blur();
    saved.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => (saved.value = false), 1500);
  },
);

onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <div class="min-w-0 flex-1">
    <h1 class="sr-only">{{ name }}</h1>

    <template v-if="editable">
      <div class="relative -ms-3">
        <input
          ref="input"
          v-model="draft"
          type="text"
          autocomplete="organization"
          aria-label="Team name"
          placeholder="Untitled team"
          :aria-invalid="error ? 'true' : undefined"
          :readonly="saving"
          class="h-12 w-full truncate rounded-md border border-transparent bg-transparent ps-3 text-2xl font-semibold tracking-tight outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-border focus:border-ring/50 aria-invalid:border-destructive/60 read-only:opacity-70"
          :class="showActions ? 'pe-20' : 'pe-9'"
          @focus="focused = true"
          @blur="focused = false"
          @keydown.enter.prevent="save"
          @keydown.escape.prevent="cancel"
        />

        <Transition
          enter-active-class="transition duration-150"
          leave-active-class="transition duration-100"
          enter-from-class="translate-x-1 opacity-0"
          leave-to-class="opacity-0"
        >
          <div
            v-if="showActions"
            class="absolute inset-e-2 top-1/2 flex -translate-y-1/2 gap-1"
          >
            <SharedButton
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Cancel editing team name"
              title="Cancel (Esc)"
              :disabled="saving"
              @mousedown.prevent
              @click="cancel"
            >
              <HugeiconsIcon
                :icon="Cancel01Icon"
                :size="16"
                :stroke-width="2"
                aria-hidden="true"
              />
            </SharedButton>
            <SharedButton
              type="button"
              size="icon-xs"
              aria-label="Save team name"
              title="Save (Enter)"
              :disabled="!hasChanges"
              :loading="saving"
              @mousedown.prevent
              @click="save"
            >
              <HugeiconsIcon
                :icon="Tick02Icon"
                :size="16"
                :stroke-width="2"
                aria-hidden="true"
              />
            </SharedButton>
          </div>
        </Transition>

        <Transition
          enter-active-class="transition duration-150"
          leave-active-class="transition duration-300"
          enter-from-class="scale-75 opacity-0"
          leave-to-class="opacity-0"
        >
          <HugeiconsIcon
            v-if="saved && !showActions"
            :icon="Tick02Icon"
            :size="14"
            :stroke-width="2.5"
            class="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-emerald-500"
            aria-hidden="true"
          />
        </Transition>
      </div>
      <p v-if="error" class="mt-1 text-xs text-destructive">{{ error }}</p>
    </template>

    <div v-else class="truncate text-2xl font-semibold tracking-tight">
      {{ name }}
    </div>
  </div>
</template>
