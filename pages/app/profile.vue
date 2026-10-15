<script setup lang="ts">
definePageMeta({ layout: false });
useHead({ title: "Profile" });

const auth = useAuth();
const user = computed(() => auth.user.value);
</script>

<template>
  <UiAppShell>
    <div class="mx-auto max-w-160">
      <div v-if="user" class="space-y-8">
        <UiProfileForm :user="user" />

        <UiProfileDangerZone />
      </div>
    </div>
  </UiAppShell>
</template>
