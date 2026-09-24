<script setup lang="ts">
import {
  AlertCircleIcon,
  MailValidation02Icon,
  RefreshCcwIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useMutation } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import SharedButton from "../../components/shared/button/Button.vue";
import { authApi } from "../../utils/api/auth";
import { getApiErrorMessage } from "../../utils/api/client";
import { helpers } from "../../utils/helpers";

const route = useRoute();
const apiClient = useApiClient();
const auth = useAuth();

const token = computed(() => {
  return typeof route.query.token === "string" ? route.query.token : "";
});

const email = computed(() => {
  return typeof route.query.email === "string" ? route.query.email : "";
});

const hasValidVerificationParams = computed(() => {
  return token.value.length > 0 && helpers.validateEmail(email.value);
});

const hasRouteFailure = computed(() => {
  const status =
    typeof route.query.status === "string" ? route.query.status : "";
  const error = typeof route.query.error === "string" ? route.query.error : "";

  return status === "failed" || error.length > 0;
});

const verificationFailed = computed(() => {
  return (
    !hasValidVerificationParams.value ||
    hasRouteFailure.value ||
    verifyEmailMutation.isError.value
  );
});

const isVerifying = computed(() => verifyEmailMutation.isPending.value);

const verifyEmailMutation = useMutation({
  mutationFn: () =>
    authApi.verifyEmail(apiClient, {
      email: email.value,
      token: token.value,
    }),
  onSuccess: async (response) => {
    auth.setAuth(response.token, response.user);
    await navigateTo("/");
  },
  onError: (error) => {
    toast.error(getApiErrorMessage(error, "Invalid or expired token"));
  },
});

const resendEmailMutation = useMutation({
  mutationFn: () => authApi.resendEmail(apiClient, email.value),
  onSuccess: () => {
    toast.success("We sent you another verification email.");
  },
  onError: (error) => {
    toast.error(getApiErrorMessage(
      error,
      "Unable to send a new verification link. Please try again.",
    ));
  },
});

const isResendingEmail = computed(() => resendEmailMutation.isPending.value);

const continueToApp = async () => {
  await navigateTo("/");
};

const requestNewVerificationLink = () => {
  if (!helpers.validateEmail(email.value)) {
    toast.error("This verification link is missing an email address.");
    return;
  }

  resendEmailMutation.mutate();
};

onMounted(() => {
  if (hasValidVerificationParams.value && !hasRouteFailure.value) {
    verifyEmailMutation.mutate();
  }
});

useHead({
  title: "Verify Email | Cally",
});
</script>

<template>
  <UiAuthCard
    :title="
      isVerifying
        ? 'Verifying email'
        : verificationFailed
          ? 'Verification link expired'
          : 'Email verified'
    "
    :description="
      isVerifying
        ? 'Hang tight while we confirm your email and sign you in.'
        : verificationFailed
          ? 'This verification link is no longer valid. Request a fresh link and try again.'
          : 'Your email has been confirmed. Taking you into Cally now.'
    "
  >
    <div class="space-y-5">
      <div class="flex justify-center">
        <div
          class="flex size-20 items-center justify-center"
          :class="verificationFailed ? 'text-destructive' : 'text-primary'"
          aria-hidden="true"
        >
          <HugeiconsIcon
            :icon="verificationFailed ? AlertCircleIcon : MailValidation02Icon"
            :size="64"
            color="currentColor"
          />
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <SharedButton
          v-if="verificationFailed"
          type="button"
          class="w-full"
          :loading="isResendingEmail"
          @click="requestNewVerificationLink"
        >
          <HugeiconsIcon
            :icon="RefreshCcwIcon"
            :size="16"
            color="currentColor"
            :stroke-width="1.75"
            aria-hidden="true"
          />
          Get a new link
        </SharedButton>

        <SharedButton
          v-else
          type="button"
          class="w-full"
          :loading="isVerifying"
          :disabled="isVerifying"
          @click="continueToApp"
        >
          Continue
        </SharedButton>

        <p class="text-center text-sm text-muted-foreground">
          Need another account?
          <NuxtLink
            to="/auth/register"
            class="font-medium text-primary underline-offset-4 hover:underline"
          >
            Register
          </NuxtLink>
        </p>
      </div>
    </div>
  </UiAuthCard>
</template>
