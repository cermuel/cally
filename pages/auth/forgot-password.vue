<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import SharedButton from "../../components/shared/button/Button.vue";
import SharedInput from "../../components/shared/input/Input.vue";
import SharedLabel from "../../components/shared/label/Label.vue";
import { authApi } from "../../utils/api/auth";
import { getApiErrorMessage } from "../../utils/api/client";
import { helpers } from "../../utils/helpers";

type InputField = {
  focus: () => void;
};

const route = useRoute();

const email = ref(
  typeof route.query.email === "string" ? route.query.email : "",
);
const emailInput = ref<InputField | null>(null);
const apiClient = useApiClient();
const errors = reactive({
  email: "",
});

const forgotPasswordMutation = useMutation({
  mutationFn: () =>
    authApi.forgotPassword(apiClient, {
      email: email.value.trim(),
    }),
  onSuccess: () => {
    toast.success("Reset email link sent successfully.");
  },
  onError: (error) => {
    toast.error(
      getApiErrorMessage(
        error,
        "Unable to send a reset link. Please try again.",
      ),
    );
  },
});

const isForgotPasswordPending = computed(
  () => forgotPasswordMutation.isPending.value,
);

const handleSubmit = async () => {
  errors.email = "";
  await nextTick();

  if (!helpers.validateEmail(email.value)) {
    errors.email = "Enter a valid email address.";
    await nextTick();
    emailInput.value?.focus();
    return;
  }

  forgotPasswordMutation.mutate();
};

useHead({
  title: "Forgot Password | Cally",
});
</script>

<template>
  <UiAuthCard
    title="Reset your password"
    description="Enter your email and we will send a secure link to get you back in."
  >
    <form class="space-y-5" @submit.prevent="handleSubmit">
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
          :disabled="isForgotPasswordPending"
          @update:model-value="errors.email = ''"
        />
      </div>

      <SharedButton
        type="submit"
        class="w-full"
        :loading="isForgotPasswordPending"
      >
        Send Reset Link
      </SharedButton>

      <p class="text-center text-sm text-muted-foreground">
        Remembered your password?
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
