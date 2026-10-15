<script setup lang="ts">
import { Delete02Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { getApiErrorMessage } from "~/utils/api/client";
import {
  contactsApi,
  type Contact,
  type ContactImport,
  type ContactListParams,
  type ContactSortDirection,
  type ContactSortField,
} from "~/utils/api/contacts";
import { queryKeys } from "~/utils/api/query-keys";

definePageMeta({ layout: false });
useHead({ title: "Contacts" });

const client = useApiClient();
const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const searchInput = ref("");
const search = ref("");
const sortBy = ref<ContactSortField>("created_at");
const direction = ref<ContactSortDirection>("desc");
const page = ref(1);
const perPage = ref(20);
const searching = ref(false);
const sortingField = ref<ContactSortField | null>(null);
const selectedIds = ref<number[]>([]);
const selectedContact = ref<Contact | null>(null);
const detailContactId = computed(() => {
  const value = route.query.contact_id;
  const rawId = Array.isArray(value) ? value[0] : value;
  if (!rawId || !/^\d+$/.test(rawId)) return null;

  const id = Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
});
const detailsOpen = computed(() => detailContactId.value !== null);
const scheduleOpen = ref(false);
const scheduleContact = ref<Contact | null>(null);
const formOpen = ref(false);
const deleteOpen = ref(false);
const deleteContactId = ref<number | null>(null);
const deleteContactLabel = ref<string | null>(null);
const contactImport = ref<ContactImport | null>(null);
const importActivityOpen = ref(false);

const params = computed<ContactListParams>(() => ({
  ...(search.value ? { search: search.value } : {}),
  sort_by: sortBy.value,
  direction: direction.value,
  page: page.value,
  per_page: perPage.value,
}));

const contactsQuery = useContacts(params);
const contacts = computed(() => contactsQuery.data.value?.contacts ?? []);
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
    const nextSearch = value.trim();
    if (nextSearch === search.value) return;
    searching.value = true;
    search.value = nextSearch;
    page.value = 1;
    selectedIds.value = [];
  }, 300);
});

watch(
  () => contactsQuery.isFetching.value,
  (isFetching) => {
    if (isFetching) return;
    searching.value = false;
    sortingField.value = null;
  },
);
onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer);
});

const refreshContacts = () =>
  queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all() });

const openCreate = () => {
  selectedContact.value = null;
  formOpen.value = true;
};

const openEdit = (contact: Contact) => {
  selectedContact.value = contact;
  formOpen.value = true;
};

const openDetails = (contact: Contact) => {
  void router.push({
    query: {
      ...route.query,
      contact_id: String(contact.id),
    },
  });
};

const setDetailsOpen = (open: boolean) => {
  if (open || detailContactId.value === null) return;
  void router.replace({
    query: {
      ...route.query,
      contact_id: undefined,
    },
  });
};

const openSchedule = async (contact: Contact) => {
  setDetailsOpen(false);
  scheduleContact.value = contact;
  await nextTick();
  scheduleOpen.value = true;
};

watch(formOpen, (isOpen) => {
  if (!isOpen) {
    selectedContact.value = null;
  }
});

watch(scheduleOpen, (isOpen) => {
  if (!isOpen) {
    scheduleContact.value = null;
  }
});

const requestDelete = (contact: Contact) => {
  deleteContactId.value = contact.id;
  deleteContactLabel.value = contact.name || contact.email;
  deleteOpen.value = true;
};

const requestBulkDelete = () => {
  if (!selectedIds.value.length) return;
  deleteContactId.value = null;
  deleteContactLabel.value = null;
  deleteOpen.value = true;
};

watch(deleteOpen, (isOpen) => {
  if (isOpen) return;
  deleteContactId.value = null;
  deleteContactLabel.value = null;
});

const removeDeletedSelection = (deletedIds: number[]) => {
  selectedIds.value = selectedIds.value.filter(
    (id) => !deletedIds.includes(id),
  );
};

const importStatusQuery = useQuery({
  queryKey: queryKeys.contacts.importStatus(),
  queryFn: () => contactsApi.importStatus(client),
  refetchOnWindowFocus: false,
  refetchInterval: (query) => {
    const status = query.state.data?.import?.status;
    return status === "pending" || status === "processing" ? 1500 : false;
  },
});

watch(
  () => importStatusQuery.data.value?.import,
  (nextImport) => {
    if (!nextImport) return;

    const isActive =
      nextImport.status === "pending" || nextImport.status === "processing";

    if (!contactImport.value || nextImport.id !== contactImport.value.id) {
      if (isActive) {
        contactImport.value = nextImport;
        importActivityOpen.value = true;
      }
      return;
    }

    contactImport.value = nextImport;
    if (nextImport.status === "completed") refreshContacts();
  },
);


const updateSort = (field: ContactSortField) => {
  sortingField.value = field;
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
        description="Keep track of the people you schedule meeting with."
        class="mb-0"
      />
      <UiContactsCreateMenu
        @add-single="openCreate"
      />
    </div>

    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <SharedInput
        v-model="searchInput"
        type="search"
        class="sm:max-w-sm"
        placeholder="Search contacts"
        aria-label="Search contacts"
        :loading="searching"
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
          v-if="selectedIds.length"
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
      :per-page="perPage"
      :loading="contactsQuery.isPending.value"
      :sort-by="sortBy"
      :sorting-field="sortingField"
      :direction="direction"
      @delete="requestDelete"
      @edit="openEdit"
      @page="page = $event"
      @per-page="
        perPage = $event;
        page = 1;
        selectedIds = [];
      "
      @sort="updateSort"
      @view="openDetails"
    />

    <UiContactsDetailsSheet
      :open="detailsOpen"
      :contact-id="detailContactId"
      @update:open="setDetailsOpen"
      @edit="openEdit"
      @schedule="openSchedule"
    />

    <UiBookingsCreateDialog
      v-model:open="scheduleOpen"
      :contact="scheduleContact"
      :timezone="bookingTimezone"
    />

    <UiContactsFormDialog
      v-model:open="formOpen"
      :contact="selectedContact"
    />

    <UiContactsDeleteDialog
      v-model:open="deleteOpen"
      :contact-id="deleteContactId"
      :contact-label="deleteContactLabel"
      :contact-ids="selectedIds"
      @deleted="removeDeletedSelection"
    />

    <UiContactsImportActivity
      v-if="importActivityOpen && contactImport"
      :contact-import="contactImport"
      @cancelled="
        importActivityOpen = false;
        contactImport = null;
      "
    />
  </UiAppShell>
</template>
