<script setup lang="ts">
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
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
import {
  addToContactPlaceholderPayload,
  allowedAutomationActions,
  automationActions,
  automationTriggers,
  guestTypes,
} from "~/constants/automations";
import {
  automationsApi,
  type AutomationAction,
  type AutomationTemplate,
  type AutomationTrigger,
  type CreateAutomationPayload,
  type GuestType,
} from "~/utils/api/automations";
import { getApiErrorMessage, getApiFieldErrors } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";

const props = defineProps<{
  template?: AutomationTemplate | null;
  variables: string[];
}>();

const open = defineModel<boolean>("open", { default: false });

const client = useApiClient();
const queryClient = useQueryClient();

const name = ref("");
const color = ref<string | null>(null);
const trigger = ref<AutomationTrigger | "">("");
const action = ref<AutomationAction | "">("");
const subject = ref("");
const body = ref("");
const guestType = ref<GuestType | "all">("all");
const localErrors = ref<Record<string, string>>({});
const apiErrors = ref<Record<string, string[]>>({});
const subjectEditor = ref<{ insertVariable: (variable: string) => void } | null>(
  null,
);

const availableActions = computed(() =>
  trigger.value
    ? automationActions.filter((item) =>
        allowedAutomationActions[trigger.value as AutomationTrigger].includes(
          item.value,
        ),
      )
    : automationActions,
);

const fieldError = (field: string) =>
  localErrors.value[field] || apiErrors.value[field]?.[0];

const createMutation = useMutation({
  mutationFn: (payload: CreateAutomationPayload) =>
    automationsApi.create(client, payload),
  onSuccess: async (response) => {
    if (!response.automation) {
      toast.info(response.message);
      open.value = false;
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: queryKeys.automations.list(),
    });
    apiErrors.value = {};
    open.value = false;
    toast.success("Automation created");
  },
  onError: (error) => {
    apiErrors.value = getApiFieldErrors(error);
    toast.error(getApiErrorMessage(error, "Could not create the automation."));
  },
});

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
  localErrors.value = {};
  apiErrors.value = {};
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

const insertSubjectVariable = (variable: string) =>
  subjectEditor.value?.insertVariable(variable);

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
    payload = addToContactPlaceholderPayload;
  }

  createMutation.mutate({
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

        <div
          class="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div class="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
            <div class="space-y-5">
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

            <div class="space-y-5">
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
                <UiAutomationsVariableTextInput
                  ref="subjectEditor"
                  v-model="subject"
                  :variables="variables"
                  placeholder="Thanks for meeting, {{guest_name}}"
                  :error="fieldError('payload.subject')"
                />
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
              class="border-t border-border pt-5"
            >
              <p class="text-sm font-medium">Save every booking guest</p>
              <p class="mt-1 text-sm leading-6 text-muted-foreground">
                When a booking is created, Cally will add each new guest to
                your contacts. Guests who are already contacts are skipped.
              </p>
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
            <SharedButton
              type="button"
              :loading="createMutation.isPending.value"
              @click="submit"
            >
              Create automation
            </SharedButton>
          </footer>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
