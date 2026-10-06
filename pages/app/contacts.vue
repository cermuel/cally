<script setup lang="ts">
import {
  Delete02Icon,
  PlusSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { getApiErrorMessage, getApiFieldErrors } from "~/utils/api/client";
import {
  contactsApi,
  type Contact,
  type ContactListParams,
  type CreateContactBookingPayload,
  type ContactSortDirection,
  type ContactSortField,
  type CreateContactPayload,
  type UpdateContactPayload,
} from "~/utils/api/contacts";
import { queryKeys } from "~/utils/api/query-keys";

definePageMeta({ layout: false });
useHead({ title: "Contacts | Cally" });

const client = useApiClient();
const queryClient = useQueryClient();
const searchInput = ref("");
const search = ref("");
const sortBy = ref<ContactSortField>("created_at");
const direction = ref<ContactSortDirection>("desc");
const page = ref(1);
const perPage = ref(20);
const selectedIds = ref<number[]>([]);
const selectedContact = ref<Contact | null>(null);
const detailContactId = ref<number | null>(null);
const detailsOpen = ref(false);
const scheduleOpen = ref(false);
const scheduleContact = ref<Contact | null>(null);
const bookingErrors = ref<Record<string, string[]>>({});
const formOpen = ref(false);
const formErrors = ref<Record<string, string[]>>({});
const deleteOpen = ref(false);
const deleteTarget = ref<Contact | null>(null);

const params = computed<ContactListParams>(() => ({
  ...(search.value ? { search: search.value } : {}),
  sort_by: sortBy.value,
  direction: direction.value,
  page: page.value,
  per_page: perPage.value,
}));

const contactsQuery = useContacts(params);
const contacts = computed(() => contactsQuery.data.value?.contacts ?? []);
const linksQuery = useLinks({ enabled: scheduleOpen });
const auth = useAuth();
const bookingTimezone = computed(
  () =>
    auth.user.value?.timezone ||
    (import.meta.client
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC"),
);

let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchInput, (value) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    search.value = value.trim();
    page.value = 1;
    selectedIds.value = [];
  }, 300);
});
onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer);
});

const refreshContacts = () =>
  queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all() });

const openCreate = () => {
  selectedContact.value = null;
  formErrors.value = {};
  formOpen.value = true;
};

const openEdit = (contact: Contact) => {
  selectedContact.value = contact;
  formErrors.value = {};
  formOpen.value = true;
};

const openDetails = (contact: Contact) => {
  detailContactId.value = contact.id;
  detailsOpen.value = true;
};

const openSchedule = async (contact: Contact) => {
  detailsOpen.value = false;
  scheduleContact.value = contact;
  bookingErrors.value = {};
  await nextTick();
  scheduleOpen.value = true;
};

watch(detailsOpen, (isOpen) => {
  if (!isOpen) detailContactId.value = null;
});

watch(formOpen, (isOpen) => {
  if (!isOpen) {
    selectedContact.value = null;
    formErrors.value = {};
  }
});

watch(scheduleOpen, (isOpen) => {
  if (!isOpen) {
    scheduleContact.value = null;
    bookingErrors.value = {};
  }
});

const createBookingMutation = useMutation({
  mutationFn: ({ contactId, payload }: { contactId: number; payload: CreateContactBookingPayload }) =>
    contactsApi.createBooking(client, contactId, payload),
  onSuccess: async (_response, variables) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all() }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.contacts.detail(variables.contactId),
      }),
    ]);
    scheduleOpen.value = false;
    toast.success("Booking scheduled");
  },
  onError: (error) => {
    bookingErrors.value = getApiFieldErrors(error);
    toast.error(getApiErrorMessage(error, "Could not schedule the booking."));
  },
});

const createContactBooking = (payload: CreateContactBookingPayload) => {
  if (!scheduleContact.value) return;
  createBookingMutation.mutate({
    contactId: scheduleContact.value.id,
    payload,
  });
};

type SaveContactVariables =
  | { contact: Contact; payload: UpdateContactPayload }
  | { contact: null; payload: CreateContactPayload };

const saveMutation = useMutation({
  mutationFn: ({ contact, payload }: SaveContactVariables) =>
    contact
      ? contactsApi.update(client, contact.id, payload)
      : contactsApi.create(client, payload),
  onSuccess: async (_response, variables) => {
    await refreshContacts();
    formOpen.value = false;
    formErrors.value = {};
    toast.success(variables.contact ? "Contact updated" : "Contact added");
  },
  onError: (error) => {
    formErrors.value = getApiFieldErrors(error);
    toast.error(getApiErrorMessage(error, "Could not save the contact."));
  },
});

const createContact = (payload: CreateContactPayload) => {
  saveMutation.mutate({ contact: null, payload });
};

const updateContact = (contact: Contact, payload: UpdateContactPayload) => {
  saveMutation.mutate({ contact, payload });
};

const requestDelete = (contact: Contact) => {
  deleteTarget.value = contact;
  deleteOpen.value = true;
};

const requestBulkDelete = () => {
  if (!selectedIds.value.length) return;
  deleteTarget.value = null;
  deleteOpen.value = true;
};

watch(deleteOpen, (isOpen) => {
  if (!isOpen) deleteTarget.value = null;
});

const deleteMutation = useMutation({
  mutationFn: ({ target, ids }: { target: Contact | null; ids: number[] }) =>
    target
      ? contactsApi.remove(client, target.id)
      : contactsApi.removeMany(client, ids),
  onSuccess: async (_response, variables) => {
    selectedIds.value = selectedIds.value.filter(
      (id) => !variables.ids.includes(id),
    );
    await refreshContacts();
    deleteOpen.value = false;
    toast.success(
      variables.ids.length === 1 ? "Contact deleted" : "Contacts deleted",
    );
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not delete the contacts.")),
});

const confirmDelete = () => {
  const ids = deleteTarget.value
    ? [deleteTarget.value.id]
    : [...selectedIds.value];
  if (!ids.length) return;
  deleteMutation.mutate({ target: deleteTarget.value, ids });
};

const updateSort = (field: ContactSortField) => {
  if (sortBy.value === field) {
    direction.value = direction.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = field;
    direction.value = field === "created_at" ? "desc" : "asc";
  }
  page.value = 1;
};
</script>

<template>
  <UiAppShell>
    <div class="mb-8 flex items-center justify-between gap-4">
      <UiAppPageHeader
        title="Contacts"
        description="Keep track of the people you schedule meetings with."
        class="mb-0"
      />
      <SharedButton type="button" @click="openCreate">
        <HugeiconsIcon
          :icon="PlusSignIcon"
          :size="16"
          :stroke-width="1.75"
          aria-hidden="true"
        />
        Add contact
      </SharedButton>
    </div>

    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <SharedInput
        v-model="searchInput"
        type="search"
        class="sm:max-w-sm"
        placeholder="Search contacts"
        aria-label="Search contacts"
        :loading="contactsQuery.isFetching.value"
      >
        <template #prefix>
          <span class="flex items-center pl-3 text-muted-foreground">
            <HugeiconsIcon
              :icon="Search01Icon"
              :size="16"
              :stroke-width="1.75"
              aria-hidden="true"
            />
          </span>
        </template>
      </SharedInput>

      <div v-if="selectedIds.length" class="flex items-center gap-3 sm:ml-auto">
        <SharedButton
          type="button"
          variant="destructive"
          size="sm"
          @click="requestBulkDelete"
        >
          <HugeiconsIcon
            :icon="Delete02Icon"
            :size="15"
            :stroke-width="1.75"
            aria-hidden="true"
          />
          Delete {{ selectedIds.length }}
          {{ selectedIds.length > 1 ? "items" : "item" }}
        </SharedButton>
      </div>
    </div>

    <div
      v-if="contactsQuery.isError.value"
      role="alert"
      class="mb-4 flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
    >
      <p class="text-sm text-destructive">
        {{
          getApiErrorMessage(
            contactsQuery.error.value,
            "Could not load your contacts.",
          )
        }}
      </p>
      <SharedButton
        type="button"
        variant="outline"
        size="sm"
        @click="contactsQuery.refetch()"
      >
        Try again
      </SharedButton>
    </div>

    <UiContactsList
      v-model:selected-ids="selectedIds"
      :contacts="contacts"
      :pagination="contactsQuery.data.value?.pagination"
      :loading="contactsQuery.isPending.value"
      :sort-by="sortBy"
      :direction="direction"
      @delete="requestDelete"
      @edit="openEdit"
      @page="page = $event"
      @sort="updateSort"
      @view="openDetails"
    />

    <UiContactsDetailsSheet
      v-model:open="detailsOpen"
      :contact-id="detailContactId"
      @edit="openEdit"
      @schedule="openSchedule"
    />

    <UiBookingsCreateDialog
      v-model:open="scheduleOpen"
      :contact="scheduleContact"
      :links="linksQuery.data.value?.links ?? []"
      :timezone="bookingTimezone"
      :loading-links="linksQuery.isPending.value"
      :submitting="createBookingMutation.isPending.value"
      :errors="bookingErrors"
      @create="createContactBooking"
    />

    <UiContactsFormDialog
      v-model:open="formOpen"
      :contact="selectedContact"
      :saving="saveMutation.isPending.value"
      :errors="formErrors"
      @create="createContact"
      @update="updateContact"
    />

    <UiContactsDeleteDialog
      v-model:open="deleteOpen"
      :contact="deleteTarget"
      :count="deleteTarget ? 1 : selectedIds.length"
      :deleting="deleteMutation.isPending.value"
      @confirm="confirmDelete"
    />
  </UiAppShell>
</template>
