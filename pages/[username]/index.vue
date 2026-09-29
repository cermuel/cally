<script setup lang="ts">
import { publicApi } from "~/utils/api/public";
import { mapPublicEvent, mapPublicProfile } from "~/utils/public-booking";

const route = useRoute();
const apiClient = useApiClient();
const username = computed(() => String(route.params.username || ""));

const {
  data: profile,
  error: profileError,
  pending: profilePending,
} = await useAsyncData(
  () => `public-profile-${username.value}`,
  async () => {
    const response = await publicApi.profile(apiClient, username.value);
    return mapPublicProfile(response.user);
  },
  { server: false, watch: [username] },
);

const { data: eventsData, pending: eventsPending } = await useAsyncData(
  () => `public-events-${username.value}`,
  async () => {
    const response = await publicApi.events(apiClient, username.value);
    return response.events.map(mapPublicEvent);
  },
  { server: false, watch: [username] },
);

const isEmbed = computed(() =>
  ["true", "1"].includes(String(route.query.embed)),
);
const root = ref<HTMLElement | null>(null);
let resizeObserver: ResizeObserver | undefined;

onMounted(() => {
  if (!isEmbed.value || window.parent === window || !root.value) return;
  const el = root.value;
  const postHeight = () =>
    window.parent.postMessage(
      { source: "cally", type: "resize", height: el.offsetHeight },
      "*",
    );
  resizeObserver = new ResizeObserver(postHeight);
  resizeObserver.observe(el);
  postHeight();
});
onBeforeUnmount(() => resizeObserver?.disconnect());
const isProfileNotFound = computed(() => {
  const error = profileError.value as {
    status?: number;
    statusCode?: number;
    data?: { statusCode?: number };
    response?: { status?: number };
  } | null;

  return (
    error?.statusCode === 404 ||
    error?.status === 404 ||
    error?.response?.status === 404 ||
    error?.data?.statusCode === 404
  );
});
const pageTitle = computed(() =>
  profile.value
    ? `${profile.value.name} | Cally`
    : `@${username.value} | Cally`,
);

const description = computed(() => profile.value?.description ?? "");
const registrationPath = computed(
  () => `/auth/register?username=${encodeURIComponent(username.value)}`,
);

useHead(() => ({
  title: pageTitle.value,
  htmlAttrs: { style: isEmbed.value ? "background:transparent" : undefined },
  bodyAttrs: { style: isEmbed.value ? "background:transparent" : undefined },
}));
</script>

<template>
  <main
    ref="root"
    class="relative text-foreground antialiased"
    :class="
      isEmbed ? 'bg-transparent' : 'h-dvh overflow-y-auto bg-[#0d0d0d]'
    "
  >
    <div
      v-if="!isEmbed"
      class="page-dots pointer-events-none absolute inset-x-0 top-0 h-80"
      aria-hidden="true"
    />

    <section
      class="relative mx-auto flex w-full max-w-xl flex-col"
      :class="isEmbed ? 'p-1' : 'min-h-full px-5 pt-16 pb-10 sm:pt-24'"
    >
      <UiPublicAvailableUsername
        v-if="isProfileNotFound"
        :registration-path="registrationPath"
        :username="username"
      />

      <template v-else>
        <UiPublicProfileHeader
          :image="profile?.image"
          :name="profile?.name"
          :pending="profilePending"
          :username="username"
        />

        <UiPublicProfileDescription
          :description="description"
          :pending="profilePending"
        />

        <UiPublicEventList
          :events="eventsData ?? []"
          :is-embed="isEmbed"
          :pending="eventsPending"
          :username="username"
        />
      </template>

      <footer v-if="!isEmbed" class="mt-auto pt-16">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1.5 text-xs text-white/30 transition-colors hover:text-white/60"
        >
          Powered by
          <img src="/logo.png" alt="" class="size-4 rounded" />
          <span class="font-medium">Cally</span>
        </NuxtLink>
      </footer>
    </section>
  </main>
</template>

<style scoped>
.page-dots {
  background-image: radial-gradient(
    circle,
    rgb(255 255 255 / 0.12) 1px,
    transparent 1.4px
  );
  background-size: 18px 18px;
  mask-image: linear-gradient(to bottom, #000, transparent);
  -webkit-mask-image: linear-gradient(to bottom, #000, transparent);
}
</style>
