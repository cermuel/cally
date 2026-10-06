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
import type {
  Contact,
  CreateContactPayload,
  UpdateContactPayload,
} from "~/utils/api/contacts";

const props = defineProps<{
  contact?: Contact | null;
  saving: boolean;
  errors?: Record<string, string[]>;
}>();

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{
  create: [payload: CreateContactPayload];
  update: [contact: Contact, payload: UpdateContactPayload];
}>();

const email = ref("");
const name = ref("");
const phone = ref("");
const timezone = ref("");
const company = ref("");
const tag = ref("");
const notes = ref("");
const localErrors = ref<Record<string, string>>({});

const editing = computed(() => Boolean(props.contact));
const emailLocked = computed(() => Boolean(props.contact?.platform_user_id));
const title = computed(() => (editing.value ? "Edit contact" : "Add contact"));

const fieldError = (field: string) =>
  localErrors.value[field] || props.errors?.[field]?.[0];

const resetForm = () => {
  email.value = props.contact?.email ?? "";
  name.value = props.contact?.name ?? "";
  phone.value = props.contact?.phone ?? "";
  timezone.value = props.contact?.timezone ?? "";
  company.value = props.contact?.company ?? "";
  tag.value = props.contact?.tag ?? "";
  notes.value = props.contact?.notes ?? "";
  localErrors.value = {};
};

watch(
  [open, () => props.contact],
  ([isOpen]) => {
    if (isOpen) resetForm();
  },
  { immediate: true },
);

const optionalValue = (value: string) => value.trim() || null;

const submit = () => {
  localErrors.value = {};

  if (!emailLocked.value) {
    if (!email.value.trim()) {
      localErrors.value.email = "Enter an email address.";
    } else if (!helpers.validateEmail(email.value)) {
      localErrors.value.email = "Enter a valid email address.";
    }
  }

  if (Object.keys(localErrors.value).length) return;

  const fields = {
    name: optionalValue(name.value),
    phone: optionalValue(phone.value),
    timezone: optionalValue(timezone.value),
    company: optionalValue(company.value),
    tag: optionalValue(tag.value),
    notes: optionalValue(notes.value),
  };

  if (props.contact) {
    emit("update", props.contact, {
      ...fields,
      ...(!emailLocked.value
        ? { email: email.value.trim().toLowerCase() }
        : {}),
    });
    return;
  }

  emit("create", {
    email: email.value.trim().toLowerCase(),
    name: fields.name,
    tag: fields.tag,
  });
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/60 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      >
        <header class="flex items-start gap-4 border-b border-border px-6 py-5">
          <div class="min-w-0 flex-1">
            <DialogTitle class="text-lg font-semibold">{{ title }}</DialogTitle>
            <DialogDescription class="mt-1 text-sm text-muted-foreground">
              {{
                editing
                  ? "Update this contact’s details."
                  : "Save someone you schedule meetings with."
              }}
            </DialogDescription>
          </div>
          <DialogClose as-child>
            <SharedButton
              type="button"
              variant="ghost"
              size="icon-sm"
              class="-mr-2 -mt-1"
              :aria-label="`Close ${title.toLowerCase()} dialog`"
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

        <div class="min-h-0 overflow-y-auto">
          <div class="grid gap-5 p-6 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <SharedLabel for="contact-email" class="mb-1.5 text-sm">
                Email <span v-if="!editing" aria-hidden="true">*</span>
              </SharedLabel>
              <SharedInput
                id="contact-email"
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="john@example.com"
                :disabled="emailLocked"
                :error="fieldError('email')"
                @update:model-value="localErrors.email = ''"
              />
              <p v-if="emailLocked" class="mt-1.5 text-xs text-muted-foreground">
                This contact is linked to a Cally account, so its email cannot be changed.
              </p>
            </div>

            <UiContactsTagSelect
              v-if="!editing"
              v-model="tag"
              class="sm:col-span-2"
              :error="fieldError('tag')"
            />

            <div :class="!editing && 'sm:col-span-2'">
              <SharedLabel for="contact-name" class="mb-1.5 text-sm">
                Name<span v-if="!editing" class="text-muted-foreground"> (optional)</span>
              </SharedLabel>
              <SharedInput
                id="contact-name"
                v-model="name"
                autocomplete="name"
                placeholder="John Doe"
                :error="fieldError('name')"
              />
            </div>
            <div v-if="editing">
              <SharedLabel for="contact-phone" class="mb-1.5 text-sm">Phone</SharedLabel>
              <SharedInput
                id="contact-phone"
                v-model="phone"
                type="tel"
                autocomplete="tel"
                placeholder="+44 7700 900123"
                :error="fieldError('phone')"
              />
            </div>
            <div v-if="editing">
              <SharedLabel for="contact-company" class="mb-1.5 text-sm">Company</SharedLabel>
              <SharedInput
                id="contact-company"
                v-model="company"
                autocomplete="organization"
                placeholder="Acme Ltd"
                :error="fieldError('company')"
              />
            </div>
            <UiContactsTagSelect
              v-if="editing"
              v-model="tag"
              :error="fieldError('tag')"
            />
            <div v-if="editing" class="sm:col-span-2">
              <SharedLabel for="contact-timezone" class="mb-1.5 text-sm">Timezone</SharedLabel>
              <SharedInput
                id="contact-timezone"
                v-model="timezone"
                autocomplete="off"
                placeholder="Europe/London"
                :error="fieldError('timezone')"
              />
            </div>
            <div v-if="editing" class="sm:col-span-2">
              <SharedLabel for="contact-notes" class="mb-1.5 text-sm">Notes</SharedLabel>
              <SharedTextarea
                id="contact-notes"
                v-model="notes"
                rows="4"
                placeholder="Preferences or useful context"
                :aria-invalid="Boolean(fieldError('notes'))"
              />
              <p v-if="fieldError('notes')" class="mt-1.5 text-xs text-destructive">
                {{ fieldError("notes") }}
              </p>
            </div>
          </div>

          <footer class="flex justify-end gap-2 border-t border-border px-6 py-4">
            <DialogClose as-child>
              <SharedButton type="button" variant="outline" :disabled="saving">
                Cancel
              </SharedButton>
            </DialogClose>
            <SharedButton type="button" :loading="saving" @click="submit">
              {{ editing ? "Save changes" : "Add contact" }}
            </SharedButton>
          </footer>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
