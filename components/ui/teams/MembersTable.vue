<script setup lang="ts">
import { CrownIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { SharedTableColumn } from "~/types/table";
import type { TeamMember, TeamRole } from "~/utils/api/teams";

const props = defineProps<{
  members: TeamMember[];
  ownerId: number;
  currentUserId?: number;
  canManageRoles: boolean;
  loading: boolean;
  updatingId?: number | null;
}>();

const emit = defineEmits<{
  updateRole: [member: TeamMember, role: TeamRole];
}>();

const columns: SharedTableColumn<TeamMember>[] = [
  {
    id: "member",
    header: "Member",
    minWidth: 220,
    grow: 2,
    priority: 1,
    alwaysVisible: true,
  },
  {
    id: "email",
    header: "Email",
    minWidth: 220,
    grow: 2,
    priority: 3,
  },
  {
    id: "joined",
    header: "Joined",
    minWidth: 140,
    priority: 5,
  },
  {
    id: "role",
    header: "Role",
    minWidth: 120,
    priority: 2,
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

const displayName = (member: TeamMember) =>
  member.user?.name || member.user?.email || "Team member";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value),
  );

const canUpdate = (member: TeamMember) =>
  props.canManageRoles &&
  member.user_id !== props.currentUserId &&
  member.user_id !== props.ownerId;

const updateRole = (member: TeamMember, role: TeamRole) => {
  if (!canUpdate(member) || role === member.role) return;

  emit("updateRole", member, role);
};
</script>

<template>
  <SharedTable
    :columns="columns"
    :rows="members"
    row-key="id"
    label="Team members"
    :loading="loading"
    empty-title="No members found"
    empty-description="This team does not have any members yet."
  >
    <template #cell-member="{ row }">
      <div class="flex min-w-0 items-center gap-2.5 text-left">
        <SharedAvatar
          :name="displayName(row)"
          :image="row.user?.avatar || undefined"
          class="size-7 border border-border"
        />
        <div class="min-w-0">
          <p class="truncate font-medium">{{ displayName(row) }}</p>
        </div>
      </div>
    </template>

    <template #cell-email="{ row }">
      <a
        v-if="row.user?.email"
        :href="`mailto:${row.user.email}`"
        class="truncate text-muted-foreground hover:text-foreground hover:underline"
      >
        {{ row.user.email }}
      </a>
      <span v-else class="text-muted-foreground">—</span>
    </template>

    <template #cell-joined="{ row }">
      <span class="text-muted-foreground">{{
        formatDate(row.created_at)
      }}</span>
    </template>

    <template #cell-role="{ row }">
      <span
        v-if="row.user_id === ownerId"
        class="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-medium"
      >
        <HugeiconsIcon
          :icon="CrownIcon"
          :size="13"
          :stroke-width="1.75"
          aria-hidden="true"
        />
        Owner
      </span>
      <span
        v-else
        class="rounded-md bg-muted px-2.5 py-1 text-xs font-medium capitalize"
      >
        {{ row.role }}
      </span>
    </template>

    <template #cell-actions="{ row }">
      <span
        v-if="row.user_id === currentUserId"
        role="img"
        aria-label="This is you"
        title="This is you"
        class="text-lg"
      >
        🫵🏾
      </span>
      <UiTeamsMemberActions
        v-else
        :label="displayName(row)"
        :role="row.role"
        :disabled="!canUpdate(row)"
        :loading="updatingId === row.id"
        @update-role="updateRole(row, $event)"
      />
    </template>
  </SharedTable>
</template>
