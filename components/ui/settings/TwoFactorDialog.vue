<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
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
import { getApiErrorMessage } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";
import { usersApi } from "~/utils/api/users";

const props = defineProps<{
  enabling: boolean;
}>();

const open = defineModel<boolean>("open", { default: false });
const challengeId = defineModel<string>("challengeId", { required: true });

const auth = useAuth();
const client = useApiClient();
const queryClient = useQueryClient();
const code = ref("");
const codeError = ref("");
const cooldown = useResendCooldown();

watch(
  challengeId,
  (id) => {
    if (id) cooldown.start();
  },
  { immediate: true },
);

const resendMutation = useMutation({
  mutationFn: () =>
    usersApi.setupTwoFactor(client, { two_factor_enabled: props.enabling }),
  onSuccess: async (response) => {
    if ("challenge_id" in response) {
      challengeId.value = response.challenge_id;
      code.value = "";
      codeError.value = "";
      toast.success("We sent you a new code.");
      return;
    }

    open.value = false;
    await queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not send a new code.")),
});

const confirmMutation = useMutation({
  mutationFn: () =>
    usersApi.confirmTwoFactor(client, {
      challenge_id: challengeId.value,
      code: code.value,
    }),
  onSuccess: (response) => {
    auth.setUser(response.user);
    queryClient.setQueryData(queryKeys.auth.user(), response);
    open.value = false;
    toast.success(response.message);
  },
  onError: (error) => {
    code.value = "";
    codeError.value = getApiErrorMessage(error, "Invalid or expired code.");
  },
});

const pending = computed(
  () => confirmMutation.isPending.value || resendMutation.isPending.value,
);

watch(open, (isOpen) => {
  if (isOpen) return;

  code.value = "";
  codeError.value = "";
});

const confirm = () => {
  codeError.value = "";

  if (!/^\d{6}$/.test(code.value)) {
    codeError.value = "Enter the 6-digit code from your email.";
    return;
  }

  confirmMutation.mutate();
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
        @escape-key-down="pending && $event.preventDefault()"
        @pointer-down-outside="pending && $event.preventDefault()"
      >
        <DialogTitle class="text-lg font-semibold">
          {{ enabling ? "Turn on" : "Turn off" }} two-factor authentication
        </DialogTitle>
        <DialogDescription class="mt-2 text-sm/6 text-muted-foreground">
          Enter the 6-digit code we sent to
          <span class="font-medium text-foreground">{{
            auth.user.value?.email
          }}</span
          >. It expires in 10 minutes.
        </DialogDescription>

        <div class="mt-5 space-y-2">
          <SharedLabel for="settings-two-factor-code" class="sr-only">
            Verification code
          </SharedLabel>
          <SharedOtpInput
            id="settings-two-factor-code"
            v-model="code"
            :error="codeError"
            :disabled="pending"
            @update:model-value="codeError = ''"
            @complete="confirm"
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

        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose as-child>
            <SharedButton type="button" variant="outline" :disabled="pending">
              Cancel
            </SharedButton>
          </DialogClose>
          <SharedButton
            type="button"
            :variant="enabling ? 'default' : 'destructive'"
            :loading="confirmMutation.isPending.value"
            :disabled="resendMutation.isPending.value"
            @click="confirm"
          >
            {{ enabling ? "Turn on 2FA" : "Turn off 2FA" }}
          </SharedButton>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
