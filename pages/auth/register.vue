<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import SharedButton from "../../components/shared/button/Button.vue";
import SharedInput from "../../components/shared/input/Input.vue";
import SharedLabel from "../../components/shared/label/Label.vue";
import { authApi } from "../../utils/api/auth";
import { getApiErrorMessage, getApiFieldErrors } from "../../utils/api/client";
import { helpers } from "../../utils/helpers";

type InputField = {
  focus: () => void;
};

const route = useRoute();

const email = ref(typeof route.query.email === "string" ? route.query.email : "");
const password = ref("");
const passwordConfirmation = ref("");
const emailInput = ref<InputField | null>(null);
const passwordInput = ref<InputField | null>(null);
const passwordConfirmationInput = ref<InputField | null>(null);
const confirmationSent = ref(false);
const registeredEmail = ref("");
const apiClient = useApiClient();
const errors = reactive({
  email: "",
  password: "",
  passwordConfirmation: "",
});

const registerMutation = useMutation({
  mutationFn: () =>
    authApi.register(apiClient, {
      email: email.value.trim(),
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    }),
  onSuccess: (response) => {
    registeredEmail.value = response.user.email;
    confirmationSent.value = true;
  },
  onError: (error) => {
    toast.error(getApiErrorMessage(
      error,
      "Unable to create your account. Please try again.",
    ));

    const fieldErrors = getApiFieldErrors(error);

    errors.email = fieldErrors.email?.[0] ?? errors.email;
    errors.password = fieldErrors.password?.[0] ?? errors.password;
    errors.passwordConfirmation =
      fieldErrors.password_confirmation?.[0] ?? errors.passwordConfirmation;
  },
});

const resendEmailMutation = useMutation({
  mutationFn: () => authApi.resendEmail(apiClient, registeredEmail.value),
  onSuccess: () => {
    toast.success("We sent you another verification email.");
  },
  onError: (error) => {
    toast.error(getApiErrorMessage(
      error,
      "Unable to resend the verification email. Please try again.",
    ));
  },
});

const isRegisterPending = computed(() => registerMutation.isPending.value);
const isResendingEmail = computed(() => resendEmailMutation.isPending.value);

const focusFirstError = async () => {
  await nextTick();

  if (errors.email) {
    emailInput.value?.focus();
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

const handleSubmit = async () => {
  errors.email = "";
  errors.password = "";
  errors.passwordConfirmation = "";
  await nextTick();

  if (!helpers.validateEmail(email.value)) {
    errors.email = "Enter a valid email address.";
  }

  if (!helpers.validateRequired(password.value)) {
    errors.password = "Enter a password.";
  } else if (!helpers.validateMinLength(password.value, 8)) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!helpers.validateRequired(passwordConfirmation.value)) {
    errors.passwordConfirmation = "Confirm your password.";
  } else if (
    !helpers.validateConfirmed(password.value, passwordConfirmation.value)
  ) {
    errors.passwordConfirmation = "Password confirmation does not match.";
  }

  if (
    errors.email ||
    errors.password ||
    errors.passwordConfirmation
  ) {
    await focusFirstError();
    return;
  }

  registerMutation.mutate();
};

const returnToRegister = async () => {
  confirmationSent.value = false;
  await nextTick();
  emailInput.value?.focus();
};

const resendConfirmationEmail = () => {
  resendEmailMutation.mutate();
};

useHead({
  title: "Register | Cally",
});
</script>

<template>
  <UiAuthCard
    :title="confirmationSent ? 'Check your email' : 'Create your account'"
    :description="
      confirmationSent
        ? undefined
        : 'Set up your booking page and start sharing times that work for you.'
    "
  >
    <template v-if="confirmationSent" #description>
      We sent a confirmation link to
      <span class="font-semibold text-foreground">{{ registeredEmail }}</span
      >.
    </template>

    <UiAuthEmailSent
      v-if="confirmationSent"
      :email="registeredEmail"
      :resending="isResendingEmail"
      @resend="resendConfirmationEmail"
      @use-different-email="returnToRegister"
    />

    <form v-else class="space-y-5" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <SharedLabel for="email"> Email </SharedLabel>
        <SharedInput
          id="email"
          ref="emailInput"
          v-model="email"
          type="email"
          name="email"
          autocomplete="email"
          placeholder="you@example.com"
          :error="errors.email"
          :disabled="isRegisterPending"
          @update:model-value="errors.email = ''"
        />
      </div>

      <div class="space-y-2">
        <SharedLabel for="password"> Password </SharedLabel>
        <SharedInput
          id="password"
          ref="passwordInput"
          v-model="password"
          type="password"
          name="password"
          autocomplete="new-password"
          :error="errors.password"
          :disabled="isRegisterPending"
          @update:model-value="errors.password = ''"
        />
      </div>

      <div class="space-y-2">
        <SharedLabel for="password_confirmation">
          Confirm Password
        </SharedLabel>
        <SharedInput
          id="password_confirmation"
          ref="passwordConfirmationInput"
          v-model="passwordConfirmation"
          type="password"
          name="password_confirmation"
          autocomplete="new-password"
          :error="errors.passwordConfirmation"
          :disabled="isRegisterPending"
          @update:model-value="errors.passwordConfirmation = ''"
        />
      </div>

      <SharedButton type="submit" class="w-full" :loading="isRegisterPending">
        Register
      </SharedButton>

      <p class="text-center text-sm text-muted-foreground">
        Already have an account?
        <NuxtLink
          to="/auth/login"
          class="font-medium text-primary underline-offset-4 hover:underline"
        >
          Login
        </NuxtLink>
      </p>
    </form>
  </UiAuthCard>
</template>
