<script setup lang="ts">
import type { Team } from "~/utils/api/teams";

const props = defineProps<{ team: Team }>();

const MAX = 4;

const members = computed(() => (props.team.members ?? []) as any[]);
const shown = computed(() => members.value.slice(0, MAX));
const extra = computed(() => members.value.length - MAX);
const count = computed(() => members.value.length || 1);

const memberName = (m: any, i: number) =>
  m.name ?? m.user?.name ?? m.email ?? `${props.team.id}-${i}`;
const memberImage = (m: any) => m.avatar_url ?? m.user?.avatar_url ?? undefined;

const description = computed(
  () =>
    props.team.description
      ?.replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim() || "A shared space for your team.",
);
</script>

<template>
  <NuxtLink
    :to="`/app/teams/${team.id}`"
    class="group flex min-h-40 flex-col rounded-2xl border border-border bg-card p-5 outline-none transition-colors hover:border-foreground/25 hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
  >
    <div class="flex items-center gap-3">
      <SharedAvatar
        :name="team.name"
        :image="team.avatar_url || undefined"
        class="size-10 shrink-0 border border-border"
      />
      <div class="min-w-0 flex-1">
        <h2 class="truncate text-[15px] font-semibold leading-tight">
          {{ team.name }}
        </h2>
        <p class="mt-0.5 truncate text-xs text-muted-foreground">
          /{{ team.slug }}
        </p>
      </div>
    </div>

    <div class="mt-auto flex items-center gap-2.5 pt-5">
      <div v-if="members.length" class="flex items-center">
        <SharedAvatar
          v-for="(m, i) in shown"
          :key="i"
          :name="memberName(m, i)"
          :image="memberImage(m)"
          class="size-7 border-2 border-card"
          :class="i > 0 && '-ml-2'"
        />
        <span
          v-if="extra > 0"
          class="-ml-2 flex size-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[11px] font-medium text-muted-foreground"
        >
          +{{ extra }}
        </span>
      </div>
      <span class="text-xs text-muted-foreground">
        {{ count }} {{ count === 1 ? "member" : "members" }}
      </span>
    </div>
  </NuxtLink>
</template>
