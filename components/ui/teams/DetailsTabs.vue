<script setup lang="ts">
import { MailSend01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { TeamInvite, TeamMember } from "~/utils/api/teams";

defineProps<{
  teamId: number;
  members: TeamMember[];
  invites: TeamInvite[];
  ownerId: number;
  currentUserId?: number;
  canManageRoles: boolean;
  membersLoading: boolean;
  invitesLoading: boolean;
  membersSearching: boolean;
  invitesSearching: boolean;
  membersError: boolean;
  invitesError: boolean;
  isOwner: boolean;
  updatingInviteId?: number | null;
  resendingInviteId?: number | null;
  deletingInviteId?: number | null;
}>();

const emit = defineEmits<{
  resendInvite: [invite: TeamInvite];
  updateInviteRole: [invite: TeamInvite];
  deleteInvite: [invite: TeamInvite];
  searchMembers: [search: string];
  searchInvites: [search: string];
  invite: [];
  deleteTeam: [];
  leaveTeam: [];
}>();

const activeTab = ref("members");
const memberSearch = ref("");
const inviteSearch = ref("");

watch(memberSearch, (search) => emit("searchMembers", search));
watch(inviteSearch, (search) => emit("searchInvites", search));
</script>

<template>
  <SharedTabs class="w-full!" v-model="activeTab">
    <SharedTabsList class="mb-6">
      <SharedTabsTrigger value="members" class="flex-none px-4">
        Members
      </SharedTabsTrigger>
      <SharedTabsTrigger
        v-if="canManageRoles"
        value="invites"
        class="flex-none px-4"
      >
        Invites
      </SharedTabsTrigger>
      <SharedTabsTrigger value="meetings" class="flex-none px-4">
        Meetings
      </SharedTabsTrigger>
      <SharedTabsTrigger value="settings" class="flex-none px-4">
        Settings
      </SharedTabsTrigger>
    </SharedTabsList>

    <SharedTabsContent value="members">
      <div
        class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <SharedInput
          v-model="memberSearch"
          type="search"
          placeholder="Search members"
          aria-label="Search members"
          class="sm:max-w-xs"
          :loading="membersSearching"
        >
          <template #prefix>
            <span
              class="flex size-9 shrink-0 items-center justify-center text-muted-foreground"
            >
              <HugeiconsIcon
                :icon="Search01Icon"
                :size="16"
                :stroke-width="1.75"
                aria-hidden="true"
              />
            </span>
          </template>
        </SharedInput>
        <SharedButton
          v-if="canManageRoles"
          type="button"
          class="sm:ms-auto"
          @click="emit('invite')"
        >
          <HugeiconsIcon
            :icon="MailSend01Icon"
            :size="17"
            :stroke-width="1.75"
            aria-hidden="true"
          />
          Invite people
        </SharedButton>
      </div>
      <div
        v-if="membersError"
        role="alert"
        class="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive"
      >
        Could not load the team members.
      </div>
      <UiTeamsMembersTable
        v-else
        :team-id="teamId"
        :members="members"
        :owner-id="ownerId"
        :current-user-id="currentUserId"
        :can-manage-roles="canManageRoles"
        :loading="membersLoading"
      />
    </SharedTabsContent>

    <SharedTabsContent v-if="canManageRoles" value="invites">
      <div
        class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <SharedInput
          v-model="inviteSearch"
          type="search"
          placeholder="Search invites"
          aria-label="Search invites"
          class="sm:max-w-xs"
          :loading="invitesSearching"
        >
          <template #prefix>
            <span
              class="flex size-9 shrink-0 items-center justify-center text-muted-foreground"
            >
              <HugeiconsIcon
                :icon="Search01Icon"
                :size="16"
                :stroke-width="1.75"
                aria-hidden="true"
              />
            </span>
          </template>
        </SharedInput>
        <SharedButton
          v-if="canManageRoles"
          type="button"
          class="sm:ms-auto"
          @click="emit('invite')"
        >
          <HugeiconsIcon
            :icon="MailSend01Icon"
            :size="17"
            :stroke-width="1.75"
            aria-hidden="true"
          />
          Invite people
        </SharedButton>
      </div>
      <div
        v-if="invitesError"
        role="alert"
        class="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive"
      >
        Could not load the team invitations.
      </div>
      <UiTeamsInvitesTable
        v-else
        :invites="invites"
        :can-manage-roles="canManageRoles"
        :loading="invitesLoading"
        :resending-id="resendingInviteId"
        :updating-id="updatingInviteId"
        :deleting-id="deletingInviteId"
        @resend="emit('resendInvite', $event)"
        @update-role="emit('updateInviteRole', $event)"
        @delete="emit('deleteInvite', $event)"
      />
    </SharedTabsContent>

    <SharedTabsContent value="meetings">
      <div
        class="rounded-xl border border-dashed border-border px-6 py-14 text-center"
      >
        <p class="font-medium">Meetings are coming next</p>
        <p class="mt-1 text-sm text-muted-foreground">
          Team meetings will appear here.
        </p>
      </div>
    </SharedTabsContent>

    <SharedTabsContent value="settings">
      <UiTeamsDangerZone
        :is-owner="isOwner"
        @delete="emit('deleteTeam')"
        @leave="emit('leaveTeam')"
      />
    </SharedTabsContent>
  </SharedTabs>
</template>
