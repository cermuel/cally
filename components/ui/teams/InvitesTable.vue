<script setup lang="ts">
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { SharedTableColumn } from "~/types/table";
import type { TeamInvite, TeamRole } from "~/utils/api/teams";

type InviteStatus = "accepted" | "declined" | "expired" | "pending";

const props = defineProps<{
  invites: TeamInvite[];
  canManageRoles: boolean;
  loading: boolean;
  updatingId?: number | null;
  deletingId?: number | null;
}>();

const emit = defineEmits<{
  updateRole: [invite: TeamInvite, role: TeamRole];
  delete: [invite: TeamInvite];
}>();

const columns: SharedTableColumn<TeamInvite>[] = [
  {
    id: "email",
    header: "Email",
    accessor: "email",
    minWidth: 250,
    grow: 2,
    priority: 1,
    alwaysVisible: true,
  },
  {
    id: "expires",
    header: "Expires",
    minWidth: 160,
    priority: 4,
  },
  {
    id: "status",
    header: "Status",
    minWidth: 120,
    priority: 1,
    alwaysVisible: true,
  },
  {
    id: "role",
    header: "Role",
    minWidth: 150,
    priority: 1,
    alwaysVisible: true,
    align: "start",
  },
  {
    id: "actions",
    header: "",
    minWidth: 64,
    grow: 0,
    priority: 1,
    alwaysVisible: true,
    align: "end",
  },
];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value),
  );

const getStatus = (invite: TeamInvite): InviteStatus => {
  if (invite.accepted_at) return "accepted";
  if (invite.declined_at) return "declined";
  if (new Date(invite.expires_at).getTime() <= Date.now()) return "expired";
  return "pending";
};

const statusClass: Record<InviteStatus, string> = {
  accepted:
    "border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  declined:
    "border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20",
  expired: "border-transparent bg-muted text-muted-foreground",
  pending:
    "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

const updateRole = (invite: TeamInvite, value: unknown) => {
  if (
    !props.canManageRoles ||
    getStatus(invite) !== "pending" ||
    (value !== "admin" && value !== "member") ||
    value === invite.role
  ) {
    return;
  }

  emit("updateRole", invite, value);
};
</script>

<template>
  <SharedTable
    :columns="columns"
    :rows="invites"
    row-key="id"
    label="Team invitations"
    :loading="loading"
    empty-title="No invitations"
    empty-description="Invitations you send will appear here."
  >
    <template #cell-email="{ row }">
      <a
        :href="`mailto:${row.email}`"
        class="truncate font-medium hover:underline"
      >
        {{ row.email }}
      </a>
    </template>

    <template #cell-expires="{ row }">
      <span class="text-muted-foreground">{{
        formatDate(row.expires_at)
      }}</span>
    </template>

    <template #cell-status="{ row }">
      <span
        class="inline-flex w-fit shrink-0 items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap capitalize"
        :class="statusClass[getStatus(row)]"
      >
        {{ getStatus(row) }}
      </span>
    </template>

    <template #cell-role="{ row }">
      <SharedSelect
        :model-value="row.role"
        :disabled="
          !canManageRoles ||
          getStatus(row) !== 'pending' ||
          updatingId === row.id
        "
        @update:model-value="updateRole(row, $event)"
      >
        <SharedSelectTrigger
          size="sm"
          class="w-28 capitalize"
          :aria-label="`Role for ${row.email}`"
        >
          <SharedSelectValue />
        </SharedSelectTrigger>
        <SharedSelectContent>
          <SharedSelectItem value="admin">Admin</SharedSelectItem>
          <SharedSelectItem value="member">Member</SharedSelectItem>
        </SharedSelectContent>
      </SharedSelect>
    </template>

    <template #cell-actions="{ row }">
      <SharedButton
        type="button"
        variant="ghost"
        size="icon-sm"
        class="text-muted-foreground hover:text-destructive"
        :disabled="!canManageRoles || deletingId === row.id"
        :loading="deletingId === row.id"
        :aria-label="`Delete invite for ${row.email}`"
        @click="emit('delete', row)"
      >
        <HugeiconsIcon
          :icon="Delete02Icon"
          :size="17"
          :stroke-width="1.75"
          aria-hidden="true"
        />
      </SharedButton>
    </template>
  </SharedTable>
</template>
