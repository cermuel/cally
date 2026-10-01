<script setup lang="ts">
import { helpers } from "~/utils/helpers";

type InputField = {
  focus: () => void;
};

const attendeeName = defineModel<string>("attendeeName", { required: true });
const attendeeEmail = defineModel<string>("attendeeEmail", { required: true });
const notes = defineModel<string>("notes", { required: true });

const props = withDefaults(
  defineProps<{
    errors?: Record<string, string[]>;
    error?: string;
    submitting?: boolean;
  }>(),
  {
    errors: () => ({}),
    error: "",
    submitting: false,
  },
);

const emit = defineEmits<{
  back: [];
  confirm: [];
  clearError: [field: string];
}>();

const nameInput = ref<InputField | null>(null);
const emailInput = ref<InputField | null>(null);
const fieldErrors = reactive({
  name: "",
  email: "",
});

const nameError = computed(
  () => fieldErrors.name || props.errors["guests.0.name"]?.[0],
);
const emailError = computed(
  () => fieldErrors.email || props.errors["guests.0.email"]?.[0],
);

const clearFieldError = (field: "name" | "email") => {
  fieldErrors[field] = "";
  emit("clearError", `guests.0.${field}`);
};

const focusFirstError = async () => {
  await nextTick();

  if (nameError.value) {
    nameInput.value?.focus();
    return;
  }

  if (emailError.value) {
    emailInput.value?.focus();
  }
};

const confirm = async () => {
  fieldErrors.name = "";
  fieldErrors.email = "";
  await nextTick();

  if (!helpers.validateRequired(attendeeName.value)) {
    fieldErrors.name = "Enter your full name.";
  }

  if (!helpers.validateEmail(attendeeEmail.value)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (fieldErrors.name || fieldErrors.email) {
    await focusFirstError();
    return;
  }

  emit("confirm");
};

watch(
  () => props.errors,
  (errors) => {
    if (errors["guests.0.name"]?.[0] || errors["guests.0.email"]?.[0]) {
      void focusFirstError();
    }
  },
  { deep: true },
);
</script>

<template>
  <div class="flex flex-col space-y-3 p-4 md:space-y-4 md:p-6">
    <div class="space-y-2">
      <SharedLabel for="public-booking-name">Full name</SharedLabel>
      <SharedInput
        id="public-booking-name"
        ref="nameInput"
        v-model="attendeeName"
        name="name"
        autocomplete="name"
        placeholder="Your full name"
        :error="nameError"
        :disabled="submitting"
        @update:model-value="clearFieldError('name')"
      />
    </div>
    <div class="space-y-2">
      <SharedLabel for="public-booking-email">Email Address</SharedLabel>
      <SharedInput
        id="public-booking-email"
        ref="emailInput"
        v-model="attendeeEmail"
        type="email"
        name="email"
        autocomplete="email"
        placeholder="you@example.com"
        :error="emailError"
        :disabled="submitting"
        @update:model-value="clearFieldError('email')"
      />
    </div>

    <div class="space-y-2">
      <SharedLabel for="public-booking-notes">Notes</SharedLabel>
      <SharedTextarea
        id="public-booking-notes"
        v-model="notes"
        :rows="4"
        placeholder="Anything you'd like the host to know"
        :error="errors.notes?.[0]"
        :disabled="submitting"
        class="min-h-20 md:min-h-32"
        @update:model-value="$emit('clearError', 'notes')"
      />
    </div>

    <p v-if="error" role="alert" class="text-sm text-destructive">
      {{ error }}
    </p>

    <div class="mt-auto flex justify-end gap-4 pt-2 md:pt-5">
      <SharedButton
        type="button"
        variant="secondary"
        class="h-9"
        :disabled="submitting"
        @click="emit('back')"
      >
        Back
      </SharedButton>
      <SharedButton
        type="button"
        class="h-9"
        :disabled="submitting"
        :loading="submitting"
        @click="confirm"
      >
        Schedule
      </SharedButton>
    </div>
  </div>
</template>
