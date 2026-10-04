<script setup lang="ts">
import { Cancel01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
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
  Automation,
  AutomationAction,
  AutomationTrigger,
  CreateAutomationPayload,
  GuestType,
} from "~/utils/api/automations";

const props = defineProps<{
  automation: Automation | null;
  variables: string[];
  submitting: boolean;
  deleting: boolean;
  errors?: Record<string, string[]>;
}>();

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{
  delete: [automation: Automation];
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
  const automation = props.automation;
  const payload = automation?.payload;
  const emailPayload = payload && "subject" in payload ? payload : undefined;
  const contactPayload = payload && "email" in payload ? payload : undefined;

  name.value = automation?.name ?? "";
  color.value = automation?.color ?? null;
  trigger.value = automation?.trigger ?? "";
  action.value = automation?.action ?? "";
  subject.value = emailPayload?.subject ?? "";
  body.value = emailPayload?.body ?? "";
  guestType.value = emailPayload?.guestType ?? "all";
  contactEmail.value = contactPayload?.email ?? "";
  contactName.value = contactPayload?.name ?? "";
  localErrors.value = {};
  subjectVariableRange.value = null;
};

watch(open, (isOpen) => {
  if (isOpen) resetForm();
});

watch(
  () => props.automation,
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

  let payload: NonNullable<CreateAutomationPayload["payload"]> = {};

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
    payload,
  });
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none"
      />
      <DialogContent
        class="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-b-0 border-border bg-muted shadow-[0_-20px_60px_oklch(0_0_0/0.2)] outline-none duration-250 ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom motion-reduce:duration-200 motion-reduce:ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:data-[state=closed]:fade-out-0 motion-reduce:data-[state=open]:fade-in-0 motion-reduce:data-[state=closed]:slide-out-to-bottom-0 motion-reduce:data-[state=open]:slide-in-from-bottom-0 md:inset-y-0 md:start-auto md:end-0 md:mx-0 md:h-dvh md:max-h-none md:w-120 md:max-w-full md:rounded-none md:border-y-0 md:border-e-0 md:shadow-[-20px_0_60px_oklch(0_0_0/0.18)] md:data-[state=closed]:slide-out-to-bottom-0 md:data-[state=open]:slide-in-from-bottom-0 md:data-[state=closed]:slide-out-to-right md:data-[state=open]:slide-in-from-right"
      >
        <div class="flex justify-center py-2.5 md:hidden" aria-hidden="true">
          <span class="h-1 w-10 rounded-full bg-border" />
        </div>

        <template v-if="automation">
          <header
            class="flex shrink-0 items-start gap-4 border-b border-border px-5 pb-5 pt-2 md:p-6"
          >
            <div class="min-w-0 flex-1">
              <DialogTitle class="text-xl font-semibold tracking-tight">
                Edit automation
              </DialogTitle>
              <DialogDescription class="mt-1 text-sm text-muted-foreground">
                Update when this runs and what Cally should do.
              </DialogDescription>
            </div>
            <DialogClose as-child>
              <SharedButton
                type="button"
                variant="ghost"
                size="icon-sm"
                class="shrink-0 text-muted-foreground"
                aria-label="Close automation details"
              >
                <HugeiconsIcon
                  :icon="Cancel01Icon"
                  :size="19"
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
            <div
              class="min-h-0 flex-1 space-y-5 overscroll-contain overflow-y-auto p-5 md:p-6"
            >
              <div>
                <SharedLabel for="edit-automation-name" class="mb-1.5 text-sm">
                  Name
                </SharedLabel>
                <SharedInput
                  id="edit-automation-name"
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

              <div class="grid gap-5 sm:grid-cols-2">
                <div>
                  <SharedLabel
                    for="edit-automation-trigger"
                    class="mb-1.5 text-sm"
                  >
                    Trigger
                  </SharedLabel>
                  <SharedSelect v-model="trigger">
                    <SharedSelectTrigger
                      id="edit-automation-trigger"
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
                  <SharedLabel
                    for="edit-automation-action"
                    class="mb-1.5 text-sm"
                  >
                    Action
                  </SharedLabel>
                  <SharedSelect v-model="action">
                    <SharedSelectTrigger
                      id="edit-automation-action"
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
                    <SharedLabel for="edit-automation-subject" class="text-sm">
                      Subject
                    </SharedLabel>
                    <UiAutomationsVariablePicker
                      :variables="variables"
                      @select="insertSubjectVariable"
                    />
                  </div>
                  <div ref="subjectField" class="relative">
                    <SharedInput
                      id="edit-automation-subject"
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
                  <SharedLabel
                    for="edit-automation-guest-type"
                    class="mb-1.5 text-sm"
                  >
                    Recipients
                  </SharedLabel>
                  <SharedSelect v-model="guestType">
                    <SharedSelectTrigger
                      id="edit-automation-guest-type"
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
                  <SharedLabel for="edit-contact-name" class="mb-1.5 text-sm">
                    Contact name
                  </SharedLabel>
                  <SharedInput
                    id="edit-contact-name"
                    v-model="contactName"
                    autocomplete="off"
                    placeholder="Jane Doe"
                    :error="fieldError('payload.name')"
                  />
                </div>
                <div>
                  <SharedLabel for="edit-contact-email" class="mb-1.5 text-sm">
                    Contact email
                  </SharedLabel>
                  <SharedInput
                    id="edit-contact-email"
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
              class="flex shrink-0 gap-2 border-t border-border bg-background/50 p-4 md:px-6"
            >
              <SharedButton
                type="submit"
                class="flex-1"
                :loading="submitting"
                :disabled="deleting"
              >
                Save changes
              </SharedButton>
              <SharedButton
                type="button"
                variant="outline"
                size="icon"
                class="text-destructive hover:bg-destructive/10 hover:text-destructive"
                :disabled="submitting || deleting"
                aria-label="Delete automation"
                @click="emit('delete', automation)"
              >
                <HugeiconsIcon
                  :icon="Delete02Icon"
                  :size="17"
                  :stroke-width="1.75"
                  aria-hidden="true"
                />
              </SharedButton>
            </footer>
          </form>
        </template>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
