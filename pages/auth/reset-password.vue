<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import SharedButton from '../../components/shared/button/Button.vue'
import SharedInput from '../../components/shared/input/Input.vue'
import SharedLabel from '../../components/shared/label/Label.vue'
import { authApi } from '../../utils/api/auth'
import { getApiErrorMessage, getApiFieldErrors } from '../../utils/api/client'
import { helpers } from '../../utils/helpers'

type InputField = {
  focus: () => void
}

const route = useRoute()
const apiClient = useApiClient()
const email = ref(typeof route.query.email === 'string' ? route.query.email : '')
const token = ref(typeof route.query.token === 'string' ? route.query.token : '')
const password = ref('')
const passwordConfirmation = ref('')
const emailInput = ref<InputField | null>(null)
const passwordInput = ref<InputField | null>(null)
const passwordConfirmationInput = ref<InputField | null>(null)
const resetComplete = ref(false)
const errors = reactive({
  email: '',
  password: '',
  passwordConfirmation: '',
})

const resetPasswordMutation = useMutation({
  mutationFn: () => authApi.resetPassword(apiClient, {
    email: email.value.trim(),
    token: token.value,
    password: password.value,
    password_confirmation: passwordConfirmation.value,
  }),
  onSuccess: () => {
    resetComplete.value = true
    toast.success('Your password has been updated.')
  },
  onError: (error) => {
    toast.error(getApiErrorMessage(
      error,
      'Unable to reset your password. Please try again.',
    ))

    const fieldErrors = getApiFieldErrors(error)

    errors.email = fieldErrors.email?.[0] ?? errors.email
    errors.password = fieldErrors.password?.[0] ?? errors.password
    errors.passwordConfirmation =
      fieldErrors.password_confirmation?.[0] ?? errors.passwordConfirmation
  },
})

const isResetPasswordPending = computed(() => resetPasswordMutation.isPending.value)

const focusFirstError = async () => {
  await nextTick()

  if (errors.email) {
    emailInput.value?.focus()
    return
  }

  if (errors.password) {
    passwordInput.value?.focus()
    return
  }

  if (errors.passwordConfirmation) {
    passwordConfirmationInput.value?.focus()
  }
}

const handleSubmit = async () => {
  errors.email = ''
  errors.password = ''
  errors.passwordConfirmation = ''
  resetComplete.value = false
  await nextTick()

  if (!helpers.validateEmail(email.value)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!helpers.validateRequired(token.value)) {
    toast.error('This reset link is missing a token. Request a fresh link and try again.')
    return
  }

  if (!helpers.validateRequired(password.value)) {
    errors.password = 'Enter a password.'
  }
  else if (!helpers.validateMinLength(password.value, 8)) {
    errors.password = 'Password must be at least 8 characters.'
  }

  if (!helpers.validateRequired(passwordConfirmation.value)) {
    errors.passwordConfirmation = 'Confirm your password.'
  }
  else if (!helpers.validateConfirmed(password.value, passwordConfirmation.value)) {
    errors.passwordConfirmation = 'Password confirmation does not match.'
  }

  if (errors.email || errors.password || errors.passwordConfirmation) {
    await focusFirstError()
    return
  }

  resetPasswordMutation.mutate()
}

useHead({
  title: 'Reset Password | Cally',
})
</script>

<template>
  <UiAuthCard
    :title="resetComplete ? 'Password reset' : 'Choose a new password'"
    :description="
      resetComplete
        ? 'Your password has been updated. You can now login with your new password.'
        : 'Create a fresh password to keep your account and calendar settings protected.'
    "
  >
    <div v-if="resetComplete" class="space-y-5">
      <SharedButton type="button" as-child class="w-full">
        <NuxtLink to="/auth/login">
          Login
        </NuxtLink>
      </SharedButton>
    </div>

    <form v-else class="space-y-5" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <SharedLabel for="email">
          Email
        </SharedLabel>
        <SharedInput
          id="email"
          ref="emailInput"
          v-model="email"
          type="email"
          name="email"
          autocomplete="email"
          placeholder="you@example.com"
          :error="errors.email"
          :disabled="isResetPasswordPending"
          @update:model-value="errors.email = ''"
        />
      </div>

      <div class="space-y-2">
        <SharedLabel for="password">
          Password
        </SharedLabel>
        <SharedInput
          id="password"
          ref="passwordInput"
          v-model="password"
          type="password"
          name="password"
          autocomplete="new-password"
          :error="errors.password"
          :disabled="isResetPasswordPending"
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
          :disabled="isResetPasswordPending"
          @update:model-value="errors.passwordConfirmation = ''"
        />
      </div>

      <SharedButton type="submit" class="w-full" :loading="isResetPasswordPending">
        Reset Password
      </SharedButton>

      <p class="text-center text-sm text-muted-foreground">
        Password already reset?
        <NuxtLink to="/auth/login" class="font-medium text-primary underline-offset-4 hover:underline">
          Login
        </NuxtLink>
      </p>
    </form>
  </UiAuthCard>
</template>
