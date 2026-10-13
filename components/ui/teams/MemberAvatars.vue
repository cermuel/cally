<script setup lang="ts">
import type { TeamMember } from "~/utils/api/teams";

const props = defineProps<{
  members: TeamMember[];
}>();

const MAX = 4;
const memberName = (member: TeamMember) =>
  member.user?.name || member.user?.email || "Team member";
const extra = computed(() => Math.max(props.members.length - MAX, 0));
</script>

<template>
  <div v-if="members.length" class="group flex shrink-0 items-center gap-2">
    <ul class="flex items-center" aria-label="Team members">
      <li
        v-for="member in members.slice(0, MAX)"
        :key="member.id"
        :title="memberName(member)"
        class="-ms-1.5 transition-[margin] duration-200 ease-out first:ms-0 group-hover:-ms-0.5 first:group-hover:ms-0"
      >
        <SharedAvatar
          :name="memberName(member)"
          :image="member.user?.avatar || undefined"
          class="size-6 border-2 border-background bg-muted"
        />
      </li>
      <li
        v-if="extra"
        class="-ms-1.5 grid size-6 place-items-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground transition-[margin] duration-200 ease-out group-hover:-ms-0.5"
      >
        +{{ extra }}
      </li>
    </ul>
    <span class="hidden text-xs text-muted-foreground sm:inline">
      {{ members.length }} {{ members.length === 1 ? "member" : "members" }}
    </span>
  </div>
</template>
