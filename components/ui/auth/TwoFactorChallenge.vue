<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { authApi, type TokenAuthResponse } from "~/utils/api/auth";
import { getApiErrorMessage } from "~/utils/api/client";

const props = defineProps<{
  email: string;
  password: string;
}>();

const emit = defineEmits<{
  authenticated: [response: TokenAuthResponse];
  back: [];
}>();

const challengeId = defineModel<string>("challengeId", { required: true });
const apiClient = useApiClient();
const code = ref("");
const error = ref("");

const verifyMutation = useMutation({
  mutationFn: () =>
    authApi.verifyOtp(apiClient, {
      challenge_id: challengeId.value,
      code: code.value,
    }),
  onSuccess: (response) => emit("authenticated", response),
  onError: (apiError) => {
    code.value = "";
    error.value = getApiErrorMessage(apiError, "Invalid or expired code.");
  },
});

const resendMutation = useMutation({
  mutationFn: () =>
    authApi.login(apiClient, { email: props.email, password: props.password }),
  onSuccess: (response) => {
    if ("token" in response) {
      emit("authenticated", response);
      return;
    }

    if ("challenge_id" in response) {
      challengeId.value = response.challenge_id;
      code.value = "";
      error.value = "";
      toast.success("We sent you a new code.");
    }
  },
  onError: (apiError) =>
    toast.error(getApiErrorMessage(apiError, "Could not send a new code.")),
});

const pending = computed(
  () => verifyMutation.isPending.value || resendMutation.isPending.value,
);

const submit = () => {
  error.value = "";

  if (!/^\d{6}$/.test(code.value)) {
    error.value = "Enter the 6-digit code from your email.";
    return;
  }

  verifyMutation.mutate();
};
</script>

<template>
  <div class="space-y-5">
    <div class="space-y-2">
      <SharedLabel for="two-factor-code">Verification code</SharedLabel>
      <SharedOtpInput
        id="two-factor-code"
        v-model="code"
        :error="error"
        :disabled="pending"
        @update:model-value="error = ''"
        @complete="submit"
      />
      <p class="text-xs text-muted-foreground">
        The code expires in 10 minutes.
      </p>
    </div>

    <SharedButton
      type="button"
      class="w-full"
      :loading="verifyMutation.isPending.value"
      :disabled="resendMutation.isPending.value"
      @click="submit"
    >
      Verify and log in
    </SharedButton>

    <div class="flex items-center justify-between gap-4 text-sm">
      <button
        type="button"
        class="font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
        :disabled="pending"
        @click="emit('back')"
      >
        Back to login
      </button>
      <button
        type="button"
        class="font-medium text-primary underline-offset-4 hover:underline disabled:opacity-50"
        :disabled="pending"
        @click="resendMutation.mutate()"
      >
        {{ resendMutation.isPending.value ? "Sending…" : "Resend code" }}
      </button>
    </div>
  </div>
</template>
