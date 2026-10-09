<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { getApiErrorMessage, getApiFieldErrors } from "~/utils/api/client";
import { usersApi } from "~/utils/api/users";
import { helpers } from "~/utils/helpers";

type InputField = {
  focus: () => void;
};

const apiClient = useApiClient();
const currentPassword = ref("");
const password = ref("");
const passwordConfirmation = ref("");
const currentPasswordInput = ref<InputField | null>(null);
const passwordInput = ref<InputField | null>(null);
const passwordConfirmationInput = ref<InputField | null>(null);
const errors = reactive({
  currentPassword: "",
  password: "",
  passwordConfirmation: "",
});

const changePasswordMutation = useMutation({
  mutationFn: () =>
    usersApi.changePassword(apiClient, {
      old_password: currentPassword.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    }),
  onSuccess: () => {
    currentPassword.value = "";
    password.value = "";
    passwordConfirmation.value = "";
    toast.success("Password updated");
  },
  onError: (error) => {
    const fieldErrors = getApiFieldErrors(error);

    errors.currentPassword = fieldErrors.old_password?.[0] ?? "";
    errors.password = fieldErrors.password?.[0] ?? "";
    errors.passwordConfirmation = fieldErrors.password_confirmation?.[0] ?? "";

    toast.error(getApiErrorMessage(error, "Could not update your password."));
  },
});

const focusFirstError = async () => {
  await nextTick();

  if (errors.currentPassword) {
    currentPasswordInput.value?.focus();
    return;
  }

  if (errors.password) {
    passwordInput.value?.focus();
    return;
  }

  if (errors.passwordConfirmation) {
    passwordConfirmationInput.value?.focus();
  }
};

const submit = async () => {
  errors.currentPassword = "";
  errors.password = "";
  errors.passwordConfirmation = "";

  if (!helpers.validateRequired(currentPassword.value)) {
    errors.currentPassword = "Enter your current password.";
  }

  if (!helpers.validateRequired(password.value)) {
    errors.password = "Enter a new password.";
  } else if (!helpers.validateMinLength(password.value, 8)) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!helpers.validateRequired(passwordConfirmation.value)) {
    errors.passwordConfirmation = "Confirm your new password.";
  } else if (
    !helpers.validateConfirmed(password.value, passwordConfirmation.value)
  ) {
    errors.passwordConfirmation = "Password confirmation does not match.";
  }

  if (
    errors.currentPassword ||
    errors.password ||
    errors.passwordConfirmation
  ) {
    await focusFirstError();
    return;
  }

  changePasswordMutation.mutate();
};
</script>

<template>
  <section class="overflow-hidden rounded-xl border border-border bg-card">
    <div class="border-b border-border px-5 py-4 sm:px-6">
      <h2 class="font-medium">Change password</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        Use a strong password that you don’t use anywhere else.
      </p>
    </div>

    <form class="space-y-5 p-5 sm:p-6" @submit.prevent="submit">
      <div class="space-y-2">
        <SharedLabel for="settings-current-password">
          Current password
        </SharedLabel>
        <SharedInput
          id="settings-current-password"
          ref="currentPasswordInput"
          v-model="currentPassword"
          type="password"
          name="current_password"
          autocomplete="current-password"
          :error="errors.currentPassword"
          :disabled="changePasswordMutation.isPending.value"
          @update:model-value="errors.currentPassword = ''"
        />
      </div>

      <div class="space-y-2">
        <SharedLabel for="settings-new-password"> New password </SharedLabel>
        <SharedInput
          id="settings-new-password"
          ref="passwordInput"
          v-model="password"
          type="password"
          name="password"
          autocomplete="new-password"
          :error="errors.password"
          :disabled="changePasswordMutation.isPending.value"
          @update:model-value="errors.password = ''"
        />
      </div>

      <div class="space-y-2">
        <SharedLabel for="settings-password-confirmation">
          Confirm new password
        </SharedLabel>
        <SharedInput
          id="settings-password-confirmation"
          ref="passwordConfirmationInput"
          v-model="passwordConfirmation"
          type="password"
          name="password_confirmation"
          autocomplete="new-password"
          :error="errors.passwordConfirmation"
          :disabled="changePasswordMutation.isPending.value"
          @update:model-value="errors.passwordConfirmation = ''"
        />
      </div>

      <div class="flex justify-end pt-5">
        <SharedButton
          type="submit"
          :loading="changePasswordMutation.isPending.value"
        >
          Update password
        </SharedButton>
      </div>
    </form>
  </section>
</template>
