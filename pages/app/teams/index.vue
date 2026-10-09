<script setup lang="ts">
import { Add01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { getApiErrorMessage, getApiFieldErrors } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";
import { teamsApi, type CreateTeamPayload } from "~/utils/api/teams";

definePageMeta({ layout: false });
useHead({ title: "Teams | Cally" });

const client = useApiClient();
const router = useRouter();
const queryClient = useQueryClient();
const teamsQuery = useTeams();
const createOpen = ref(false);
const createErrors = ref<Record<string, string[]>>({});

const teams = computed(() => teamsQuery.data.value?.teams ?? []);

const avatar = (s: string) =>
  `https://api.dicebear.com/10.x/glass/svg?seed=${encodeURIComponent(s)}`;

const createMutation = useMutation({
  mutationFn: (payload: CreateTeamPayload) => teamsApi.create(client, payload),
  onSuccess: async ({ team }) => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
    createOpen.value = false;
    createErrors.value = {};
    toast.success("Team created");
    await router.push({
      path: `/app/teams/${team.id}`,
      query: { welcome: "1" },
    });
  },
  onError: (error) => {
    createErrors.value = getApiFieldErrors(error);
    toast.error(getApiErrorMessage(error, "Could not create the team."));
  },
});

const openCreate = () => {
  createErrors.value = {};
  createOpen.value = true;
};
</script>

<template>
  <UiAppShell>
    <header class="mb-8">
      <h1 class="text-2xl font-semibold tracking-tight">Teams</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Shared spaces for the people you work with.
      </p>
    </header>

    <div
      v-if="teamsQuery.isPending.value"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Loading teams"
    >
      <div
        v-for="index in 3"
        :key="index"
        class="h-40 animate-pulse rounded-2xl border border-border bg-muted/40"
      />
    </div>

    <div
      v-else-if="teamsQuery.isError.value"
      class="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center"
    >
      <p class="font-medium">Couldn’t load your teams</p>
      <p class="mt-1 text-sm text-muted-foreground">
        Check your connection and try again.
      </p>
      <SharedButton
        variant="outline"
        size="sm"
        class="mt-4"
        @click="teamsQuery.refetch()"
      >
        Try again
      </SharedButton>
    </div>

    <div
      v-else-if="!teams.length"
      class="flex flex-col items-center px-6 py-24 text-center"
    >
      <div class="flex items-center" aria-hidden="true">
        <img
          v-for="i in 3"
          :key="i"
          :src="avatar(`first-team-${i}`)"
          alt=""
          class="stack-item size-14 rounded-full border-[3px] border-background bg-muted"
          :class="i > 1 && '-ml-3.5'"
          :style="{ '--i': i - 1 }"
        />
        <span
          class="stack-item -ml-3.5 flex size-14 items-center justify-center rounded-full border-[1.5px] border-dashed border-muted-foreground/40 bg-background text-muted-foreground"
          :style="{ '--i': 3 }"
        >
          <HugeiconsIcon :icon="Add01Icon" :size="20" :stroke-width="1.75" />
        </span>
      </div>
      <h2 class="mt-6 text-lg font-semibold tracking-tight">
        Create your first team
      </h2>
      <p class="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
        Bring schedules, people, and collaboration into one shared space.
      </p>
      <SharedButton class="mt-6" @click="openCreate">Create team</SharedButton>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UiTeamsCard v-for="team in teams" :key="team.id" :team="team" />

      <button
        type="button"
        class="flex min-h-40 flex-col items-center justify-center gap-2.5 rounded-2xl border border-dashed border-border text-sm text-muted-foreground outline-none transition-colors hover:border-foreground/30 hover:bg-muted/40 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        @click="openCreate"
      >
        <span
          class="flex size-9 items-center justify-center rounded-full border border-border bg-background"
        >
          <HugeiconsIcon
            :icon="Add01Icon"
            :size="18"
            :stroke-width="1.75"
            aria-hidden="true"
          />
        </span>
        New team
      </button>
    </div>

    <UiTeamsCreateDialog
      v-model:open="createOpen"
      :saving="createMutation.isPending.value"
      :errors="createErrors"
      @create="createMutation.mutate"
    />
  </UiAppShell>
</template>

<style scoped>
.stack-item {
  animation: stack-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  animation-delay: calc(var(--i) * 60ms);
}

@keyframes stack-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stack-item {
    animation: none;
  }
}
</style>
