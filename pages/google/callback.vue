<script setup lang="ts">
import { HugeiconsIcon } from "@hugeicons/vue";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { getApiErrorMessage } from "~/utils/api/client";
import { googleApi, type GoogleAuthIntent } from "~/utils/api/google";

definePageMeta({ layout: false });
useHead({ title: "Connecting Google | Cally" });

const route = useRoute();
const apiClient = useApiClient();
const auth = useAuth();
const googleOAuth = useGoogleOAuth();
const errorMessage = ref("");

const intent = ref<GoogleAuthIntent>("login");

const callbackParams = () => {
  const code = typeof route.query.code === "string" ? route.query.code : "";
  const state = typeof route.query.state === "string" ? route.query.state : "";

  if (!code || !state) {
    throw new Error(
      typeof route.query.error_description === "string"
        ? route.query.error_description
        : "Google did not return the details needed to finish connecting.",
    );
  }

  return {
    code,
    state,
    redirect_uri: window.location.href.split("?")[0]!,
  };
};

const finishConnection = async () => {
  try {
    const params = callbackParams();

    const response = await googleApi.completeAuth(apiClient, params);
    auth.setAuth(response.token, response.user);
    googleOAuth.clearIntent();
    await navigateTo(
      googleOAuth.takeReturnPath(auth.getAuthenticatedHomePath()),
    );
  } catch (error) {
    errorMessage.value = getApiErrorMessage(
      error,
      error instanceof Error ? error.message : "Unable to connect your Google account.",
    );
  }
};

onMounted(() => {
  intent.value = googleOAuth.getIntent();
  void finishConnection();
});
</script>

<template>
  <UiAuthCard
    :title="errorMessage ? 'Google connection failed' : 'Connecting Google'"
    :description="
      errorMessage || 'Please wait while we securely finish connecting your account.'
    "
  >
    <div v-if="!errorMessage" class="flex justify-center py-5">
      <HugeiconsIcon
        :icon="Loading03Icon"
        :size="28"
        class="animate-spin text-primary"
        aria-hidden="true"
      />
      <span class="sr-only">Finishing Google connection</span>
    </div>

    <SharedButton
      v-else
      type="button"
      class="w-full"
      @click="
        navigateTo(`/auth/${intent}`)
      "
    >
      Try again
    </SharedButton>
  </UiAuthCard>
</template>
