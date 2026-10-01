<script setup lang="ts">
import { AlertCircleIcon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { getApiErrorMessage } from "~/utils/api/client";
import { usersApi } from "~/utils/api/users";

const route = useRoute();
const apiClient = useApiClient();
const auth = useAuth();
const errorMessage = ref("");

const getCallbackToken = () => {
  return typeof route.query.token === "string" ? route.query.token : "";
};

const finishAuthentication = async () => {
  const token = getCallbackToken();

  window.history.replaceState(window.history.state, "", route.path);

  if (!token) {
    errorMessage.value = "This sign-in link is missing its authentication token.";
    return;
  }

  try {
    const response = await usersApi.me(apiClient, token);

    auth.setAuth(token, response.user);
    await navigateTo(auth.getAuthenticatedHomePath(), { replace: true });
  } catch (error) {
    errorMessage.value = getApiErrorMessage(
      error,
      "This sign-in link is invalid or has expired.",
    );
  }
};

onMounted(() => {
  void finishAuthentication();
});

useHead({ title: "Signing in | Cally" });
</script>

<template>
  <UiAuthCard
    :title="errorMessage ? 'Sign-in failed' : 'Signing you in'"
    :description="
      errorMessage || 'Please wait while we securely finish signing you in.'
    "
  >
    <div v-if="!errorMessage" class="flex justify-center py-5">
      <HugeiconsIcon
        :icon="Loading03Icon"
        :size="28"
        class="animate-spin text-primary"
        aria-hidden="true"
      />
      <span class="sr-only">Finishing sign-in</span>
    </div>

    <div v-else class="space-y-5">
      <div class="flex justify-center text-destructive" aria-hidden="true">
        <HugeiconsIcon :icon="AlertCircleIcon" :size="52" />
      </div>

      <SharedButton type="button" class="w-full" @click="navigateTo('/auth/login')">
        Return to sign in
      </SharedButton>
    </div>
  </UiAuthCard>
</template>
