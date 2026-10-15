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
import { getApiErrorMessage, getApiFieldErrors } from "~/utils/api/client";
import {
  contactsApi,
  type Contact,
  type CreateContactBookingPayload,
} from "~/utils/api/contacts";
import type { Link } from "~/utils/api/links";
import { queryKeys } from "~/utils/api/query-keys";

const props = defineProps<{
  contact?: Contact | null;
  timezone: string;
}>();

const open = defineModel<boolean>("open", { default: false });

const client = useApiClient();
const auth = useAuth();
const queryClient = useQueryClient();
const linksQuery = useLinks({ enabled: open });

const eventId = ref("");
const contactId = ref("");
const contactOptions = shallowRef<Contact[]>([]);
const selectedContact = shallowRef<Contact | null>(props.contact ?? null);
const selectedDate = ref("");
const selectedSlotId = ref("");
const notes = ref("");
const createEventOpen = ref(false);
const createContactOpen = ref(false);
const localErrors = ref<Record<string, string>>({});
const apiErrors = ref<Record<string, string[]>>({});

const availableLinks = computed(() =>
  (linksQuery.data.value?.links ?? []).filter(
    (link) => link.is_active && link.status === "published",
  ),
);
const selectedLink = computed(() =>
  availableLinks.value.find((link) => String(link.id) === eventId.value),
);
const contactItems = computed(() => {
  if (
    selectedContact.value &&
    !contactOptions.value.some(
      (contact) => contact.id === selectedContact.value?.id,
    )
  ) {
    return [selectedContact.value, ...contactOptions.value];
  }

  return contactOptions.value;
});
const availableTimesQuery = usePublicAvailableTimes(
  computed(() =>
    selectedLink.value && selectedContact.value ? selectedLink.value.id : null,
  ),
  selectedDate,
);
const selectedSlot = computed(() =>
  (availableTimesQuery.data.value?.available_times ?? []).find(
    (slot) => slot.starts_at === selectedSlotId.value,
  ),
);
const contactName = computed(
  () =>
    selectedContact.value?.name ||
    selectedContact.value?.platformUser?.name ||
    selectedContact.value?.email ||
    "",
);
const dialogDescription = computed(() =>
  contactName.value
    ? `Setup a meeting with ${contactName.value}.`
    : "Select a contact to setup a meeting with",
);
const fieldError = (field: string) =>
  localErrors.value[field] || apiErrors.value[field]?.[0];

const createBookingMutation = useMutation({
  mutationFn: ({
    contactId,
    payload,
  }: {
    contactId: number;
    payload: CreateContactBookingPayload;
  }) => contactsApi.createBooking(client, contactId, payload),
  onSuccess: async (_response, variables) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.public.all() }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.contacts.detail(variables.contactId),
      }),
    ]);
    apiErrors.value = {};
    open.value = false;
    toast.success("Meeting scheduled");
  },
  onError: (error) => {
    apiErrors.value = getApiFieldErrors(error);
    toast.error(getApiErrorMessage(error, "Could not schedule the meeting."));
  },
});

const reset = () => {
  selectedContact.value = props.contact ?? null;
  contactId.value = props.contact ? String(props.contact.id) : "";
  contactOptions.value = props.contact ? [props.contact] : [];
  eventId.value =
    availableLinks.value.length === 1
      ? String(availableLinks.value[0]?.id)
      : "";
  selectedDate.value = "";
  selectedSlotId.value = "";
  notes.value = "";
  localErrors.value = {};
  apiErrors.value = {};
};

watch(open, (isOpen) => {
  if (isOpen) reset();
});

watch(availableLinks, (links) => {
  if (open.value && !eventId.value && links.length === 1) {
    eventId.value = String(links[0]?.id);
  }
});

watch(eventId, () => {
  selectedDate.value = "";
  selectedSlotId.value = "";
  localErrors.value.event_id = "";
  localErrors.value.starts_at = "";
});

watch(contactId, (id) => {
  selectedContact.value =
    contactItems.value.find((contact) => String(contact.id) === id) ?? null;
  localErrors.value.contact_id = "";
});

const searchContacts = async (query: string) => {
  const response = await contactsApi.list(client, {
    ...(query.trim() ? { search: query.trim() } : {}),
    sort_by: "name",
    direction: "asc",
    page: 1,
    per_page: 20,
  });
  contactOptions.value = response.contacts;
  return response.contacts;
};

const contactLabel = (contact: Contact) =>
  contact.name || contact.platformUser?.name || contact.email;
const contactSearchText = (contact: Contact) =>
  `${contactLabel(contact)} ${contact.email}`;

const handleEventCreated = (link: Link) => {
  eventId.value = String(link.id);
  createEventOpen.value = false;
};

const handleContactCreated = (contact: Contact) => {
  selectedContact.value = contact;
  contactId.value = String(contact.id);
  contactOptions.value = [
    contact,
    ...contactOptions.value.filter((option) => option.id !== contact.id),
  ];
  createContactOpen.value = false;
};

const selectDate = (date: string) => {
  selectedDate.value = date;
  selectedSlotId.value = "";
  localErrors.value.starts_at = "";
};

const selectSlot = (startsAt: string) => {
  selectedSlotId.value = startsAt;
  localErrors.value.starts_at = "";
};

const submit = async () => {
  localErrors.value = {};

  if (!eventId.value || !selectedLink.value) {
    localErrors.value.event_id = "Choose an event.";
  }

  if (!selectedContact.value) {
    localErrors.value.contact_id = "Choose a contact.";
  }

  if (selectedContact.value && (!selectedDate.value || !selectedSlot.value)) {
    localErrors.value.starts_at = "Choose an available date and time.";
  }

  if (
    Object.values(localErrors.value).some(Boolean) ||
    !selectedContact.value ||
    !selectedLink.value ||
    !selectedSlot.value
  ) {
    await nextTick();
    const firstInvalidId = localErrors.value.event_id
      ? "meeting-event"
      : localErrors.value.contact_id
        ? "meeting-contact"
        : null;
    if (firstInvalidId) document.getElementById(firstInvalidId)?.focus();
    return;
  }

  createBookingMutation.mutate({
    contactId: selectedContact.value.id,
    payload: {
      event_id: String(selectedLink.value.id),
      starts_at: selectedSlot.value.starts_at,
      ends_at: selectedSlot.value.ends_at,
      timezone: availableTimesQuery.data.value?.timezone ?? props.timezone,
      notes: notes.value.trim() || null,
    },
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
        class="fixed inset-s-1/2 top-1/2 z-60 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl outline-none duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 motion-reduce:data-[state=closed]:zoom-out-100 motion-reduce:data-[state=open]:zoom-in-100"
      >
        <header
          class="flex items-start gap-4 border-b border-border px-5 py-5 sm:px-6"
        >
          <div class="min-w-0 flex-1">
            <DialogTitle class="text-lg font-semibold tracking-tight">
              Schedule meeting
            </DialogTitle>
            <DialogDescription class="mt-1 text-sm text-muted-foreground">
              {{ dialogDescription }}
            </DialogDescription>
          </div>
          <DialogClose as-child>
            <SharedButton
              type="button"
              variant="ghost"
              size="icon-sm"
              class="-me-2 -mt-1 shrink-0 text-muted-foreground"
              aria-label="Close schedule meeting dialog"
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
          <div class="space-y-5">
            <div>
              <div class="mb-1.5 flex items-center justify-between gap-3">
                <SharedLabel for="meeting-event" class="text-sm">
                  Event
                </SharedLabel>
                <SharedButton
                  type="button"
                  variant="link"
                  size="xs"
                  class="-me-2"
                  @click="createEventOpen = true"
                >
                  Create event
                </SharedButton>
              </div>
              <SharedSearchSelect
                v-model="eventId"
                id="meeting-event"
                class="w-full"
                content-class="z-70"
                :items="availableLinks"
                :loading="linksQuery.isPending.value"
                :get-item-value="(link) => String(link.id)"
                :get-item-label="(link) => link.name"
                :get-item-text="
                  (link) => `${link.name} ${link.description ?? ''}`
                "
                :get-item-right-section="
                  (link) => `${link.duration_minutes} min`
                "
                placeholder="Select an event"
                search-placeholder="Search events..."
                :aria-invalid="Boolean(fieldError('event_id'))"
                :aria-describedby="
                  [
                    selectedLink?.description
                      ? 'meeting-event-description'
                      : '',
                    fieldError('event_id') ? 'meeting-event-error' : '',
                  ]
                    .filter(Boolean)
                    .join(' ') || undefined
                "
                @update:model-value="localErrors.event_id = ''"
              >
                <template #value="{ item }">
                  <span class="min-w-0 flex-1 truncate">{{ item.name }}</span>
                  <span class="shrink-0 text-muted-foreground">
                    {{ item.duration_minutes }} min
                  </span>
                </template>
                <template #empty>
                  <div class="space-y-1">
                    <p class="font-medium text-foreground">No events found</p>
                    <p>Create an event to schedule this meeting.</p>
                  </div>
                </template>
              </SharedSearchSelect>
              <p
                v-if="selectedLink?.description"
                id="meeting-event-description"
                class="mt-1.5 text-xs leading-5 text-muted-foreground"
              >
                {{ selectedLink.description }}
              </p>
              <p
                v-if="fieldError('event_id')"
                id="meeting-event-error"
                class="mt-1.5 text-xs text-destructive"
              >
                {{ fieldError("event_id") }}
              </p>
            </div>

            <div>
              <div class="mb-1.5 flex items-center justify-between gap-3">
                <SharedLabel for="meeting-contact" class="text-sm">
                  Contact
                </SharedLabel>
                <SharedButton
                  type="button"
                  variant="link"
                  size="xs"
                  class="-me-2"
                  @click="createContactOpen = true"
                >
                  Create contact
                </SharedButton>
              </div>
              <SharedSearchSelect
                v-model="contactId"
                id="meeting-contact"
                class="w-full"
                content-class="z-70"
                :items="contactItems"
                :search="searchContacts"
                :get-item-value="(contact) => String(contact.id)"
                :get-item-label="contactLabel"
                :get-item-text="contactSearchText"
                placeholder="Select a contact"
                search-placeholder="Search contacts..."
                :aria-invalid="Boolean(fieldError('contact_id'))"
                :aria-describedby="
                  fieldError('contact_id') ? 'meeting-contact-error' : undefined
                "
                @search-error="
                  toast.error('Could not search contacts. Please try again.')
                "
              >
                <template #value="{ item }">
                  <UiPublicProfileAvatar
                    :image="item.platformUser?.avatar ?? undefined"
                    :name="contactLabel(item)"
                    class="size-5!"
                  />
                  <span class="min-w-0 flex-1 truncate">
                    {{ contactLabel(item) }}
                  </span>
                  <span
                    v-if="contactLabel(item) !== item.email"
                    class="hidden shrink-0 text-muted-foreground sm:inline"
                  >
                    {{ item.email }}
                  </span>
                </template>
                <template #item="{ item }">
                  <UiPublicProfileAvatar
                    :image="item.platformUser?.avatar ?? undefined"
                    :name="contactLabel(item)"
                    class="size-7!"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="truncate">{{ contactLabel(item) }}</p>
                    <p
                      v-if="contactLabel(item) !== item.email"
                      class="truncate text-xs text-muted-foreground"
                    >
                      {{ item.email }}
                    </p>
                  </div>
                </template>
                <template #empty>
                  <div class="space-y-1">
                    <p class="font-medium text-foreground">No contacts found</p>
                    <p>Create a contact to schedule this meeting.</p>
                  </div>
                </template>
              </SharedSearchSelect>
              <p
                v-if="fieldError('contact_id')"
                id="meeting-contact-error"
                class="mt-1.5 text-xs text-destructive"
              >
                {{ fieldError("contact_id") }}
              </p>
            </div>

            <UiBookingsAvailabilityPicker
              v-if="selectedLink && selectedContact"
              :selected-date="selectedDate"
              :selected-slot="selectedSlotId"
              :slots="availableTimesQuery.data.value?.available_times ?? []"
              :timezone="availableTimesQuery.data.value?.timezone ?? timezone"
              :loading="availableTimesQuery.isFetching.value"
              :load-error="availableTimesQuery.isError.value"
              :error="fieldError('starts_at')"
              @retry="availableTimesQuery.refetch()"
              @select-date="selectDate"
              @select-slot="selectSlot"
            />

            <div>
              <SharedLabel for="booking-notes" class="mb-1.5 text-sm">
                Notes <span class="text-muted-foreground">(optional)</span>
              </SharedLabel>
              <SharedTextarea
                id="booking-notes"
                v-model="notes"
                :rows="3"
                placeholder="Add context for this meeting"
                :error="fieldError('notes')"
              />
            </div>
          </div>
        </div>

        <footer
          class="flex justify-end gap-2 border-t border-border px-5 py-4 sm:px-6"
        >
          <DialogClose as-child>
            <SharedButton
              type="button"
              variant="outline"
              :disabled="createBookingMutation.isPending.value"
            >
              Cancel
            </SharedButton>
          </DialogClose>
          <SharedButton
            type="button"
            :loading="createBookingMutation.isPending.value"
            @click="submit"
          >
            Schedule meeting
          </SharedButton>
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>

  <UiLinksCreateCard
    v-model:open="createEventOpen"
    :username="auth.user.value?.username"
    purpose="event"
    nested
    @created="handleEventCreated"
  />

  <UiContactsFormDialog
    v-model:open="createContactOpen"
    nested
    @saved="handleContactCreated"
  />
</template>
