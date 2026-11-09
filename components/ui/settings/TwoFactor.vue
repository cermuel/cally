<script setup lang="ts">
import { LoaderIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { getApiErrorMessage } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";
import { usersApi } from "~/utils/api/users";

const auth = useAuth();
const client = useApiClient();
const queryClient = useQueryClient();

const enabled = computed(() => auth.user.value?.two_factor_enabled === true);
const dialogOpen = ref(false);
const challengeId = ref("");
const enabling = ref(false);

const setupMutation = useMutation({
  mutationFn: (twoFactorEnabled: boolean) =>
    usersApi.setupTwoFactor(client, { two_factor_enabled: twoFactorEnabled }),
  onSuccess: async (response, twoFactorEnabled) => {
    if ("challenge_id" in response) {
      enabling.value = twoFactorEnabled;
      challengeId.value = response.challenge_id;
      dialogOpen.value = true;
      return;
    }

    await queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
  },
  onError: (error) =>
    toast.error(
      getApiErrorMessage(error, "Could not send a verification code."),
    ),
});
</script>

<template>
  <section
    id="two-factor"
    class="scroll-mt-6 overflow-hidden rounded-xl border border-border bg-card"
  >
    <div class="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
      <div class="min-w-0">
        <h2 class="font-medium">
          <label for="settings-two-factor-toggle">
            Two-factor authentication
          </label>
        </h2>
        <p class="mt-1 text-sm text-muted-foreground">
          When you log in with your password, we’ll also email you a one-time
          code.
        </p>
      </div>

      <span
        v-if="setupMutation.isPending.value"
        role="status"
        class="mt-0.5 flex h-[1.15rem] w-8 shrink-0 items-center justify-center text-muted-foreground"
      >
        <HugeiconsIcon
          :icon="LoaderIcon"
          :size="16"
          class="animate-spin"
          aria-hidden="true"
        />
        <span class="sr-only">Sending verification code</span>
      </span>
      <SharedSwitch
        v-else
        id="settings-two-factor-toggle"
        class="mt-1"
        :model-value="enabled"
        :disabled="dialogOpen"
        @update:model-value="setupMutation.mutate($event)"
      />
    </div>

    <UiSettingsTwoFactorDialog
      v-model:open="dialogOpen"
      v-model:challenge-id="challengeId"
      :enabling="enabling"
    />
  </section>
</template>
