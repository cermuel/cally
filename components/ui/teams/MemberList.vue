<script setup lang="ts">
import { CrownIcon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { Team } from "~/utils/api/teams";

defineProps<{ team: Team }>();
</script>

<template>
  <section class="rounded-xl border border-border bg-card shadow-xs">
    <header class="flex items-center justify-between border-b border-border px-5 py-4">
      <div>
        <h2 class="font-semibold">Members</h2>
        <p class="mt-0.5 text-sm text-muted-foreground">
          Everyone with access to this team.
        </p>
      </div>
      <span class="text-sm text-muted-foreground">
        {{ team.members?.length ?? 0 }}
      </span>
    </header>

    <div v-if="team.members?.length" class="divide-y divide-border">
      <div
        v-for="member in team.members"
        :key="member.id"
        class="flex items-center gap-3 px-5 py-4"
      >
        <SharedAvatar
          :name="member.user?.name || member.user?.email || 'Team member'"
          :image="member.user?.avatar || undefined"
          class="size-9 border border-border"
        />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">
            {{ member.user?.name || member.user?.email || "Team member" }}
          </p>
          <p
            v-if="member.user?.name && member.user.email"
            class="truncate text-xs text-muted-foreground"
          >
            {{ member.user.email }}
          </p>
        </div>
        <span
          class="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs capitalize text-muted-foreground"
        >
          <HugeiconsIcon
            v-if="member.user_id === team.owner_id"
            :icon="CrownIcon"
            :size="13"
            :stroke-width="1.75"
            aria-hidden="true"
          />
          {{ member.user_id === team.owner_id ? "Owner" : member.role }}
        </span>
      </div>
    </div>

    <div v-else class="flex flex-col items-center px-5 py-10 text-center">
      <span class="flex size-10 items-center justify-center rounded-full bg-muted">
        <HugeiconsIcon
          :icon="UserGroupIcon"
          :size="20"
          :stroke-width="1.75"
          class="text-muted-foreground"
          aria-hidden="true"
        />
      </span>
      <p class="mt-3 text-sm font-medium">No members to show yet</p>
    </div>
  </section>
</template>
