<script setup lang="ts">
import type { TeamMember } from "~/utils/api/teams";

defineProps<{
  members: TeamMember[];
}>();

const memberName = (member: TeamMember) =>
  member.user?.name || member.user?.email || "Team member";
</script>

<template>
  <ul
    v-if="members.length"
    class="flex shrink-0 items-center ps-2"
    aria-label="Team members"
  >
    <li
      v-for="member in members.slice(0, 4)"
      :key="member.id"
      class="-ms-2 first:ms-0"
    >
      <SharedAvatar
        :name="memberName(member)"
        :image="member.user?.avatar || undefined"
        class="size-10 border-2 border-background bg-muted"
      />
    </li>
  </ul>
</template>
