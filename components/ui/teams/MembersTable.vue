<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { SharedTableColumn } from "~/types/table";
import { getApiErrorMessage } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";
import { teamsApi, type TeamMember, type TeamRole } from "~/utils/api/teams";

const props = defineProps<{
  teamId: number;
  members: TeamMember[];
  ownerId: number;
  currentUserId?: number;
  canManageRoles: boolean;
  loading: boolean;
}>();

const client = useApiClient();
const queryClient = useQueryClient();
const updatingId = ref<number | null>(null);

const updateMutation = useMutation({
  mutationFn: ({ member, role }: { member: TeamMember; role: TeamRole }) =>
    teamsApi.updateMember(client, props.teamId, member.id, role),
  onMutate: ({ member }) => {
    updatingId.value = member.id;
  },
  onSuccess: async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.members(props.teamId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.details() }),
    ]);
    toast.success("Member role updated");
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not update the member role.")),
  onSettled: () => {
    updatingId.value = null;
  },
});

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

  updateMutation.mutate({ member, role });
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
      <UiTeamsRoleBadge
        v-if="row.user_id === ownerId"
        role="owner"
      />
      <UiTeamsRoleBadge
        v-else
        :role="row.role"
      />
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
        v-else-if="canManageRoles"
        :label="displayName(row)"
        :role="row.role"
        :disabled="!canUpdate(row)"
        :loading="updatingId === row.id"
        @update-role="updateRole(row, $event)"
      />
    </template>
  </SharedTable>
</template>
