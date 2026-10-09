<script setup lang="ts">
import { UserGroupIcon } from "@hugeicons/core-free-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { getApiErrorMessage } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";
import {
  teamsApi,
  type CreateTeamInvitesPayload,
  type TeamInvite,
  type TeamMember,
  type TeamRole,
} from "~/utils/api/teams";

definePageMeta({ layout: false });

const client = useApiClient();
const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const breadcrumb = useBreadcrumb();
const auth = useAuth();
const teamId = computed(() => {
  const value = Number(route.params.id);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
});
const teamQuery = useTeam(teamId);
const inviteOpen = ref(route.query.welcome === "1");
const deleteInviteOpen = ref(false);
const selectedInvite = ref<TeamInvite | null>(null);
const updatingMemberId = ref<number | null>(null);
const updatingInviteId = ref<number | null>(null);
const teamActionOpen = ref(false);
const teamAction = ref<"delete" | "leave">("leave");

const membersQuery = useQuery({
  queryKey: computed(() => queryKeys.teams.members(teamId.value ?? "none")),
  queryFn: () => teamsApi.listMembers(client, teamId.value!),
  enabled: computed(() => teamId.value !== null),
});

const invitesQuery = useQuery({
  queryKey: computed(() => queryKeys.teams.invites(teamId.value ?? "none")),
  queryFn: () => teamsApi.listInvites(client, teamId.value!),
  enabled: computed(() => teamId.value !== null),
});

const members = computed(
  () => membersQuery.data.value?.members ?? teamQuery.data.value?.team.members ?? [],
);
const invites = computed(() => invitesQuery.data.value?.invites ?? []);
const currentMember = computed(() =>
  members.value.find((member) => member.user_id === auth.user.value?.id),
);
const canManageRoles = computed(
  () => currentMember.value?.role === "admin",
);
const isOwner = computed(
  () => teamQuery.data.value?.team.owner_id === auth.user.value?.id,
);

useHead(() => ({
  title: teamQuery.data.value?.team
    ? `${teamQuery.data.value.team.name} | Cally`
    : "Team | Cally",
}));

watch(
  () => teamQuery.data.value?.team,
  (team) => {
    if (!team) return;
    breadcrumb.setItems([
      { title: "Teams", route: "/app/teams", icon: UserGroupIcon },
      { title: team.name },
    ]);
  },
  { immediate: true },
);

watch(inviteOpen, (isOpen) => {
  if (isOpen || route.query.welcome !== "1") return;
  void router.replace({ query: { ...route.query, welcome: undefined } });
});

const inviteMutation = useMutation({
  mutationFn: (payload: CreateTeamInvitesPayload) =>
    teamsApi.invite(client, teamId.value!, payload),
  onSuccess: async (_response, payload) => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.teams.invites(teamId.value!),
    });
    inviteOpen.value = false;
    toast.success(
      payload.users.length === 1
        ? "Invitation sent"
        : `${payload.users.length} invitations sent`,
    );
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not send the invitations.")),
});

const updateMemberMutation = useMutation({
  mutationFn: ({ member, role }: { member: TeamMember; role: TeamRole }) =>
    teamsApi.updateMember(client, teamId.value!, member.id, role),
  onMutate: ({ member }) => {
    updatingMemberId.value = member.id;
  },
  onSuccess: async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.members(teamId.value!),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.detail(teamId.value!),
      }),
    ]);
    toast.success("Member role updated");
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not update the member role.")),
  onSettled: () => {
    updatingMemberId.value = null;
  },
});

const updateInviteMutation = useMutation({
  mutationFn: ({ invite, role }: { invite: TeamInvite; role: TeamRole }) =>
    teamsApi.updateInvite(client, teamId.value!, invite.id, role),
  onMutate: ({ invite }) => {
    updatingInviteId.value = invite.id;
  },
  onSuccess: async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.teams.invites(teamId.value!),
    });
    toast.success("Invitation role updated");
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not update the invitation role.")),
  onSettled: () => {
    updatingInviteId.value = null;
  },
});

const deleteInviteMutation = useMutation({
  mutationFn: (invite: TeamInvite) =>
    teamsApi.removeInvite(client, teamId.value!, invite.id),
  onSuccess: async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.teams.invites(teamId.value!),
    });
    deleteInviteOpen.value = false;
    selectedInvite.value = null;
    toast.success("Invitation deleted");
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not delete the invitation.")),
});

const deleteTeamMutation = useMutation({
  mutationFn: () => teamsApi.remove(client, teamId.value!),
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
    toast.success("Team deleted");
    await navigateTo("/app/teams");
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not delete the team.")),
});

const leaveTeamMutation = useMutation({
  mutationFn: () => teamsApi.leave(client, teamId.value!),
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
    toast.success("You left the team");
    await navigateTo("/app/teams");
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not leave the team.")),
});

const teamActionPending = computed(
  () => deleteTeamMutation.isPending.value || leaveTeamMutation.isPending.value,
);

const updateMemberRole = (member: TeamMember, role: TeamRole) => {
  if (
    !canManageRoles.value ||
    member.user_id === auth.user.value?.id ||
    member.user_id === teamQuery.data.value?.team.owner_id
  ) {
    return;
  }

  updateMemberMutation.mutate({ member, role });
};

const updateInviteRole = (invite: TeamInvite, role: TeamRole) => {
  if (!canManageRoles.value) return;
  updateInviteMutation.mutate({ invite, role });
};

const requestDeleteInvite = (invite: TeamInvite) => {
  if (!canManageRoles.value) return;
  selectedInvite.value = invite;
  deleteInviteOpen.value = true;
};

const confirmDeleteInvite = () => {
  if (!selectedInvite.value || !canManageRoles.value) return;
  deleteInviteMutation.mutate(selectedInvite.value);
};

const requestTeamAction = (action: "delete" | "leave") => {
  if ((action === "delete" && !isOwner.value) || (action === "leave" && isOwner.value)) {
    return;
  }

  teamAction.value = action;
  teamActionOpen.value = true;
};

const confirmTeamAction = () => {
  if (teamAction.value === "delete") {
    if (isOwner.value) deleteTeamMutation.mutate();
    return;
  }

  if (!isOwner.value) leaveTeamMutation.mutate();
};
</script>

<template>
  <UiAppShell>
    <div v-if="teamQuery.isPending.value" class="space-y-5" aria-label="Loading team">
      <div class="h-16 w-64 animate-pulse rounded-lg bg-muted/50" />
      <div class="h-64 animate-pulse rounded-xl bg-muted/50" />
    </div>

    <div
      v-else-if="teamQuery.isError.value || !teamQuery.data.value?.team"
      class="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center"
    >
      <h1 class="font-semibold">Team not found</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        This team may not exist, or you may not have access to it.
      </p>
      <SharedButton as-child variant="outline" class="mt-5">
        <NuxtLink to="/app/teams">Back to teams</NuxtLink>
      </SharedButton>
    </div>

    <template v-else>
      <header class="mb-8 border-b border-border pb-8">
        <div class="flex items-center gap-4">
          <UiTeamsMemberAvatars :members="members" />
          <div class="min-w-0">
            <h1 class="truncate text-2xl font-semibold tracking-tight">
              {{ teamQuery.data.value.team.name }}
            </h1>
            <div
              v-if="teamQuery.data.value.team.description"
              class="team-description mt-1.5 max-w-3xl text-sm leading-6 text-muted-foreground"
              v-html="teamQuery.data.value.team.description"
            />
          </div>
        </div>
      </header>

      <UiTeamsDetailsTabs
        :members="members"
        :invites="invites"
        :owner-id="teamQuery.data.value.team.owner_id"
        :current-user-id="auth.user.value?.id"
        :can-manage-roles="canManageRoles"
        :members-loading="membersQuery.isPending.value"
        :invites-loading="invitesQuery.isPending.value"
        :members-error="membersQuery.isError.value"
        :invites-error="invitesQuery.isError.value"
        :is-owner="isOwner"
        :updating-member-id="updatingMemberId"
        :updating-invite-id="updatingInviteId"
        :deleting-invite-id="
          deleteInviteMutation.isPending.value ? selectedInvite?.id : null
        "
        @update-member-role="updateMemberRole"
        @update-invite-role="updateInviteRole"
        @delete-invite="requestDeleteInvite"
        @invite="inviteOpen = true"
        @delete-team="requestTeamAction('delete')"
        @leave-team="requestTeamAction('leave')"
      />

      <UiTeamsInviteDialog
        v-model:open="inviteOpen"
        :team-name="teamQuery.data.value.team.name"
        :sending="inviteMutation.isPending.value"
        @invite="inviteMutation.mutate"
      />

      <UiTeamsDeleteInviteDialog
        v-model:open="deleteInviteOpen"
        :invite="selectedInvite"
        :deleting="deleteInviteMutation.isPending.value"
        @confirm="confirmDeleteInvite"
      />

      <UiTeamsActionDialog
        v-model:open="teamActionOpen"
        :action="teamAction"
        :team-name="teamQuery.data.value.team.name"
        :pending="teamActionPending"
        @confirm="confirmTeamAction"
      />
    </template>
  </UiAppShell>
</template>

<style scoped>
.team-description :deep(p + p) {
  margin-top: 0.5rem;
}

.team-description :deep(ul) {
  list-style: disc;
  padding-inline-start: 1.25rem;
}

.team-description :deep(ol) {
  list-style: decimal;
  padding-inline-start: 1.25rem;
}

.team-description :deep(a) {
  color: var(--foreground);
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
