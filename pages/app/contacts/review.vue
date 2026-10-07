<script setup lang="ts">
import { ArrowLeft02Icon, Download01Icon, Upload01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useQuery } from "@tanstack/vue-query";
import type { SharedTableColumn } from "~/types/table";
import { getApiErrorMessage } from "~/utils/api/client";
import {
  contactsApi,
  type ContactImportError,
} from "~/utils/api/contacts";
import { queryKeys } from "~/utils/api/query-keys";

definePageMeta({ layout: false });
useHead({ title: "Review contact import | Cally" });

const client = useApiClient();
const statusQuery = useQuery({
  queryKey: queryKeys.contacts.importStatus(),
  queryFn: () => contactsApi.importStatus(client),
});

const errors = computed(() => statusQuery.data.value?.import?.errors ?? []);
const errorColumns: SharedTableColumn<ContactImportError>[] = [
  {
    id: "row",
    header: "Row",
    accessor: "row",
    minWidth: 80,
    grow: 0,
    priority: 1,
    alwaysVisible: true,
  },
  {
    id: "email",
    header: "Email",
    accessor: "email",
    minWidth: 220,
    grow: 2,
    priority: 1,
    alwaysVisible: true,
  },
  {
    id: "errors",
    header: "Errors",
    accessor: (row) => Object.values(row.errors).flat().join("; "),
    minWidth: 320,
    grow: 3,
    priority: 1,
    alwaysVisible: true,
  },
];

const downloadErrors = () => {
  const header = "row,email,error";
  const rows = errors.value.map((item) => {
    const message = Object.values(item.errors).flat().join("; ");
    return [item.row, item.email ?? "", message]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(",");
  });
  const blob = new Blob([[header, ...rows].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "cally-contact-import-errors.csv";
  link.click();
  URL.revokeObjectURL(url);
};

const goToContacts = () => navigateTo("/app/contacts");
const retryImport = () => navigateTo("/app/contacts");
</script>

<template>
  <UiAppShell>
    <div class="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <button
          type="button"
          class="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          @click="goToContacts"
        >
          <HugeiconsIcon :icon="ArrowLeft02Icon" :size="16" :stroke-width="1.75" aria-hidden="true" />
          Back to contacts
        </button>
        <UiAppPageHeader
          title="Review import errors"
          description="Fix these rows in your CSV and upload the file again."
          class="mb-0"
        />
      </div>
      <div class="flex items-center gap-2">
        <SharedButton type="button" variant="outline" @click="retryImport">
          <HugeiconsIcon :icon="Upload01Icon" :size="16" :stroke-width="1.75" aria-hidden="true" />
          Try another upload
        </SharedButton>
        <SharedButton type="button" :disabled="!errors.length" @click="downloadErrors">
          <HugeiconsIcon :icon="Download01Icon" :size="16" :stroke-width="1.75" aria-hidden="true" />
          Download errors
        </SharedButton>
      </div>
    </div>

    <div
      v-if="statusQuery.isError.value"
      role="alert"
      class="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
    >
      {{ getApiErrorMessage(statusQuery.error.value, "Could not load import errors.") }}
    </div>

    <UiAppPageHeader
      v-else-if="!statusQuery.isPending.value && !errors.length"
      title="No import errors"
      description="There are no skipped contact rows to review."
    />

    <SharedTable
      v-else
      :columns="errorColumns"
      :rows="errors"
      row-key="row"
      label="Contact import errors"
      :loading="statusQuery.isPending.value"
      empty-title="No import errors"
      empty-description="There are no skipped contact rows to review."
    >
      <template #cell-email="{ row }">
        <span class="truncate text-muted-foreground">{{ row.email || "—" }}</span>
      </template>
      <template #cell-errors="{ row }">
        <ul class="space-y-1 text-sm text-destructive">
          <li v-for="message in Object.values(row.errors).flat()" :key="message">
            {{ message }}
          </li>
        </ul>
      </template>
    </SharedTable>
  </UiAppShell>
</template>
