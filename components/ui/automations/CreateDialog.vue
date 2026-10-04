<script setup lang="ts">
import { Cancel01Icon } from "@hugeicons/core-free-icons";
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
import {
  allowedAutomationActions,
  automationActions,
  automationTriggers,
  guestTypes,
} from "~/constants/automations";
import type {
  AutomationAction,
  AutomationTemplate,
  AutomationTrigger,
  CreateAutomationPayload,
  GuestType,
} from "~/utils/api/automations";

const props = defineProps<{
  template?: AutomationTemplate | null;
  variables: string[];
  submitting: boolean;
  errors?: Record<string, string[]>;
}>();

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{
  submit: [payload: CreateAutomationPayload];
}>();

const name = ref("");
const color = ref<string | null>(null);
const trigger = ref<AutomationTrigger | "">("");
const action = ref<AutomationAction | "">("");
const subject = ref("");
const body = ref("");
const guestType = ref<GuestType | "all">("all");
const contactEmail = ref("");
const contactName = ref("");
const localErrors = ref<Record<string, string>>({});
const subjectField = ref<HTMLElement | null>(null);
const subjectVariableRange = ref<{ from: number; to: number } | null>(null);
const subjectVariableQuery = ref("");

const availableActions = computed(() =>
  trigger.value
    ? automationActions.filter((item) =>
        allowedAutomationActions[trigger.value as AutomationTrigger].includes(
          item.value,
        ),
      )
    : automationActions,
);

const subjectSuggestions = computed(() => {
  if (!subjectVariableRange.value) return [];
  const query = subjectVariableQuery.value.toLowerCase();
  return props.variables.filter((variable) =>
    variable.toLowerCase().includes(query),
  );
});

const fieldError = (field: string) =>
  localErrors.value[field] || props.errors?.[field]?.[0];

const resetForm = () => {
  const template = props.template;
  const payload = template?.payload;
  const emailPayload =
    payload && !Array.isArray(payload) && "subject" in payload
      ? payload
      : undefined;

  name.value = template?.name ?? "";
  color.value = null;
  trigger.value = template?.trigger ?? "";
  action.value = template?.action ?? "";
  subject.value = emailPayload?.subject ?? "";
  body.value = emailPayload?.body ?? "";
  guestType.value = emailPayload?.guestType ?? "all";
  contactEmail.value = "";
  contactName.value = "";
  localErrors.value = {};
  subjectVariableRange.value = null;
};

watch(open, (isOpen) => {
  if (isOpen) resetForm();
});

watch(
  () => props.template,
  () => {
    if (open.value) resetForm();
  },
);

watch(trigger, (value) => {
  if (!value || !action.value) return;
  if (!allowedAutomationActions[value].includes(action.value)) {
    action.value = allowedAutomationActions[value][0] ?? "";
  }
});

const updateSubjectSuggestion = () => {
  const input = subjectField.value?.querySelector("input");
  if (!input) return;

  const cursor = input.selectionStart ?? subject.value.length;
  const match = subject.value.slice(0, cursor).match(/\{\{([a-z_]*)$/i);
  subjectVariableQuery.value = match?.[1] ?? "";
  subjectVariableRange.value = match
    ? { from: cursor - match[0].length, to: cursor }
    : null;
};

const insertSubjectVariable = async (variable: string) => {
  const input = subjectField.value?.querySelector("input");
  const range = subjectVariableRange.value;
  const from = range?.from ?? input?.selectionStart ?? subject.value.length;
  const to = range?.to ?? input?.selectionEnd ?? subject.value.length;

  subject.value = `${subject.value.slice(0, from)}${variable}${subject.value.slice(to)}`;
  subjectVariableRange.value = null;
  await nextTick();
  input?.focus();
  input?.setSelectionRange(from + variable.length, from + variable.length);
};

const submit = () => {
  localErrors.value = {};

  if (!name.value.trim()) localErrors.value.name = "Enter a name.";
  if (!trigger.value) localErrors.value.trigger = "Select a trigger.";
  if (!action.value) localErrors.value.action = "Select an action.";
  if (action.value === "send_email") {
    if (!subject.value.trim())
      localErrors.value["payload.subject"] = "Enter a subject.";
    if (!body.value.trim())
      localErrors.value["payload.body"] = "Write an email message.";
  }
  if (action.value === "add_to_contact") {
    if (!contactEmail.value.trim())
      localErrors.value["payload.email"] = "Enter an email address.";
    if (!contactName.value.trim())
      localErrors.value["payload.name"] = "Enter a contact name.";
  }

  if (Object.keys(localErrors.value).length || !trigger.value || !action.value)
    return;

  let payload: CreateAutomationPayload["payload"];

  if (action.value === "send_email") {
    payload = {
      subject: subject.value.trim(),
      body: body.value,
      ...(guestType.value !== "all" ? { guestType: guestType.value } : {}),
    };
  } else if (action.value === "add_to_contact") {
    payload = {
      email: contactEmail.value.trim(),
      name: contactName.value.trim(),
    };
  }

  emit("submit", {
    name: name.value.trim(),
    color: color.value,
    trigger: trigger.value,
    action: action.value,
    ...(payload ? { payload } : {}),
  });
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        style="
          width: min(calc(100vw - 2rem), 600px);
          max-width: 600px;
          max-height: 80vh;
          max-height: 80dvh;
        "
      >
        <header
          class="flex shrink-0 items-start gap-4 border-b border-border px-6 py-5"
        >
          <div class="min-w-0 flex-1">
            <DialogTitle class="text-lg font-semibold">
              Create automation
            </DialogTitle>
            <DialogDescription class="mt-1 text-sm text-muted-foreground">
              Choose when this runs and what Cally should do.
            </DialogDescription>
          </div>
          <DialogClose as-child>
            <SharedButton
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Close create automation dialog"
              class="-mr-2 -mt-1"
            >
              <HugeiconsIcon
                :icon="Cancel01Icon"
                :size="18"
                :stroke-width="1.75"
                aria-hidden="true"
              />
            </SharedButton>
          </DialogClose>
        </header>

        <form
          class="flex min-h-0 flex-1 flex-col overflow-hidden"
          @submit.prevent="submit"
        >
          <div class="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
            <div class="grid gap-5 sm:grid-cols-[1fr_12rem]">
              <div>
                <SharedLabel for="automation-name" class="mb-1.5 text-sm">
                  Name
                </SharedLabel>
                <SharedInput
                  id="automation-name"
                  v-model="name"
                  autocomplete="off"
                  placeholder="Follow-up email"
                  :error="fieldError('name')"
                />
              </div>
              <div>
                <SharedLabel class="mb-1.5 text-sm">Color</SharedLabel>
                <UiLinksColorPicker v-model="color" />
              </div>
            </div>

            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <SharedLabel for="automation-trigger" class="mb-1.5 text-sm">
                  Trigger
                </SharedLabel>
                <SharedSelect v-model="trigger">
                  <SharedSelectTrigger
                    id="automation-trigger"
                    class="w-full"
                    :aria-invalid="Boolean(fieldError('trigger'))"
                  >
                    <SharedSelectValue placeholder="Select a trigger" />
                  </SharedSelectTrigger>
                  <SharedSelectContent>
                    <SharedSelectItem
                      v-for="item in automationTriggers"
                      :key="item.value"
                      :value="item.value"
                    >
                      {{ item.label }}
                    </SharedSelectItem>
                  </SharedSelectContent>
                </SharedSelect>
                <p
                  v-if="fieldError('trigger')"
                  class="mt-1.5 text-xs text-destructive"
                >
                  {{ fieldError("trigger") }}
                </p>
              </div>

              <div>
                <SharedLabel for="automation-action" class="mb-1.5 text-sm">
                  Action
                </SharedLabel>
                <SharedSelect v-model="action">
                  <SharedSelectTrigger
                    id="automation-action"
                    class="w-full"
                    :aria-invalid="Boolean(fieldError('action'))"
                  >
                    <SharedSelectValue placeholder="Select an action" />
                  </SharedSelectTrigger>
                  <SharedSelectContent>
                    <SharedSelectItem
                      v-for="item in availableActions"
                      :key="item.value"
                      :value="item.value"
                    >
                      {{ item.label }}
                    </SharedSelectItem>
                  </SharedSelectContent>
                </SharedSelect>
                <p
                  v-if="fieldError('action')"
                  class="mt-1.5 text-xs text-destructive"
                >
                  {{ fieldError("action") }}
                </p>
              </div>
            </div>

            <section
              v-if="action === 'send_email'"
              class="space-y-5 border-t border-border pt-5"
            >
              <div>
                <div class="mb-1.5 flex items-center justify-between gap-3">
                  <SharedLabel for="automation-subject" class="text-sm">
                    Subject
                  </SharedLabel>
                  <UiAutomationsVariablePicker
                    :variables="variables"
                    @select="insertSubjectVariable"
                  />
                </div>
                <div ref="subjectField" class="relative">
                  <SharedInput
                    id="automation-subject"
                    v-model="subject"
                    autocomplete="off"
                    placeholder="Thanks for meeting, {{guest_name}}"
                    :error="fieldError('payload.subject')"
                    @input="updateSubjectSuggestion"
                    @click="updateSubjectSuggestion"
                    @keyup="updateSubjectSuggestion"
                  />
                  <UiAutomationsVariableSuggestions
                    v-if="subjectVariableRange"
                    :variables="subjectSuggestions"
                    @select="insertSubjectVariable"
                  />
                </div>
              </div>

              <div>
                <SharedLabel class="mb-1.5 text-sm">Message</SharedLabel>
                <UiAutomationsRichTextEditor
                  v-model="body"
                  :variables="variables"
                  :error="fieldError('payload.body')"
                />
              </div>

              <div>
                <SharedLabel for="automation-guest-type" class="mb-1.5 text-sm">
                  Recipients
                </SharedLabel>
                <SharedSelect v-model="guestType">
                  <SharedSelectTrigger
                    id="automation-guest-type"
                    class="w-full"
                  >
                    <SharedSelectValue />
                  </SharedSelectTrigger>
                  <SharedSelectContent>
                    <SharedSelectItem value="all">All guests</SharedSelectItem>
                    <SharedSelectItem
                      v-for="item in guestTypes"
                      :key="item.value"
                      :value="item.value"
                    >
                      {{ item.label }}
                    </SharedSelectItem>
                  </SharedSelectContent>
                </SharedSelect>
                <p class="mt-1.5 text-xs text-muted-foreground">
                  Limit delivery to guests with a specific booking status.
                </p>
              </div>
            </section>

            <section
              v-else-if="action === 'add_to_contact'"
              class="grid gap-5 border-t border-border pt-5 sm:grid-cols-2"
            >
              <div>
                <SharedLabel for="contact-name" class="mb-1.5 text-sm">
                  Contact name
                </SharedLabel>
                <SharedInput
                  id="contact-name"
                  v-model="contactName"
                  autocomplete="off"
                  placeholder="Jane Doe"
                  :error="fieldError('payload.name')"
                />
              </div>
              <div>
                <SharedLabel for="contact-email" class="mb-1.5 text-sm">
                  Contact email
                </SharedLabel>
                <SharedInput
                  id="contact-email"
                  v-model="contactEmail"
                  type="email"
                  autocomplete="off"
                  placeholder="guest@example.com"
                  :error="fieldError('payload.email')"
                />
              </div>
            </section>
          </div>

          <footer
            class="flex shrink-0 justify-end gap-2 border-t border-border px-6 py-4"
          >
            <DialogClose as-child>
              <SharedButton type="button" variant="outline"
                >Cancel</SharedButton
              >
            </DialogClose>
            <SharedButton type="submit" :loading="submitting">
              Create automation
            </SharedButton>
          </footer>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
