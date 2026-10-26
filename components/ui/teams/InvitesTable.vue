<script setup lang="ts">
import type { SharedTableColumn } from "~/types/table";
import type { TeamInvite } from "~/utils/api/teams";

type InviteStatus = "accepted" | "declined" | "expired" | "pending";

const props = defineProps<{
  invites: TeamInvite[];
  canManageRoles: boolean;
  loading: boolean;
  resendingId?: number | null;
  updatingId?: number | null;
  deletingId?: number | null;
}>();

const emit = defineEmits<{
  delete: [invite: TeamInvite];
  resend: [invite: TeamInvite];
  updateRole: [invite: TeamInvite];
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
      <SharedPill :value="getStatus(row)" />
    </template>

    <template #cell-role="{ row }">
      <UiTeamsRoleBadge :role="row.role" />
    </template>

    <template #cell-actions="{ row }">
      <UiTeamsInviteActions
        :label="row.email"
        :disabled="!canManageRoles"
        :loading="
          resendingId === row.id ||
          updatingId === row.id ||
          deletingId === row.id
        "
        :can-update-role="getStatus(row) === 'pending'"
        @resend="emit('resend', row)"
        @update-role="emit('updateRole', row)"
        @delete="emit('delete', row)"
      />
    </template>
  </SharedTable>
</template>
