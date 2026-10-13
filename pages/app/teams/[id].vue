<script setup lang="ts">
import { UserGroupIcon } from "@hugeicons/core-free-icons";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import UiTeamsResendInviteDialog from "~/components/ui/teams/ResendInviteDialog.vue";
import { getApiErrorMessage } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";
import {
  teamsApi,
  type CreateTeamInvitesPayload,
  type TeamInvite,
  type TeamMember,
  type TeamRole,
  type TeamSearchParams,
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
const resendInviteOpen = ref(false);
const updateInviteRoleOpen = ref(false);
const deleteInviteOpen = ref(false);
const selectedInvite = ref<TeamInvite | null>(null);
const updatingMemberId = ref<number | null>(null);
const updatingInviteId = ref<number | null>(null);
const resendingInviteId = ref<number | null>(null);
const teamActionOpen = ref(false);
const teamAction = ref<"delete" | "leave">("leave");
const memberSearch = ref("");
const inviteSearch = ref("");
const membersSearching = ref(false);
const invitesSearching = ref(false);

const memberParams = computed<TeamSearchParams>(() => ({
  page: 1,
  ...(memberSearch.value ? { search: memberSearch.value } : {}),
}));
const inviteParams = computed<TeamSearchParams>(() => ({
  page: 1,
  ...(inviteSearch.value ? { search: inviteSearch.value } : {}),
}));

const membersQuery = useQuery({
  queryKey: computed(() =>
    queryKeys.teams.members(teamId.value ?? "none", memberParams.value),
  ),
  queryFn: () =>
    teamsApi.listMembers(client, teamId.value!, memberParams.value),
  enabled: computed(() => teamId.value !== null),
  placeholderData: keepPreviousData,
});

const invitesQuery = useQuery({
  queryKey: computed(() =>
    queryKeys.teams.invites(teamId.value ?? "none", inviteParams.value),
  ),
  queryFn: () =>
    teamsApi.listInvites(client, teamId.value!, inviteParams.value),
  enabled: computed(() => teamId.value !== null),
  placeholderData: keepPreviousData,
});

const members = computed(
  () =>
    membersQuery.data.value?.members ??
    teamQuery.data.value?.team.members ??
    [],
);
const invites = computed(() => invitesQuery.data.value?.invites ?? []);
const teamMembers = computed(
  () => teamQuery.data.value?.team.members ?? members.value,
);
const currentMember = computed(() =>
  teamMembers.value.find((member) => member.user_id === auth.user.value?.id),
);
const canManageRoles = computed(() => currentMember.value?.role === "admin");
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

let memberSearchTimer: ReturnType<typeof setTimeout> | undefined;
let inviteSearchTimer: ReturnType<typeof setTimeout> | undefined;

const searchMembers = (value: string) => {
  if (memberSearchTimer) clearTimeout(memberSearchTimer);
  memberSearchTimer = setTimeout(() => {
    const search = value.trim();
    if (search === memberSearch.value) return;
    membersSearching.value = true;
    memberSearch.value = search;
  }, 300);
};

const searchInvites = (value: string) => {
  if (inviteSearchTimer) clearTimeout(inviteSearchTimer);
  inviteSearchTimer = setTimeout(() => {
    const search = value.trim();
    if (search === inviteSearch.value) return;
    invitesSearching.value = true;
    inviteSearch.value = search;
  }, 300);
};

watch(
  () => membersQuery.isFetching.value,
  (isFetching) => {
    if (!isFetching) membersSearching.value = false;
  },
);
watch(
  () => invitesQuery.isFetching.value,
  (isFetching) => {
    if (!isFetching) invitesSearching.value = false;
  },
);
onBeforeUnmount(() => {
  if (memberSearchTimer) clearTimeout(memberSearchTimer);
  if (inviteSearchTimer) clearTimeout(inviteSearchTimer);
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

const updateDescriptionMutation = useMutation({
  mutationFn: (description: string | null) =>
    teamsApi.update(client, teamId.value!, { description }),
  onSuccess: async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.detail(teamId.value!),
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() }),
    ]);
    toast.success("Team description updated");
  },
  onError: (error) =>
    toast.error(
      getApiErrorMessage(error, "Could not update the team description."),
    ),
});

const updateNameMutation = useMutation({
  mutationFn: (name: string) =>
    teamsApi.update(client, teamId.value!, { name }),
  onSuccess: async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.detail(teamId.value!),
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() }),
    ]);
    toast.success("Team name updated");
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not update the team name.")),
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
    updateInviteRoleOpen.value = false;
    selectedInvite.value = null;
    toast.success("Invitation role updated");
  },
  onError: (error) =>
    toast.error(
      getApiErrorMessage(error, "Could not update the invitation role."),
    ),
  onSettled: () => {
    updatingInviteId.value = null;
  },
});

const resendInviteMutation = useMutation({
  mutationFn: (invite: TeamInvite) =>
    teamsApi.invite(client, teamId.value!, {
      users: [{ email: invite.email, role: invite.role }],
    }),
  onMutate: (invite) => {
    resendingInviteId.value = invite.id;
  },
  onSuccess: async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.teams.invites(teamId.value!),
    });
    resendInviteOpen.value = false;
    selectedInvite.value = null;
    toast.success("Invitation resent");
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not resend the invitation.")),
  onSettled: () => {
    resendingInviteId.value = null;
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
    toast.success("Invitation revoked");
  },
  onError: (error) =>
    toast.error(getApiErrorMessage(error, "Could not revoke the invitation.")),
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

const updateDescription = (description: string | null) => {
  if (!canManageRoles.value) return;
  updateDescriptionMutation.mutate(description);
};

const updateName = (name: string) => {
  if (!canManageRoles.value) return;
  updateNameMutation.mutate(name);
};

const requestUpdateInviteRole = (invite: TeamInvite) => {
  if (!canManageRoles.value) return;
  selectedInvite.value = invite;
  updateInviteRoleOpen.value = true;
};

const requestResendInvite = (invite: TeamInvite) => {
  if (!canManageRoles.value) return;
  selectedInvite.value = invite;
  resendInviteOpen.value = true;
};

const confirmResendInvite = () => {
  if (!selectedInvite.value || !canManageRoles.value) return;
  resendInviteMutation.mutate(selectedInvite.value);
};

const confirmUpdateInviteRole = (role: TeamRole) => {
  if (!selectedInvite.value || !canManageRoles.value) return;
  updateInviteMutation.mutate({ invite: selectedInvite.value, role });
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
  if (
    (action === "delete" && !isOwner.value) ||
    (action === "leave" && isOwner.value)
  ) {
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
    <div
      v-if="teamQuery.isPending.value"
      class="space-y-5"
      aria-label="Loading team"
    >
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
      <header class="mb-8 border-b border-border pb-6">
        <div class="flex items-center justify-between gap-4">
          <UiTeamsTitle
            :name="teamQuery.data.value.team.name"
            :editable="canManageRoles"
            :saving="updateNameMutation.isPending.value"
            @save="updateName"
          />
          <UiTeamsMemberAvatars :members="teamMembers" />
        </div>
        <UiTeamsDescription
          :description="teamQuery.data.value.team.description"
          :editable="canManageRoles"
          :saving="updateDescriptionMutation.isPending.value"
          @save="updateDescription"
        />
      </header>

      <UiTeamsDetailsTabs
        :members="members"
        :invites="invites"
        :owner-id="teamQuery.data.value.team.owner_id"
        :current-user-id="auth.user.value?.id"
        :can-manage-roles="canManageRoles"
        :members-loading="membersQuery.isPending.value"
        :invites-loading="invitesQuery.isPending.value"
        :members-searching="membersSearching"
        :invites-searching="invitesSearching"
        :members-error="membersQuery.isError.value"
        :invites-error="invitesQuery.isError.value"
        :is-owner="isOwner"
        :updating-member-id="updatingMemberId"
        :updating-invite-id="updatingInviteId"
        :resending-invite-id="resendingInviteId"
        :deleting-invite-id="
          deleteInviteMutation.isPending.value ? selectedInvite?.id : null
        "
        @update-member-role="updateMemberRole"
        @resend-invite="requestResendInvite"
        @update-invite-role="requestUpdateInviteRole"
        @delete-invite="requestDeleteInvite"
        @search-members="searchMembers"
        @search-invites="searchInvites"
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

      <UiTeamsResendInviteDialog
        v-model:open="resendInviteOpen"
        :invite="selectedInvite"
        :resending="resendInviteMutation.isPending.value"
        @confirm="confirmResendInvite"
      />

      <UiTeamsUpdateInviteRoleDialog
        v-model:open="updateInviteRoleOpen"
        :invite="selectedInvite"
        :updating="updateInviteMutation.isPending.value"
        @confirm="confirmUpdateInviteRole"
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
