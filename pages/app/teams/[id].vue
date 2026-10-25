<script setup lang="ts">
import { UserGroupIcon } from "@hugeicons/core-free-icons";
import {
  keepPreviousData,
  useQuery,
} from "@tanstack/vue-query";
import { queryKeys } from "~/utils/api/query-keys";
import {
  teamsApi,
  type TeamInvite,
  type TeamSearchParams,
} from "~/utils/api/teams";

definePageMeta({ layout: false });

const client = useApiClient();
const route = useRoute();
const router = useRouter();
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
const canManageBookings = computed(
  () => isOwner.value || currentMember.value?.role === "admin",
);
const meetingTimezone = computed(
  () =>
    auth.user.value?.timezone ||
    (import.meta.client
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC"),
);

useHead(() => ({
  title: teamQuery.data.value?.team
    ? `${teamQuery.data.value.team.name}`
    : "Team",
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

const requestDeleteInvite = (invite: TeamInvite) => {
  if (!canManageRoles.value) return;
  selectedInvite.value = invite;
  deleteInviteOpen.value = true;
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

const clearSelectedInvite = () => {
  selectedInvite.value = null;
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
            :team-id="teamId"
            :name="teamQuery.data.value.team.name"
            :editable="canManageRoles"
          />
          <UiTeamsMemberAvatars :members="teamMembers" />
        </div>
        <UiTeamsDescription
          :team-id="teamId"
          :description="teamQuery.data.value.team.description"
          :editable="canManageRoles"
        />
      </header>

      <UiTeamsDetailsTabs
        :team-id="teamId"
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
        :can-manage-bookings="canManageBookings"
        :timezone="meetingTimezone"
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
        :team-id="teamId"
        :team-name="teamQuery.data.value.team.name"
      />

      <UiTeamsDeleteInviteDialog
        v-model:open="deleteInviteOpen"
        :team-id="teamId"
        :invite="selectedInvite"
        @completed="clearSelectedInvite"
      />

      <UiTeamsResendInviteDialog
        v-model:open="resendInviteOpen"
        :team-id="teamId"
        :invite="selectedInvite"
        @completed="clearSelectedInvite"
      />

      <UiTeamsUpdateInviteRoleDialog
        v-model:open="updateInviteRoleOpen"
        :team-id="teamId"
        :invite="selectedInvite"
        @completed="clearSelectedInvite"
      />

      <UiTeamsActionDialog
        v-model:open="teamActionOpen"
        :team-id="teamId"
        :action="teamAction"
        :team-name="teamQuery.data.value.team.name"
      />
    </template>
  </UiAppShell>
</template>
