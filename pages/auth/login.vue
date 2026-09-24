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
const email = ref("");
const password = ref("");
const emailInput = ref<InputField | null>(null);
const passwordInput = ref<InputField | null>(null);
const apiClient = useApiClient();
const auth = useAuth();
const verificationEmail = ref("");
const errors = reactive({
  email: "",
  password: "",
});

const loginMutation = useMutation({
  mutationFn: () =>
    authApi.login(apiClient, {
      email: email.value.trim(),
      password: password.value,
    }),
  onSuccess: async (response) => {
    if (response.token) {
      auth.setAuth(response.token, response.user);
      const redirect = typeof route.query.redirect === "string"
        && (route.query.redirect === "/app" || route.query.redirect.startsWith("/app/"))
        ? route.query.redirect
        : auth.getAuthenticatedHomePath();

      await navigateTo(redirect);
      return;
    }

    auth.setUser(response.user);
    verificationEmail.value = response.user.email;
  },
  onError: (error) => {
    toast.error(
      getApiErrorMessage(error, "Unable to login. Please try again."),
    );

    const fieldErrors = getApiFieldErrors(error);

    errors.email = fieldErrors.email?.[0] ?? errors.email;
    errors.password = fieldErrors.password?.[0] ?? errors.password;
  },
});

const isLoginPending = computed(() => loginMutation.isPending.value);

const isValidEmail = computed(() => {
  return helpers.validateEmail(email.value);
});

const forgotPasswordLocation = computed(() => {
  if (!isValidEmail.value) {
    return "/auth/forgot-password";
  }

  return {
    path: "/auth/forgot-password",
    query: {
      email: email.value,
    },
  };
});

const focusFirstError = async () => {
  await nextTick();

  if (errors.email) {
    emailInput.value?.focus();
    return;
  }

  if (errors.password) {
    passwordInput.value?.focus();
  }
};

const handleSubmit = async () => {
  errors.email = "";
  errors.password = "";
  verificationEmail.value = "";
  await nextTick();

  if (!helpers.validateEmail(email.value)) {
    errors.email = "Enter a valid email address.";
  }

  if (!helpers.validateRequired(password.value)) {
    errors.password = "Enter your password.";
  }

  if (errors.email || errors.password) {
    await focusFirstError();
    return;
  }

  loginMutation.mutate();
};

useHead({
  title: "Login | Cally",
});
</script>

<template>
  <UiAuthCard
    :title="verificationEmail ? 'Check your email' : 'Welcome back'"
    :description="
      verificationEmail
        ? undefined
        : 'Sign in to manage your booking page, availability, and scheduled meetings.'
    "
  >
    <template v-if="verificationEmail" #description>
      We sent a confirmation link to
      <span class="font-semibold text-foreground">{{ verificationEmail }}</span
      >.
    </template>

    <div v-if="verificationEmail" class="space-y-5">
      <p class="text-sm text-muted-foreground">
        Verify your email, then come back here to finish signing in.
      </p>

      <SharedButton
        type="button"
        class="w-full"
        @click="verificationEmail = ''"
      >
        Back to login
      </SharedButton>
    </div>

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
          :disabled="isLoginPending"
          @update:model-value="errors.email = ''"
        />
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between gap-4">
          <SharedLabel for="password"> Password </SharedLabel>
          <NuxtLink
            :to="forgotPasswordLocation"
            class="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </NuxtLink>
        </div>
        <SharedInput
          id="password"
          ref="passwordInput"
          v-model="password"
          type="password"
          name="password"
          autocomplete="current-password"
          :error="errors.password"
          :disabled="isLoginPending"
          @update:model-value="errors.password = ''"
        />
      </div>

      <SharedButton type="submit" class="w-full" :loading="isLoginPending">
        Login
      </SharedButton>

      <p class="text-center text-sm text-muted-foreground">
        New to Cally?
        <NuxtLink
          to="/auth/register"
          class="font-medium text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </NuxtLink>
      </p>
    </form>
  </UiAuthCard>
</template>
