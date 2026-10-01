<script setup lang="ts">
const route = useRoute();
const username = computed(() => String(route.params.username || ""));

const {
  data: profileData,
  error: profileError,
  isPending: profilePending,
} = usePublicProfile(username);

const { data: eventsData, isPending: eventsPending } =
  usePublicEvents(username);

const profile = computed(() => profileData.value?.user);

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
    :class="isEmbed ? 'bg-transparent' : 'h-dvh overflow-y-auto bg-background'"
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
          :image="profile?.avatar ?? undefined"
          :name="profile?.name"
          :pending="profilePending"
          :show-theme-toggle="!isEmbed"
          :username="username"
        />

        <UiPublicProfileDescription
          :description="description"
          :pending="profilePending"
        />

        <UiPublicEventList
          :events="eventsData?.events ?? []"
          :is-embed="isEmbed"
          :pending="eventsPending"
          :username="username"
        />
      </template>

      <footer v-if="!isEmbed" class="booking-footer mt-4 px-2">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <img src="/logo.png" alt="" class="size-5 rounded" />
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
    color-mix(in oklch, var(--foreground) 12%, transparent) 1px,
    transparent 1.4px
  );
  background-size: 18px 18px;
  mask-image: linear-gradient(to bottom, #000, transparent);
  -webkit-mask-image: linear-gradient(to bottom, #000, transparent);
}
</style>
