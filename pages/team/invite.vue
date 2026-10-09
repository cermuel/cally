<script setup lang="ts">
import { AlertCircleIcon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { getApiErrorMessage } from "~/utils/api/client";
import { queryKeys } from "~/utils/api/query-keys";
import { teamsApi } from "~/utils/api/teams";
import { helpers } from "~/utils/helpers";

definePageMeta({ layout: false });
useHead({ title: "Team invitation | Cally" });

const route = useRoute();
const apiClient = useApiClient();
const auth = useAuth();
const authReturnPath = useAuthReturnPath();
const queryClient = useQueryClient();

const invitationParams = computed(() => {
  const id = Number(route.query.id);
  const email = typeof route.query.email === "string" ? route.query.email : "";
  const token = typeof route.query.token === "string" ? route.query.token : "";

  if (!Number.isSafeInteger(id) || id < 1 || !helpers.validateEmail(email) || !token) {
    return null;
  }

  return { id, email, token };
});

const invitationPath = computed(() => route.fullPath);

const inviteQuery = useQuery({
  queryKey: computed(() => [
    ...queryKeys.teams.all(),
    "invitation",
    invitationParams.value?.id ?? "invalid",
    invitationParams.value?.email ?? "invalid",
  ]),
  queryFn: () => teamsApi.getInvite(apiClient, invitationParams.value!),
  enabled: computed(() => invitationParams.value !== null),
  retry: false,
});

const goToAuth = async (path: "/auth/login" | "/auth/register") => {
  const params = invitationParams.value;
  if (!params) return;

  authReturnPath.remember(invitationPath.value);
  await navigateTo({
    path,
    query: {
      email: params.email,
      redirect: invitationPath.value,
    },
  });
};

const switchAccount = async () => {
  auth.clearAuth();
  await goToAuth("/auth/login");
};

const acceptMutation = useMutation({
  mutationFn: () =>
    teamsApi.acceptInvite(
      apiClient,
      invitationParams.value!.id,
      invitationParams.value!.token,
    ),
  onSuccess: async () => {
    const teamId = inviteQuery.data.value!.invite.team_id;
    authReturnPath.take("/app/bookings");
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.members(teamId) }),
    ]);
    toast.success("Invitation accepted");
    await navigateTo(`/app/teams/${teamId}`);
  },
  onError: (error) => {
    toast.error(getApiErrorMessage(error, "Could not accept this invitation."));
  },
});

watch(
  [() => inviteQuery.data.value?.invite, () => auth.authState.value],
  async ([invite, authState]) => {
    if (!invite || authState !== "needs_onboarding") return;

    authReturnPath.remember(invitationPath.value);
    await navigateTo("/app/onboarding");
  },
  { immediate: true },
);

watch(
  () => inviteQuery.isError.value,
  (isError) => {
    if (isError) authReturnPath.clear(invitationPath.value);
  },
);
</script>

<template>
  <UiAuthCard
    v-if="!invitationParams"
    title="Invalid invitation"
    description="This invitation link is incomplete. Ask the team administrator to send a new invitation."
  >
    <SharedButton as-child class="w-full">
      <NuxtLink to="/">Return to Cally</NuxtLink>
    </SharedButton>
  </UiAuthCard>

  <UiAuthCard
    v-else-if="inviteQuery.isPending.value"
    title="Loading invitation"
    description="Please wait while we check your invitation."
  >
    <div class="flex justify-center py-5" aria-label="Loading invitation">
      <HugeiconsIcon
        :icon="Loading03Icon"
        :size="28"
        class="animate-spin text-primary"
        aria-hidden="true"
      />
    </div>
  </UiAuthCard>

  <UiAuthCard
    v-else-if="inviteQuery.isError.value || !inviteQuery.data.value?.invite"
    title="Invitation unavailable"
    description="This invitation is invalid, expired, or has already been used."
  >
    <div class="space-y-5">
      <div class="flex justify-center text-destructive" aria-hidden="true">
        <HugeiconsIcon :icon="AlertCircleIcon" :size="52" />
      </div>
      <SharedButton as-child variant="outline" class="w-full">
        <NuxtLink to="/">Return to Cally</NuxtLink>
      </SharedButton>
    </div>
  </UiAuthCard>

  <UiTeamsAcceptInviteCard
    v-else
    :invite="inviteQuery.data.value.invite"
    :signed-in-email="auth.token.value ? auth.user.value?.email : null"
    :accepting="acceptMutation.isPending.value"
    @sign-in="goToAuth('/auth/login')"
    @register="goToAuth('/auth/register')"
    @switch-account="switchAccount"
    @accept="acceptMutation.mutate"
  />
</template>
