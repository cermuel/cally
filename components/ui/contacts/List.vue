<script setup lang="ts">
import {
  ArrowDown02Icon,
  ArrowUp02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { getContactTagColor } from "~/constants/contact-tags";
import type {
  SharedTableColumn,
  SharedTableColumnPriority,
} from "~/types/table";
import type {
  Contact,
  ContactPagination,
  ContactSortDirection,
  ContactSortField,
} from "~/utils/api/contacts";

const props = defineProps<{
  contacts: Contact[];
  pagination?: ContactPagination;
  perPage: number;
  loading: boolean;
  sortBy: ContactSortField;
  sortingField?: ContactSortField | null;
  direction: ContactSortDirection;
}>();

const selectedIds = defineModel<number[]>("selectedIds", {
  default: () => [],
});

const emit = defineEmits<{
  delete: [contact: Contact];
  edit: [contact: Contact];
  page: [page: number];
  sort: [field: ContactSortField];
  view: [contact: Contact];
  "per-page": [value: number];
}>();

const selectedSet = computed(() => new Set(selectedIds.value));
const allSelected = computed<boolean | "indeterminate">(() => {
  if (!props.contacts.length) return false;
  const selectedCount = props.contacts.filter((contact) =>
    selectedSet.value.has(contact.id),
  ).length;
  if (!selectedCount) return false;
  return selectedCount === props.contacts.length ? true : "indeterminate";
});

const toggleAll = (checked: boolean | "indeterminate") => {
  const pageIds = new Set(props.contacts.map((contact) => contact.id));
  const next = selectedIds.value.filter((id) => !pageIds.has(id));
  if (checked === true) next.push(...pageIds);
  selectedIds.value = next;
};

const toggleContact = (id: number, checked: boolean | "indeterminate") => {
  if (checked === true) {
    selectedIds.value = [...new Set([...selectedIds.value, id])];
    return;
  }
  selectedIds.value = selectedIds.value.filter(
    (selectedId) => selectedId !== id,
  );
};

const sortableColumn = (
  id: ContactSortField,
  header: string,
  options: Omit<Partial<SharedTableColumn<Contact>>, "priority"> & {
    priority: SharedTableColumnPriority;
  },
): SharedTableColumn<Contact> => ({
  id,
  header,
  accessor: id,
  onHeaderClick: () => emit("sort", id),
  ...options,
});

const columns = computed<SharedTableColumn<Contact>[]>(() => [
  {
    id: "select",
    header: "Select",
    minWidth: 40,
    grow: 0,
    priority: 1,
    alwaysVisible: true,
    align: "center",
    headerClassName: "px-2!",
    bodyClassName: "px-2!",
  },
  sortableColumn("name", "Name", {
    minWidth: 190,
    grow: 2,
    priority: 1,
    alwaysVisible: true,
  }),
  sortableColumn("email", "Email", { minWidth: 210, grow: 2, priority: 3 }),
  sortableColumn("company", "Company", { minWidth: 140, priority: 6 }),
  sortableColumn("tag", "Tag", { minWidth: 110, priority: 2 }),
  sortableColumn("bookings_count", "Bookings", {
    minWidth: 92,
    grow: 0,
    priority: 5,
    align: "center",
  }),
  sortableColumn("last_booked_at", "Last booked", {
    minWidth: 140,
    priority: 6,
  }),
  sortableColumn("created_at", "Date added", {
    minWidth: 130,
    priority: 5,
  }),
  {
    id: "actions",
    header: "",
    minWidth: 78,
    grow: 0,
    priority: 1,
    alwaysVisible: true,
    align: "end",
  },
]);

const formatDate = (value: string | null) => {
  if (!value) return "Never";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value),
  );
};

const displayName = (contact: Contact) =>
  contact.name || contact.platformUser?.name || "Unnamed contact";

const initials = (contact: Contact) => {
  const value = displayName(contact);
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};
</script>

<template>
  <SharedTable
    :columns="columns"
    :rows="contacts"
    row-key="id"
    label="Contacts"
    :loading="loading"
    empty-title="No contacts found"
    empty-description="Add a contact or change your search to see results."
  >
    <template #header="{ column }">
      <SharedCheckbox
        v-if="column.id === 'select'"
        :model-value="allSelected"
        aria-label="Select all contacts on this page"
        @update:model-value="toggleAll"
      />
      <template v-else>
        <span class="truncate">{{ column.header }}</span>
        <HugeiconsIcon
          v-if="column.id === sortingField"
          :icon="Loading03Icon"
          :size="14"
          :stroke-width="1.75"
          class="ml-1.5 shrink-0 animate-spin"
          aria-hidden="true"
        />
        <HugeiconsIcon
          v-else-if="column.id === sortBy"
          :icon="direction === 'asc' ? ArrowUp02Icon : ArrowDown02Icon"
          :size="14"
          :stroke-width="1.75"
          class="ml-1.5 shrink-0"
          aria-hidden="true"
        />
      </template>
    </template>

    <template #cell-select="{ row }">
      <SharedCheckbox
        :model-value="selectedSet.has(row.id)"
        :aria-label="`Select ${displayName(row)}`"
        @update:model-value="toggleContact(row.id, $event)"
      />
    </template>

    <template #cell-name="{ row }">
      <button
        type="button"
        class="flex min-w-0 items-center gap-2.5 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
        @click="emit('view', row)"
      >
        <UiPublicProfileAvatar :name="row.name ?? ''" class="size-6!" />
        <span class="truncate font-medium">{{ displayName(row) }}</span>
      </button>
    </template>

    <template #cell-email="{ row }">
      <a
        :href="`mailto:${row.email}`"
        class="truncate text-muted-foreground hover:text-foreground hover:underline"
      >
        {{ row.email }}
      </a>
    </template>

    <template #cell-company="{ row }">
      <span class="truncate text-muted-foreground">{{
        row.company || "—"
      }}</span>
    </template>

    <template #cell-tag="{ row }">
      <span
        v-if="row.tag"
        class="max-w-full truncate rounded-md px-2 py-0.5 text-xs font-medium text-black ring-1 ring-black/10"
        :style="{ backgroundColor: getContactTagColor(row.tag) }"
      >
        {{ row.tag }}
      </span>
      <span v-else class="text-muted-foreground">—</span>
    </template>

    <template #cell-bookings_count="{ row }">
      <span class="tabular-nums">{{ row.bookings_count }}</span>
    </template>

    <template #cell-last_booked_at="{ row }">
      <span class="text-muted-foreground">{{
        formatDate(row.last_booked_at)
      }}</span>
    </template>

    <template #cell-created_at="{ row }">
      <span class="text-muted-foreground">{{
        formatDate(row.created_at)
      }}</span>
    </template>

    <template #cell-actions="{ row }">
      <UiContactsActions
        :label="displayName(row)"
        @edit="emit('edit', row)"
        @delete="emit('delete', row)"
      />
    </template>
  </SharedTable>

  <div
    v-if="pagination"
    class="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    aria-label="Contact pages"
  >
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <span>Rows per page</span>
      <SharedSelect
        :model-value="String(perPage)"
        @update:model-value="emit('per-page', Number($event))"
      >
        <SharedSelectTrigger size="sm" aria-label="Rows per page">
          <SharedSelectValue />
        </SharedSelectTrigger>
        <SharedSelectContent>
          <SharedSelectItem v-for="size in [10, 20, 50, 100]" :key="size" :value="String(size)">
            {{ size }}
          </SharedSelectItem>
        </SharedSelectContent>
      </SharedSelect>
    </div>

    <div v-if="pagination.last_page > 1" class="flex items-center justify-between gap-4 sm:justify-end">
      <SharedButton
        type="button"
        variant="outline"
        size="sm"
        :disabled="pagination.current_page === 1"
        @click="emit('page', pagination.current_page - 1)"
      >
        Previous
      </SharedButton>
      <p class="text-sm text-muted-foreground">
        Page {{ pagination.current_page }} of {{ pagination.last_page }}
      </p>
      <SharedButton
        type="button"
        variant="outline"
        size="sm"
        :disabled="pagination.current_page === pagination.last_page"
        @click="emit('page', pagination.current_page + 1)"
      >
        Next
      </SharedButton>
    </div>
  </div>
</template>
