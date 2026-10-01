<script setup lang="ts">
definePageMeta({ layout: false });
useHead({ title: "Connecting Google Calendar | Cally" });

const route = useRoute();
const googleOAuth = useGoogleOAuth();

onMounted(async () => {
  const returnPath = googleOAuth.takeReturnPath("/app/settings");
  const destination = new URL(returnPath, window.location.origin);

  if (route.query.google === "connected") {
    destination.searchParams.set("google", "connected");
  }

  await navigateTo(`${destination.pathname}${destination.search}`, {
    replace: true,
  });
});
</script>

<template>
  <UiAuthCard
    title="Connecting Google Calendar"
    description="Please wait while we return you to Cally."
  >
    <div class="flex justify-center py-5">
      <span
        class="size-6 animate-spin rounded-full border-2 border-muted border-t-primary"
      />
      <span class="sr-only">Returning to Cally</span>
    </div>
  </UiAuthCard>
</template>
