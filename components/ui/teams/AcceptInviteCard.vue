<script setup lang="ts">
import type { TeamInvite } from "~/utils/api/teams";

const props = defineProps<{
  accepting?: boolean;
  invite?: TeamInvite | null;
  loading?: boolean;
  signedInEmail?: string | null;
}>();

const emit = defineEmits<{
  accept: [];
  register: [];
  signIn: [];
  switchAccount: [];
}>();

const isLoading = computed(() => props.loading || !props.invite);

const teamName = computed(() => props.invite?.team?.name ?? "Cally team");
const dicebear = (seed: string) =>
  `https://api.dicebear.com/10.x/glass/svg?seed=${encodeURIComponent(seed)}`;

const avatarUrl = computed(
  () =>
    (props.invite?.team as { avatar_url?: string | null } | undefined)
      ?.avatar_url ?? null,
);
const avatarFailed = ref(false);
watch(avatarUrl, () => (avatarFailed.value = false));

const NAME_POOL = [
  "Ava",
  "Leo",
  "Maya",
  "Noah",
  "Zara",
  "Kai",
  "Nina",
  "Omar",
  "Ivy",
  "Theo",
  "Luna",
  "Felix",
  "Sofia",
  "Jonas",
  "Amara",
  "Dev",
];

const memberAvatars = computed(() => {
  let hash = 0;
  for (const char of teamName.value)
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;

  return [0, 1, 2].map((i) => {
    const name = NAME_POOL[(hash + i * 5) % NAME_POOL.length]!;
    return { name, src: dicebear(name) };
  });
});

const invitedEmailMatches = computed(
  () =>
    !!props.invite &&
    props.signedInEmail?.toLowerCase() === props.invite.email.toLowerCase(),
);

const now = ref<number | null>(null);
let timer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  now.value = Date.now();
  timer = setInterval(() => (now.value = Date.now()), 1000);
});
onBeforeUnmount(() => clearInterval(timer));

const msLeft = computed(() =>
  props.invite && now.value !== null
    ? new Date(props.invite.expires_at).getTime() - now.value
    : null,
);

const expired = computed(() => msLeft.value !== null && msLeft.value <= 0);

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "always" });

const expiresIn = computed(() => {
  if (msLeft.value === null) return null;
  if (msLeft.value <= 0) return "Expired";

  const seconds = Math.floor(msLeft.value / 1000);
  if (seconds < 60) return relative.format(Math.max(seconds, 1), "second");
  if (seconds < 3600)
    return relative.format(Math.floor(seconds / 60), "minute");
  if (seconds < 86400)
    return relative.format(Math.floor(seconds / 3600), "hour");
  return relative.format(Math.floor(seconds / 86400), "day");
});
</script>

<template>
  <UiAuthCard
    :title="isLoading ? 'Join the team' : `Join ${teamName}`"
    :description="
      isLoading ? '' : 'You have been invited to collaborate on Cally.'
    "
  >
    <!-- Loading -->
    <div v-if="isLoading" class="space-y-6" aria-busy="true">
      <span class="sr-only" role="status">Loading invitation</span>

      <div class="flex items-center gap-3">
        <div class="flex shrink-0 items-center -space-x-2">
          <div
            v-for="n in 3"
            :key="n"
            class="size-8 animate-pulse rounded-full bg-muted ring-2 ring-background"
          />
        </div>
        <div class="h-3.5 w-32 animate-pulse rounded bg-muted" />
      </div>

      <div class="divide-y divide-border border-y border-border">
        <div
          v-for="row in 2"
          :key="row"
          class="flex h-10 items-center justify-between"
        >
          <div class="h-3 w-20 animate-pulse rounded bg-muted" />
          <div class="h-3 w-32 animate-pulse rounded bg-muted" />
        </div>
      </div>

      <div class="h-9 w-full animate-pulse rounded-md bg-muted" />
    </div>

    <div v-else class="space-y-6">
      <div class="flex items-center gap-3">
        <img
          v-if="avatarUrl && !avatarFailed"
          :src="avatarUrl"
          :alt="teamName"
          class="size-9 shrink-0 rounded-lg border border-border bg-muted object-cover"
          @error="avatarFailed = true"
        />
        <div
          v-else
          class="flex shrink-0 items-center -space-x-2.5"
          aria-hidden="true"
        >
          <img
            v-for="member in memberAvatars"
            :key="member.name"
            :src="member.src"
            alt=""
            class="size-7 rounded-full bg-muted object-cover ring-[1.5px] ring-background"
          />
        </div>
        <p class="min-w-0 truncate text-sm font-medium">{{ teamName }}</p>
      </div>

      <dl class="divide-y divide-border border-y border-border text-sm">
        <div class="flex h-10 items-center justify-between gap-4">
          <dt class="text-muted-foreground">Invited email</dt>
          <dd class="min-w-0 truncate font-medium">{{ invite!.email }}</dd>
        </div>
        <div class="flex h-10 items-center justify-between gap-4">
          <dt class="text-muted-foreground">Expires</dt>
          <dd
            v-if="expiresIn"
            class="font-medium tabular-nums"
            :class="{ 'text-destructive': expired }"
          >
            {{ expiresIn }}
          </dd>
          <dd v-else class="h-3 w-24 animate-pulse rounded bg-muted" />
        </div>
      </dl>

      <p v-if="expired" class="text-sm leading-6 text-muted-foreground">
        This invitation is no longer valid. Ask a team admin to send a new one.
      </p>

      <div v-else-if="!signedInEmail" class="space-y-2">
        <SharedButton type="button" class="w-full" @click="emit('signIn')">
          Sign in to accept
        </SharedButton>
        <SharedButton
          type="button"
          variant="ghost"
          class="w-full"
          @click="emit('register')"
        >
          Create an account
        </SharedButton>
      </div>

      <div v-else-if="!invitedEmailMatches" class="space-y-4">
        <p class="text-sm leading-6 text-muted-foreground">
          You are signed in as
          <span class="font-medium text-foreground">{{ signedInEmail }}</span
          >. Switch to
          <span class="font-medium text-foreground">{{ invite!.email }}</span>
          to accept this invitation.
        </p>
        <SharedButton
          type="button"
          variant="outline"
          class="w-full"
          @click="emit('switchAccount')"
        >
          Switch account
        </SharedButton>
      </div>

      <SharedButton
        v-else
        type="button"
        class="w-full"
        :loading="accepting"
        @click="emit('accept')"
      >
        Accept invitation
      </SharedButton>
    </div>
  </UiAuthCard>
</template>
