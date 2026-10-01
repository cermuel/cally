<script setup lang="ts">
import { AddTeamIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import { helpers } from "~/utils/helpers";

const emit = defineEmits<{
  add: [emails: string[]];
}>();

const open = defineModel<boolean>("open", { default: false });
const emails = ref<string[]>([""]);
const errors = ref<string[]>([]);
const guestList = ref<HTMLElement | null>(null);
const guestInputs = ref<Array<{ focus: () => void } | null>>([]);

watch(open, (isOpen) => {
  if (!isOpen) {
    emails.value = [""];
    errors.value = [];
  }
});

const validateEmails = () => {
  const values = emails.value.map((email) => email.trim());
  errors.value = values.map((email) =>
    helpers.validateEmail(email) ? "" : "Enter a valid email address.",
  );
  return {
    values,
    firstInvalidIndex: errors.value.findIndex(Boolean),
  };
};

const addGuest = async () => {
  const { firstInvalidIndex } = validateEmails();

  if (firstInvalidIndex !== -1) {
    await nextTick();
    guestInputs.value[firstInvalidIndex]?.focus();
    return;
  }

  emails.value.push("");
  errors.value.push("");
  await nextTick();
  guestList.value?.scrollTo({ top: guestList.value.scrollHeight });
  guestInputs.value[emails.value.length - 1]?.focus();
};

const removeGuest = (index: number) => {
  emails.value.splice(index, 1);
  errors.value.splice(index, 1);

  if (emails.value.length === 0) {
    emails.value.push("");
  }
};

const clearError = (index: number) => {
  errors.value[index] = "";
};

const submit = async () => {
  const { values, firstInvalidIndex } = validateEmails();

  if (firstInvalidIndex !== -1) {
    await nextTick();
    guestInputs.value[firstInvalidIndex]?.focus();
    return;
  }

  emit("add", values);
  open.value = false;
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed left-1/2 top-1/4 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-border bg-background p-5 shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      >
        <form novalidate @submit.prevent="submit">
          <DialogTitle class="font-semibold">Add guests</DialogTitle>
          <DialogDescription class="mt-1 text-sm text-muted-foreground">
            We'll email each guest an invitation.
          </DialogDescription>
          <SharedLabel class="mb-1.5 mt-4 block text-xs text-muted-foreground">
            Email addresses
          </SharedLabel>
          <div
            ref="guestList"
            class="max-h-40 space-y-3 overflow-y-auto pe-1"
          >
            <SharedInput
              v-for="(_, index) in emails"
              :id="`guest-email-${index}`"
              :key="index"
              ref="guestInputs"
              v-model="emails[index]"
              type="email"
              :name="`guest-email-${index}`"
              placeholder="you@example.com"
              :error="errors[index]"
              @update:model-value="clearError(index)"
            >
              <template #suffix>
                <SharedButton
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  class="size-7 text-muted-foreground hover:bg-transparent hover:text-foreground"
                  aria-label="Remove guest"
                  @click="removeGuest(index)"
                >
                  <HugeiconsIcon
                    :icon="Cancel01Icon"
                    :size="18"
                    color="currentColor"
                    :stroke-width="1.75"
                  />
                </SharedButton>
              </template>
            </SharedInput>
          </div>
          <SharedButton
            type="button"
            variant="secondary"
            size="sm"
            class="mt-3 w-full"
            @click="addGuest"
          >
            <HugeiconsIcon
              :icon="AddTeamIcon"
              :size="21"
              color="currentColor"
              :stroke-width="1.75"
            />
            Add guest
          </SharedButton>
          <div class="mt-4 flex justify-end gap-2">
            <DialogClose as-child>
              <SharedButton type="button" variant="ghost" size="sm"
                >Cancel</SharedButton
              >
            </DialogClose>
            <SharedButton type="submit" size="sm">Add</SharedButton>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
