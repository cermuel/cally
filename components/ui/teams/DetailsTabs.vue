<script setup lang="ts">
import { MailSend01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { TeamInvite, TeamMember, TeamRole } from "~/utils/api/teams";

defineProps<{
  members: TeamMember[];
  invites: TeamInvite[];
  ownerId: number;
  currentUserId?: number;
  canManageRoles: boolean;
  membersLoading: boolean;
  invitesLoading: boolean;
  membersError: boolean;
  invitesError: boolean;
  isOwner: boolean;
  updatingMemberId?: number | null;
  updatingInviteId?: number | null;
  deletingInviteId?: number | null;
}>();

const emit = defineEmits<{
  updateMemberRole: [member: TeamMember, role: TeamRole];
  updateInviteRole: [invite: TeamInvite, role: TeamRole];
  deleteInvite: [invite: TeamInvite];
  invite: [];
  deleteTeam: [];
  leaveTeam: [];
}>();

const activeTab = ref("members");
const memberSearch = ref("");
const inviteSearch = ref("");

const updateMemberRole = (member: TeamMember, role: TeamRole) =>
  emit("updateMemberRole", member, role);

const updateInviteRole = (invite: TeamInvite, role: TeamRole) =>
  emit("updateInviteRole", invite, role);
</script>

<template>
  <SharedTabs class="w-full!" v-model="activeTab">
    <SharedTabsList class="mb-6">
      <SharedTabsTrigger value="members" class="flex-none px-4">
        Members
      </SharedTabsTrigger>
      <SharedTabsTrigger value="invites" class="flex-none px-4">
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
        <SharedButton type="button" class="sm:ms-auto" @click="emit('invite')">
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
        :members="members"
        :owner-id="ownerId"
        :current-user-id="currentUserId"
        :can-manage-roles="canManageRoles"
        :loading="membersLoading"
        :updating-id="updatingMemberId"
        @update-role="updateMemberRole"
      />
    </SharedTabsContent>

    <SharedTabsContent value="invites">
      <div
        class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <SharedInput
          v-model="inviteSearch"
          type="search"
          placeholder="Search invites"
          aria-label="Search invites"
          class="sm:max-w-xs"
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
        <SharedButton type="button" class="sm:ms-auto" @click="emit('invite')">
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
        :updating-id="updatingInviteId"
        :deleting-id="deletingInviteId"
        @update-role="updateInviteRole"
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
