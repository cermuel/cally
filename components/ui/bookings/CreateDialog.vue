<script setup lang="ts">
import {
  Calendar03Icon,
  Cancel01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
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
import type { Contact, CreateContactBookingPayload } from "~/utils/api/contacts";
import type { Link } from "~/utils/api/links";

const props = withDefaults(
  defineProps<{
    contact: Contact | null;
    links: Link[];
    timezone: string;
    loadingLinks?: boolean;
    submitting?: boolean;
    errors?: Record<string, string[]>;
  }>(),
  {
    loadingLinks: false,
    submitting: false,
    errors: () => ({}),
  },
);

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{
  create: [payload: CreateContactBookingPayload];
}>();

const eventId = ref("");
const startsAt = ref("");
const notes = ref("");
const localErrors = ref<Record<string, string>>({});

const availableLinks = computed(() =>
  props.links.filter(
    (link) => link.is_active && link.status === "published",
  ),
);
const selectedLink = computed(() =>
  availableLinks.value.find((link) => String(link.id) === eventId.value),
);
const contactName = computed(
  () =>
    props.contact?.name ||
    props.contact?.platformUser?.name ||
    props.contact?.email ||
    "this contact",
);
const fieldError = (field: string) =>
  localErrors.value[field] || props.errors[field]?.[0];

const toLocalInputValue = (date: Date) => {
  const pad = (part: number) => String(part).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const nextStartTime = () => {
  const date = new Date(Date.now() + 60 * 60_000);
  date.setMinutes(Math.ceil(date.getMinutes() / 30) * 30, 0, 0);
  return toLocalInputValue(date);
};

const toApiDate = (value: Date) => {
  const pad = (part: number) => String(part).padStart(2, "0");

  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}:00`;
};

const minimumStart = computed(() => toLocalInputValue(new Date()));

const reset = () => {
  eventId.value = availableLinks.value.length === 1
    ? String(availableLinks.value[0]?.id)
    : "";
  startsAt.value = nextStartTime();
  notes.value = "";
  localErrors.value = {};
};

watch(open, (isOpen) => {
  if (isOpen) reset();
});

watch(availableLinks, (links) => {
  if (open.value && !eventId.value && links.length === 1) {
    eventId.value = String(links[0]?.id);
  }
});

const submit = () => {
  localErrors.value = {};

  if (!eventId.value || !selectedLink.value) {
    localErrors.value.event_id = "Choose a meeting type.";
  }

  const start = new Date(startsAt.value);
  if (!startsAt.value || Number.isNaN(start.getTime())) {
    localErrors.value.starts_at = "Choose a date and time.";
  } else if (start.getTime() <= Date.now()) {
    localErrors.value.starts_at = "Choose a future date and time.";
  }

  if (Object.keys(localErrors.value).length || !props.contact || !selectedLink.value) {
    return;
  }

  const end = new Date(start.getTime() + selectedLink.value.duration_minutes * 60_000);

  emit("create", {
    event_id: String(selectedLink.value.id),
    starts_at: toApiDate(start),
    ends_at: toApiDate(end),
    timezone: props.timezone,
    notes: notes.value.trim() || null,
  });
};
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-60 bg-black/55 backdrop-blur-xs duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none"
      />
      <DialogContent
        class="fixed start-1/2 top-1/2 z-60 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl outline-none duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 motion-reduce:data-[state=closed]:zoom-out-100 motion-reduce:data-[state=open]:zoom-in-100"
      >
        <header class="flex items-start gap-4 border-b border-border px-5 py-5 sm:px-6">
          <div class="min-w-0 flex-1">
            <DialogTitle class="text-lg font-semibold tracking-tight">
              Schedule booking
            </DialogTitle>
            <DialogDescription class="mt-1 text-sm text-muted-foreground">
              Create a meeting with {{ contactName }}.
            </DialogDescription>
          </div>
          <DialogClose as-child>
            <SharedButton
              type="button"
              variant="ghost"
              size="icon-sm"
              class="-me-2 -mt-1 shrink-0 text-muted-foreground"
              aria-label="Close schedule booking dialog"
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

        <div class="min-h-0 overflow-y-auto p-5 sm:p-6">
          <div class="rounded-xl bg-muted p-3.5 ring-1 ring-border">
            <p class="truncate text-sm font-medium">{{ contactName }}</p>
            <p class="mt-0.5 truncate text-xs text-muted-foreground">
              {{ contact?.email }}
            </p>
          </div>

          <div class="mt-5 space-y-5">
            <div>
              <SharedLabel for="booking-event" class="mb-1.5 text-sm">
                Meeting type
              </SharedLabel>
              <SharedSelect
                v-model="eventId"
                :disabled="loadingLinks || !availableLinks.length"
                @update:model-value="localErrors.event_id = ''"
              >
                <SharedSelectTrigger
                  id="booking-event"
                  class="w-full"
                  :aria-invalid="Boolean(fieldError('event_id'))"
                >
                  <SharedSelectValue
                    :placeholder="loadingLinks ? 'Loading meeting types…' : 'Select a meeting type'"
                  />
                </SharedSelectTrigger>
                <SharedSelectContent>
                  <SharedSelectItem
                    v-for="link in availableLinks"
                    :key="link.id"
                    :value="String(link.id)"
                    :text-value="link.name"
                  >
                    <span class="flex w-full items-center justify-between gap-4">
                      <span>{{ link.name }}</span>
                      <span class="text-xs text-muted-foreground">
                        {{ link.duration_minutes }} min
                      </span>
                    </span>
                  </SharedSelectItem>
                </SharedSelectContent>
              </SharedSelect>
              <p
                v-if="fieldError('event_id')"
                class="mt-1.5 text-xs text-destructive"
              >
                {{ fieldError("event_id") }}
              </p>
              <p
                v-else-if="!loadingLinks && !availableLinks.length"
                class="mt-1.5 text-xs text-muted-foreground"
              >
                Publish an active booking link before scheduling a meeting.
              </p>
            </div>

            <div>
              <SharedLabel for="booking-start" class="mb-1.5 text-sm">
                Date and time
              </SharedLabel>
              <SharedInput
                id="booking-start"
                v-model="startsAt"
                type="datetime-local"
                name="booking-start"
                :min="minimumStart"
                :error="fieldError('starts_at')"
                @update:model-value="localErrors.starts_at = ''"
              >
                <template #prefix>
                  <span class="flex items-center ps-3 text-muted-foreground">
                    <HugeiconsIcon
                      :icon="Calendar03Icon"
                      :size="16"
                      :stroke-width="1.75"
                      aria-hidden="true"
                    />
                  </span>
                </template>
              </SharedInput>
              <p class="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <HugeiconsIcon
                  :icon="Clock01Icon"
                  :size="14"
                  :stroke-width="1.75"
                  aria-hidden="true"
                />
                {{ selectedLink?.duration_minutes ?? "—" }} minutes · {{ timezone }}
              </p>
            </div>

            <div>
              <SharedLabel for="booking-notes" class="mb-1.5 text-sm">
                Notes <span class="text-muted-foreground">(optional)</span>
              </SharedLabel>
              <SharedTextarea
                id="booking-notes"
                v-model="notes"
                rows="3"
                placeholder="Add context for this meeting"
                :error="fieldError('notes')"
              />
            </div>
          </div>
        </div>

        <footer class="flex justify-end gap-2 border-t border-border px-5 py-4 sm:px-6">
          <DialogClose as-child>
            <SharedButton type="button" variant="outline" :disabled="submitting">
              Cancel
            </SharedButton>
          </DialogClose>
          <SharedButton
            type="button"
            :loading="submitting"
            :disabled="loadingLinks || !availableLinks.length"
            @click="submit"
          >
            Schedule booking
          </SharedButton>
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
