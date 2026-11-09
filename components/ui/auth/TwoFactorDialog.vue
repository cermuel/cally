<script setup lang="ts">
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useMutation } from "@tanstack/vue-query";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import { toast } from "vue-sonner";
import { authApi, type TokenAuthResponse } from "~/utils/api/auth";
import { getApiErrorMessage } from "~/utils/api/client";

const props = defineProps<{
  email: string;
  password: string;
}>();

const emit = defineEmits<{
  authenticated: [response: TokenAuthResponse];
}>();

const challengeId = defineModel<string>("challengeId", { required: true });
const apiClient = useApiClient();
const code = ref("");
const error = ref("");
const cooldown = useResendCooldown();

const open = computed({
  get: () => Boolean(challengeId.value),
  set: (isOpen) => {
    if (!isOpen) challengeId.value = "";
  },
});

watch(
  challengeId,
  (id) => {
    code.value = "";
    error.value = "";
    if (id) cooldown.start();
  },
  { immediate: true },
);

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
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-1/2 rounded-xl border border-border bg-background p-6 shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        @pointer-down-outside.prevent
        @interact-outside.prevent
        @escape-key-down="pending && $event.preventDefault()"
      >
        <DialogClose as-child>
          <SharedButton
            type="button"
            variant="ghost"
            size="icon-sm"
            class="absolute top-4 inset-e-4"
            aria-label="Close"
            :disabled="pending"
          >
            <HugeiconsIcon :icon="Cancel01Icon" :size="16" aria-hidden="true" />
          </SharedButton>
        </DialogClose>

        <DialogTitle class="pe-8 text-lg font-semibold">
          Two-factor authentication
        </DialogTitle>
        <DialogDescription class="mt-2 text-sm/6 text-muted-foreground">
          Enter the 6-digit code we sent to
          <span class="font-medium text-foreground">{{ email }}</span
          >. It expires in 10 minutes.
        </DialogDescription>

        <div class="mt-5 space-y-2">
          <SharedLabel for="two-factor-code" class="sr-only">
            Verification code
          </SharedLabel>
          <SharedOtpInput
            id="two-factor-code"
            v-model="code"
            :error="error"
            :disabled="pending"
            @update:model-value="error = ''"
            @complete="submit"
          />
          <p class="text-center text-xs text-muted-foreground">
            Didn’t get it?
            <button
              type="button"
              class="font-medium text-primary tabular-nums underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
              :disabled="pending || cooldown.remaining.value > 0"
              @click="resendMutation.mutate()"
            >
              {{
                resendMutation.isPending.value
                  ? "Sending…"
                  : cooldown.remaining.value > 0
                    ? `Resend in ${cooldown.remaining.value}s`
                    : "Resend code"
              }}
            </button>
          </p>
        </div>

        <SharedButton
          type="button"
          class="mt-6 w-full"
          :loading="verifyMutation.isPending.value"
          :disabled="resendMutation.isPending.value"
          @click="submit"
        >
          Verify and log in
        </SharedButton>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
